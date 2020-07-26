import React, {useState, useEffect} from "react"
import ReactDOM from "react-dom"
import styled from 'styled-components'
import {sample} from 'lodash'
import {monographs} from './lib/hiragana'
import {useHotkeys} from 'react-hotkeys-hook'

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
    height: 1em;
`

const RevealButton = styled.button`
    margin: 10px;
`

const TextInputContainer = styled.div`
    height: 60px;
`

const Reveal = styled.div`
    font-size: 1.2em;
`


function App () {
    const [current, setCurrent] = useState(getNewCharacter())
    const [input, setInput] = useState('')
    const [isWrong, setIsWrong] = useState(false)
    const [isRevealing, setIsRevealing] = useState(false)
    useHotkeys('enter', () => { 
        console.log('test', isRevealing)
        if (isRevealing) {
            setIsRevealing(false)
        }
    }, [isRevealing])

    if (input.trim() === '?') {
        setInput('')
        setIsRevealing(true)
    }

    if (input.trim().length === current[1].length) {
        if (input.toLowerCase().trim() === current[1].toLowerCase()) {
            setInput('')
            setCurrent(getNewCharacter())
            setIsWrong(false)   
        } else {
            setInput('')
            setIsWrong(input.trim())
        }
    }
    
    function toggleReveal() {
        setIsRevealing(!isRevealing)
    }

    return <Center>
        <Prompt>{current[0]}</Prompt>
        <TextInputContainer>
        {
            isRevealing ? <Reveal>{current[1]}</Reveal> : <TextInput autoFocus type='text' value={input} onChange={e => setInput(e.target.value)} />
        }
        </TextInputContainer>
        <Validation>
            {isWrong ? `${isWrong} ❌`: ' '}
            <RevealButton onClick={toggleReveal}>{isRevealing ? 'solve' : 'reveal'}</RevealButton>
        </Validation> 
    </Center>
}

function getNewCharacter() {
    return sample(Object.entries(monographs))
}

ReactDOM.render(<App />, document.getElementById("app"))