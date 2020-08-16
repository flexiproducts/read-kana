import React from 'react'
import {usePersistReducer} from 'use-persist'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {sample, some} from 'lodash'
import hiraganaMap from './src/lib/hiragana'
import katakanaMap from './src/lib/katakana'
import {useHotkeys} from 'react-hotkeys-hook'
import wordData from './words.json'
import {fromKana, toHiragana, toKatakana, containsHiragana} from 'hepburn'
import Speech from 'speak-tts'
import Layout from './src/Layout'
import {Howl} from 'howler'

const correctSound = new Howl({
  src: ['blip.mp3']
})

const speech = new Speech()
speech.init({lang: 'ja'}).catch(console.error)

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

const initialState = {
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

function App() {
  const [state, dispatch] = usePersistReducer(
    {key: 'app'},
    reducer,
    initialState,
    init
  )
  const {current, input, isWrong, isRevealing, settings} = state

  useHotkeys(
    'enter',
    () => dispatch({type: 'onPressEnter'}),
    {filter: () => true},
    [dispatch]
  )

  if (!some(settings)) {
    return (
      <Layout
        {...{
          settings,
          setSettings,
          numberCorrect: state.correct
        }}
      >
        <Info>pls select something 😔</Info>
      </Layout>
    )
  }

  return (
    <Layout {...{settings, setSettings, numberCorrect: state.correct}}>
      <Prompt>{current.kana}</Prompt>
      <WordInfo>
        {current.meaning ? `${current.meaning} (${current.expression})` : ' '}
      </WordInfo>
      <TextInputContainer>
        {isRevealing ? (
          <Reveal>{current.romaji.toLowerCase()}</Reveal>
        ) : (
          <TextInput
            autoFocus
            type="text"
            placeholder="Type in Romaji"
            value={input}
            onChange={(e) => dispatch({type: 'input', value: e.target.value})}
          />
        )}
      </TextInputContainer>
      <Validation>
        <div>{isWrong ? ` ❌ ${isWrong}` : ' '}</div>
        <div>
          <RevealButton onClick={toggleReveal}>
            {isRevealing ? 'solve' : 'see answer'}
          </RevealButton>
        </div>
      </Validation>
    </Layout>
  )

  function setSettings(settings) {
    dispatch({type: 'setSettings', settings})
  }

  function toggleReveal() {
    dispatch({type: 'toggleReveal'})
  }
}

function reducer(state, action) {
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

function init(state) {
  return {current: getPrompt(state.settings), input: '', ...state}
}

const Prompt = styled.div`
  font-size: 5em;
`

const TextInput = styled.input`
  all: unset;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
`

const Validation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 2em;
`

const RevealButton = styled.button`
  text-decoration: none;
  color: white;
  padding: 4px 12px;
  display: inline-block;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.21);
  border-bottom: 4px solid rgba(0, 0, 0, 0.21);
  cursor: pointer;
  border-radius: 4px;
  margin: 10px;
  background: linear-gradient(
    to bottom,
    rgba(203, 153, 197, 1) 0%,
    rgba(181, 134, 176, 1) 100%
  );
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);

  :active {
    background: #bd8eb7;
  }

  :focus {
    outline: 0;
  }

  @media (max-width: 812px) {
    padding: 8px 24px;
    font-size: 0.8em;
  }
`

const TextInputContainer = styled.div`
  height: 60px;
  @media (max-width: 812px) {
    width: 100%;
    font-size: 1.2em;
  }
`

const Reveal = styled.div`
  font-size: 2em;
  text-align: center;
`

const Info = styled.div`
  font-size: 3em;
  text-align: center;
`

const WordInfo = styled.div`
  padding-bottom: 20px;
  height: 20px;
  font-style: italic;
`

ReactDOM.render(<App />, document.getElementById('app'))
