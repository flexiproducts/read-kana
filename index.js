import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {sample, invert} from 'lodash'
import hiragana from './lib/hiragana'
import katakana from './lib/katakana'
import {useHotkeys} from 'react-hotkeys-hook'
import useSimpleAudio from 'use-simple-audio'

const hiraganaByRomaji = invert(hiragana)
const katakanaByRomaji = invert(katakana)

function App() {
  const [hiraganaEnabled, setHiraganaEnabled] = useState(true)
  const [katakanaEnabled, setKatakanaEnabled] = useState(true)
  const [current, setCurrent] = useState(getNewCharacter())
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

  if (input.trim().length === current[1].length) {
    if (input.toLowerCase().trim() === current[1].toLowerCase()) {
      setNumberCorrect((number) => number + 1)
      setInput('')
      setCurrent(getNewCharacter())
      setIsWrong(false)
      play()
    } else {
      setInput('')
      const romaji = input.trim().toUpperCase()
      const usedKana = hiragana[current]
        ? hiraganaByRomaji[romaji]
        : katakanaByRomaji[romaji]
      setIsWrong(`${romaji.toLowerCase()} (${usedKana || ''})`)
    }
  }

  function toggleReveal() {
    setIsRevealing(!isRevealing)
  }

  return (
    <Center>
      {!hiraganaEnabled && !katakanaEnabled ? (
        <Info>pls select something 😔</Info>
      ) : (
        <>
          <Prompt>{current[0]}</Prompt>
          <TextInputContainer>
            {isRevealing ? (
              <Reveal>{current[1].toLowerCase()}</Reveal>
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
            ひらがな
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={katakanaEnabled}
              onChange={() => setKatakanaEnabled((before) => !before)}
            />
            カタカナ
          </label>
        </div>
      </Settings>
    </Center>
  )

  function getNewCharacter() {
    return sample(
      Object.entries({
        ...(hiraganaEnabled ? hiragana : {}),
        ...(katakanaEnabled ? katakana : {})
      })
    )
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

ReactDOM.render(<App />, document.getElementById('app'))
