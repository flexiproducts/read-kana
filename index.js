import React, {useState} from "react"
import ReactDOM from "react-dom"
import styled from 'styled-components'
import {sample} from 'lodash'
import {monographs} from './lib/hiragana'

const Center = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
`

const Prompt = styled.div`
    font-size: 5em;
    font-family: sans-serif;
`

const TextInput = styled.input`
    all: unset;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-family: sans-serif;
    background-color: white;
`

function App () {
    const [current, setCurrent] = useState(getNewCharacter())
    const [input, setInput] = useState('')

    if (input.toLowerCase().trim() === current[1].toLowerCase()) {
        setInput('')
        setCurrent(getNewCharacter())
    }

    return <Center>
        <Prompt>{current[0]}</Prompt>
        <TextInput type='text' value={input} onChange={e => setInput(e.target.value)} />
    </Center>
}

function getNewCharacter() {
    return sample(Object.entries(monographs))
}

ReactDOM.render(<App />, document.getElementById("app"))