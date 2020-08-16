import React from 'react'
import {usePersistReducer} from 'use-persist'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import {some} from 'lodash'
import {useHotkeys} from 'react-hotkeys-hook'
import Layout from './src/Layout'
import {reducer, init, initialState} from './src/state'

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
