import React from 'react'
import styled from 'styled-components'
import Settings from './Settings'

export default function Layout({
  settings,
  setSettings,
  numberCorrect,
  children
}) {
  return (
    <Container>
      {children}
      <Settings {...{settings, setSettings}} />
      <Stats>🔥 {numberCorrect}</Stats>
      <Karugamo href="http://karugamo.agency/">🦆</Karugamo>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  font-family: sans-serif;
`

const Karugamo = styled.a`
  position: fixed;
  top: 10px;
  right: 10px;
  text-decoration: none;
  font-size: 2em;
`

const Stats = styled.div`
  position: fixed;
  bottom: 5px;
  right: 20px;
`
