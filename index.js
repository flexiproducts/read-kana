import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {sample, invert, keyBy} from 'lodash'
import hiraganaMap from './lib/hiragana'
import katakanaMap from './lib/katakana'
import {useHotkeys} from 'react-hotkeys-hook'
import useSimpleAudio from 'use-simple-audio'
import wordData from './words.json'
import {fromKana, toHiragana, toKatakana, containsHiragana} from 'hepburn'

const hiraganaByRomaji = invert(hiragana)
const katakanaByRomaji = invert(katakana)

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
  romaji: fromKana(data['Vocab-kana']),
  kana: data['Vocab-kana'],
  expression: data['Vocab-expression']
}))

function App() {
  const [hiraganaEnabled, setHiraganaEnabled] = useState(true)
  const [katakanaEnabled, setKatakanaEnabled] = useState(true)
  const [wordsEnabled, setWordsEnabled] = useState(true)

  const [current, setCurrent] = useState(getPrompt())
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [numberCorrect, setNumberCorrect] = useState(0)
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

  if (input.trim() === '?') {
    setInput('')
    setIsRevealing(true)
  }

  if (input.trim().length === current.romaji.length) {
    if (input.toLowerCase().trim() === current.romaji.toLowerCase()) {
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
      {!hiraganaEnabled && !katakanaEnabled && !wordsEnabled ? (
        <Info>pls select something 😔</Info>
      ) : (
        <>
          <Prompt>{current.kana}</Prompt>
          <WordInfo>
            {current.meaning
              ? `${current.meaning} (${current.expression})`
              : ' '}
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
                {isRevealing ? 'solve' : 'reveal'}
              </RevealButton>
            </div>
          </Validation>
          <div>✅ {numberCorrect}</div>
        </>
      )}
      <Settings>
        <div>
          <label>
            <input
              type="checkbox"
              checked={hiraganaEnabled}
              onChange={() => setHiraganaEnabled((before) => !before)}
            />
            hiragana
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={katakanaEnabled}
              onChange={() => setKatakanaEnabled((before) => !before)}
            />
            katakana
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={wordsEnabled}
              onChange={() => setWordsEnabled((before) => !before)}
            />
            words
          </label>
        </div>
      </Settings>
    </Center>
  )

  function getPrompt() {
    const category = sample(
      [
        hiraganaEnabled && hiragana,
        katakanaEnabled && katakana,
        wordsEnabled && words
      ].filter((list) => list)
    )

    return sample(category)
  }
}

const Settings = styled.div`
  position: fixed;
  padding: 5px;
  bottom: 0;
  left: 0;

  label,
  input {
    display: inline-block;
    vertical-align: middle;
  }
`

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
  margin: 10px;
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

ReactDOM.render(<App />, document.getElementById('app'))
