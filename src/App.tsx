import React, { useState } from 'react';
import './App.css';
// import SockJS from 'sockjs-client'

function App() {
  const [output, setOutput] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const [socket, setSocket] = useState<WebSocket>()
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
        Apollo Web Socket Connection
        <button onClick={() => {
          let socket: WebSocket | undefined
          try {
            // Use this instead to try with native web socket
            // socket = new WebSocket('ws://demo.genomearchitect.org/Apollo2/stomp')
            // @ts-ignore
            socket = new SockJS('http://demo.genomearchitect.org/Apollo2/stomp')
            // socket = new SockJS('http://localhost:8080/apollo/stomp')
          } catch (error) {
            setErrorOutput(errorOutput + String(error))
          }
          if (!socket) {
            return
          }
          console.log(socket)

          socket.onmessage = (e) => {
            console.log(e.data)
            setOutput(output + String(e.data))
          }

          socket.onopen = () =>{
            console.log('opening...')
            socket && socket.send('hello server')
          }

          socket.onclose = () => {
            console.log('closing...')
            setSocket(undefined)
          }

          socket.onerror = (error) => {
            setErrorOutput(errorOutput + String(error))
            console.error(error)
            console.dir(error)
          }
          setSocket(socket)
        }}>Connect</button>
        <button onClick={() => {
          socket && socket.close()
        }} disabled={!socket}>Disconnect</button>
      </div>
      <h6>Output</h6>
      <textarea value={output} readOnly></textarea>
      <h6>Errors</h6>
      <textarea value={errorOutput} readOnly></textarea>
    </div>
  );
}

export default App;
