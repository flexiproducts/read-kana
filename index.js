import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {sample, some} from 'lodash'
import hiraganaMap from './lib/hiragana'
import katakanaMap from './lib/katakana'
import {useHotkeys} from 'react-hotkeys-hook'
import useSimpleAudio from 'use-simple-audio'
import wordData from './words.json'
import {fromKana, toHiragana, toKatakana, containsHiragana} from 'hepburn'
import {useLocalStorage} from '@overmise/use-local-storage'
import Settings from './Settings'
import Speech from 'speak-tts'

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
  romaji: fromKana(data['Vocab-kana']).replace('ē', 'ee').replace('ō', 'oo'),
  kana: data['Vocab-kana'],
  expression: data['Vocab-expression']
}))

function App() {
  const [settings, setSettings] = useLocalStorage('settings', {
    hiragana: true,
    katakana: true,
    words: true
  })

  const [current, setCurrent] = useState(getPrompt())
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [numberCorrect, setNumberCorrect] = useLocalStorage('correct-number', 0)
  const {play} = useSimpleAudio('blip.mp3')

  useHotkeys(
    'enter',
    () => {
      if (isRevealing) {
        setIsRevealing(false)
      }
    },
    [isRevealing]
  )

  useEffect(() => {
    setCurrent(getPrompt())
  }, [settings.hiragana, settings.katakana, settings.words])

  if (!some(settings) || !current) {
    return (
      <Center>
        <Info>pls select something 😔</Info>
        <Settings {...{settings, setSettings}} />
      </Center>
    )
  }

  if (input.trim() === '?') {
    setInput('')
    setIsRevealing(true)
  }

  if (input.trim().length === current.romaji.length) {
    if (input.toLowerCase().trim() === current.romaji.toLowerCase()) {
      speech.speak({text: current.kana})
      setNumberCorrect((number) => number + 1)
      setInput('')
      setCurrent(getPrompt())
      setIsWrong(false)
      play()
    } else {
      setInput('')
      const romaji = input.trim().toUpperCase()

      const usedKana = containsHiragana(current.kana)
        ? toHiragana(romaji)
        : toKatakana(romaji)

      setIsWrong(`${romaji.toLowerCase()} (${usedKana || ''})`)
    }
  }

  function toggleReveal() {
    setIsRevealing(!isRevealing)
  }

  return (
    <Center>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
      <Stats>🔥 {numberCorrect}</Stats>
      <Settings {...{settings, setSettings}} />
    </Center>
  )

  function getPrompt() {
    const category = sample(
      [
        settings.hiragana && hiragana,
        settings.katakana && katakana,
        settings.words && words
      ].filter((list) => list)
    )

    return sample(category)
  }
}

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  font-family: sans-serif;
`

const Prompt = styled.div`
  font-size: 5em;
`

const TextInput = styled.input`
  all: unset;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
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
`

const TextInputContainer = styled.div`
  height: 60px;
`

const Reveal = styled.div`
  font-size: 2em;
`

const Info = styled.div`
  font-size: 3em;
`

const WordInfo = styled.div`
  padding-bottom: 20px;
  height: 20px;
  font-style: italic;
`

const Stats = styled.div`
  position: fixed;
  bottom: 5px;
  right: 20px;
`

ReactDOM.render(<App />, document.getElementById('app'))
