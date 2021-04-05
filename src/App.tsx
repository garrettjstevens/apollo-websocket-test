import React, { useEffect, useState } from 'react'
import './App.css'

import { Client, Frame, Message } from '@stomp/stompjs'
import axios from "axios";


console.log('WDS_SOCKET_PATH',process.env)

const App = () => {
  // const [apolloUrl, setApolloUrl] = useState('http://localhost:8080/apollo')
  const [apolloUrl, setApolloUrl] = useState('/apollo')
  const [username, setUsername] = useState('admin@local.host')
  const [password, setPassword] = useState('password')
  const [errorMessage, setErrorMessage] = useState('')
  const [output, setOutput] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const [client, setClient] = useState<Client>()

  useEffect(() => {
    return () => {
      client && client.deactivate()
    }
  }, [client])

  async function ajaxLogin(){
    let url: URL
    // const finalUrl:string = `${apolloUrl}/login/login?targetUri=/apollo&username=${username}`
    const finalUrl:string = `${apolloUrl}/Login?operation=login&username=${username}`
    // try {
    //   // url = new URL(finalUrl)
    // } catch (error) {
    //   setErrorMessage('URL is not valid')
    //   return
    // }
    let loginObject = {
      username: username,
      password: password,
      operation: 'login',
      rememberMe: false,
    }
    // alert(finalUrl)
    const response = await axios.post(finalUrl,loginObject,{})

    const { data } = await response
    if(response.status==200){
      // window.location.reload(true);
    }
    return data

  }

  async function ajaxLogout(){
    let url: URL
    // const finalUrl:string = apolloUrl + '/asdfas/Login?operation=logout&targetUri=/apollo'
    const finalUrl:string = `${apolloUrl}/login/logout?targetUri=/apollo&username=${username}`
    try {
      alert(finalUrl)
      url = new URL(finalUrl)
    } catch (error) {
      setErrorMessage('URL is not valid')
      return
    }
    const response = await axios.post(finalUrl,{},{})

    const { data } = await response
    if(response.status==200){
      window.location.reload(true);
    }
    return data

  }

  function onConnectClick() {
    let url: URL
    try {
      url = new URL(apolloUrl)
    } catch (error) {
      setErrorMessage('URL is not valid')
      return
    }
    url.protocol = url.protocol.startsWith('https') ? 'wss' : 'ws'
    url.pathname += '/stomp/websocket'
    console.log(url.href)
    // url.search = `?username=${username}&password=${password}`
    const c = new Client({
      brokerURL: url.href,
    })
    c.onDisconnect = () => {
      c.deactivate()
      setClient(undefined)
      console.log('disconnected')
    }
    c.onWebSocketClose = (event) => {
      setClient(undefined)
      console.log('websocket closed')
      console.log(event)
    }
    c.onWebSocketError = (event) => {
      setErrorMessage(
        'Problem opening web socket, please check URL, username, and password'
      )
    }

    c.onConnect = (frame: Frame) => {
      console.log('client connected', c.connected)
      console.log('client connected state', c.state)
      console.log('getting frame', frame)
      c.subscribe('/topic/AnnotationNotification', (message: Message) => {
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
          (message: Message) => {
            console.log('listening to user topic')
            const finalOutput = `body\n======\n${message.body}\n====\ntype: ${
              message.binaryBody ? 'binary' : 'text'
            }\nheader:\n${JSON.stringify(message.headers)}\n=====\n`
            console.log(finalOutput)
            setOutput(finalOutput)
            const messageBody = JSON.parse(message.body)
            if(messageBody.operation==='logout'){
              alert('loggin out')
              window.location.reload(true);
            }
          }
        )
      }
    }

    c.onStompError = (frame: Frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
      setErrorOutput(frame.headers['message'])
    }

    c.activate()

    setClient(c)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 240 }}>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        <h4>Apollo Web Socket Connection</h4>
          <ul>
          {/*<li>*/}
          {/*  Client: {client!==undefined ? client : 'None'}*/}
          {/*</li>*/}
          <li>
            Active: {client?.active ? 'active' : 'inactive'}
            </li>
            <li>
          Connected: {client?.connected ? 'connected' : 'not connected'}
            </li>
          </ul>
        <label style={{ marginBottom: 40 }}>
          Apollo URL:
          <input
            type="text"
            size={60}
            value={apolloUrl}
            onChange={(event) => {
              setApolloUrl(event.target.value)
              setErrorMessage('')
            }}
            // disabled={client && client.active}
          />
        </label>
        <label style={{ marginBottom: 40 }}>
          Username:
          <input
            type="text"
            size={60}
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setErrorMessage('')
            }}
            // disabled={client && client.active}
          />
        </label>
        <label style={{ marginBottom: 40 }}>
          Password:
          <input
            type="password"
            size={60}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setErrorMessage('')
            }}
            disabled={client && client.active}
          />
        </label>
        <button
          onClick={onConnectClick}
        >
          WebSocket Login (expect fail if not logged in elsewhere)
        </button>
        <button
            onClick={ajaxLogin}
        >
          Ajax Login
        </button>
        <button
          onClick={() => {
            try {
              console.log('client connected', client && client.connected)
              console.log('sending')
              client &&
                client.publish({
                  destination: '/app/AnnotationNotification',
                  body: JSON.stringify({
                    operation: 'logout',
                  }),
                })
              console.log('sent')
            } catch (error) {
              setErrorOutput(errorOutput + String(error))
            }
          }}
          disabled={!(client && client.active)}
        >
          WebSocket Logout (we expect a fail)
        </button>
        <button
            onClick={ajaxLogout}
        >
          Ajax Logout (should succeed)
        </button>
        <button
          onClick={() => {
            client && client.active && client.deactivate()
          }}
          disabled={!(client && client.active)}
        >
          Disconnect
        </button>
        <hr style={{ width: '200%' }} />
        {/*<button*/}
        {/*  // disabled={!(client && client.active)}*/}
        {/*  onClick={() => {*/}
        {/*    try {*/}
        {/*      client &&*/}
        {/*        client.publish({*/}
        {/*          destination: '/app/AnnotationNotification',*/}
        {/*          body: JSON.stringify({ operation: 'admin' ,username:username}),*/}
        {/*        })*/}
        {/*    } catch (error) {*/}
        {/*      setErrorOutput(errorOutput + String(error))*/}
        {/*    }*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Is Current Admin*/}
        {/*</button>*/}
        <button
          // disabled={!(client && client.active)}
          onClick={() => {
            try {
              client &&
                client.publish({
                  destination: '/app/AnnotationNotification',
                  body: JSON.stringify({ operation: 'currentUser' }),
                })
            } catch (error) {
              setErrorOutput(errorOutput + String(error))
            }
          }}
        >
          Get Current User
        </button>
        <button
          // disabled={!(client && client.active)}
          onClick={() => {
            try {
              console.log('sending')
              console.log(
                'connected',
                client && client.connected,
                client && client.active
              )
              client &&
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
          Test Ping Send
        </button>
        <button
          // disabled={!(client && client.active)}
          onClick={() => {
            try {
              console.log('client connected', client && client.connected)

              console.log('sending')
              client &&
                client.publish({
                  destination: '/app/AnnotationNotification',
                  body: JSON.stringify({
                    input: 'output',
                    operation: 'broadcast',
                  }),
                })
              console.log('sent')
            } catch (error) {
              setErrorOutput(errorOutput + String(error))
            }
          }}
        >
          Broadcast Test
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
