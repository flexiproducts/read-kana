import {sample} from 'lodash'
import {fromKana, toHiragana, toKatakana, containsHiragana} from 'hepburn'
import {Howl} from 'howler'
import wordData from '../words.json'
import hiraganaMap from './lib/hiragana'
import katakanaMap from './lib/katakana'
import Speech from 'speak-tts'

export const initialState = {
  input: '',
  isWrong: false,
  isRevealing: false,
  correct: 0,
  settings: {
    hiragana: true,
    katakana: true,
    words: false
  }
}

const correctSound = new Howl({
  src: ['blip.mp3']
})

const hiragana = Object.entries(hiraganaMap).map(([kana, romaji]) => ({
  kana,
  romaji
}))
const katakana = Object.entries(katakanaMap).map(([kana, romaji]) => ({
  kana,
  romaji
}))

const words = wordData.map((data) => ({
  meaning: data['Vocab-meaning'],
  romaji: fromKana(data['Vocab-kana'])
    .replace('ē', 'ee')
    .replace('ō', 'oo')
    .replace("'", ''),
  kana: data['Vocab-kana'],
  expression: data['Vocab-expression']
}))

const speech = new Speech()
speech.init({lang: 'ja'}).catch(console.error)

export function reducer(state, action) {
  const {input, current, settings, isRevealing, correct} = state

  console.log(action.type)

  if (action.type === 'newPrompt') {
    return {
      ...state,
      settings: action.settings || settings
    }
  }

  if (
    action.type === 'toggleReveal' ||
    (action.type === 'onPressEnter' && isRevealing)
  ) {
    return {
      ...state,
      input: '',
      isRevealing: !isRevealing
    }
  }

  if (action.type === 'input') {
    if (isCorrect(action.value, current)) return onCorrect()
    if (action.value.includes('?')) return {...state, isRevealing: true}

    return {
      ...state,
      input: action.value
    }
  }

  if (action.type === 'onPressEnter' && !isRevealing) {
    if (input.length === 0)
      return {
        ...state,
        isWrong: false
      }
    if (isCorrect(input, current)) return onCorrect()
    return onFailure()
  }

  if (action.type === 'setSettings') {
    return {
      ...state,
      current: getPrompt(action.settings) || current,
      settings: action.settings
    }
  }

  return state

  function onCorrect() {
    correctSound.play()
    speech.speak({text: current.kana})
    return {
      ...state,
      correct: correct + 1,
      current: getPrompt(settings),
      isWrong: false,
      input: ''
    }
  }

  function onFailure() {
    const romaji = input.trim().toUpperCase()
    const usedKana = containsHiragana(current.kana)
      ? toHiragana(romaji)
      : toKatakana(romaji)
    return {
      ...state,
      isWrong: `${romaji.toLowerCase()} (${usedKana || ''})`,
      setInput: ''
    }
  }
}

function isCorrect(input, current) {
  return input.toLowerCase().trim() === current.romaji.toLowerCase()
}

function getPrompt(settings) {
  const category = sample(
    [
      settings.hiragana && hiragana,
      settings.katakana && katakana,
      settings.words && words
    ].filter((list) => list)
  )

  return sample(category)
}

export function init(state) {
  return {current: getPrompt(state.settings), input: '', ...state}
}
