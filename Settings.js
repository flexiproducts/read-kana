import React from 'react'
import styled from 'styled-components'

export default function Settings({settings, setSettings}) {
  return (
    <Container>
      <Heading>settings</Heading>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.hiragana}
            onChange={() =>
              setSettings({...settings, hiragana: !settings.hiragana})
            }
          />
          hiragana
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.katakana}
            onChange={() =>
              setSettings({...settings, katakana: !settings.katakana})
            }
          />
          katakana
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.words}
            onChange={() =>
              setSettings({
                ...settings,
                words: !settings.words
              })
            }
          />
          words
        </label>
      </div>
    </Container>
  )
}

const Container = styled.div`
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

const Heading = styled.h3`
  text-align: center;
  margin-bottom: 5px;
`
