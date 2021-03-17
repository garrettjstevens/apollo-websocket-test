import React, { useEffect, useState } from 'react'
import './App.css'

import { CompatClient, Stomp } from '@stomp/stompjs'

const App = () => {
  const [output, setOutput] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const [client, setClient] = useState<CompatClient>()

  useEffect(() => {
    const c = Stomp.over(function () {
      return new WebSocket('ws://localhost:8080/apollo/stomp/websocket')
    })
    c.onDisconnect = function () {
      console.log('disconnected')
    }
    c.onWebSocketClose = function () {
      console.log('websocket closed')
    }

    let username: any = undefined
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('username')) {
      username = urlParams.get('username')
    }

    console.log('usernames', username)

    console.log('client', c)

    c.onConnect = function (frame: any) {
      console.log('client connected', c.connected)
      console.log('client connected state', c.state)
      console.log('getting frame', frame)
      c.subscribe('/topic/AnnotationNotification', function (message: any) {
        console.log('listening to main topic')
        console.log(message)
        console.log(message.binaryBody)
        console.log(message.body)
        console.log(message.headers)
        const finalOutput = `body\n======\n${message.body}\n====\ntype: ${
          message.binaryBody ? 'binary' : 'text'
        }\nheader:\n${JSON.stringify(message.headers)}\n=====\n`
        setOutput(finalOutput)
      })
      if (username) {
        c.subscribe(
          `/topic/AnnotationNotification/user/${username}`,
          function (message: any) {
            console.log('listening to user topic')
            const finalOutput = `body\n======\n${message.body}\n====\ntype: ${
              message.binaryBody ? 'binary' : 'text'
            }\nheader:\n${JSON.stringify(message.headers)}\n=====\n`
            console.log(finalOutput)
            setOutput(finalOutput)
          }
        )
      }
      return () => {
        c.deactivate()
      }
    }

    c.onStompError = function (frame: any) {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
      setErrorOutput(frame.headers['message'])
    }

    c.activate()

    setClient(c)
  }, [])

  if (!(client && client.active)) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
        Apollo Web Socket Connection
        <button
          disabled={!client.active}
          onClick={() => {
            try {
              console.log('sending')
              console.log('connected', client.connected, client.active)
              client.publish({
                destination: '/app/AnnotationNotification',
                body: JSON.stringify({ input: 'output', operation: 'ping' }),
              })
              console.log('sent')
            } catch (error) {
              setErrorOutput(errorOutput + String(error))
            }
          }}
        >
          Test Send
        </button>
        <button
          disabled={!client.active}
          onClick={() => {
            try {
              console.log('client connected', client.connected)

              console.log('sending')
              client.send(
                '/app/AnnotationNotification',
                {},
                JSON.stringify({ input: 'output', operation: 'broadcast' })
              )
              console.log('sent')
            } catch (error) {
              setErrorOutput(errorOutput + String(error))
            }
          }}
        >
          Broadcast Test
        </button>
        <button
          onClick={() => {
            client.active && client.deactivate()
          }}
          disabled={!client.active}
        >
          Disconnect
        </button>
      </div>
      <h6>Output</h6>
      <textarea rows={10} value={output} readOnly />
      <h6>Errors</h6>
      <textarea rows={10} value={errorOutput} readOnly />
    </div>
  )
}

export default App
