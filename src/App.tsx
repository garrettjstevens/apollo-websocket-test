import React, {useState} from 'react';
import './App.css';
// import axios from "axios";

import SockJS from 'sockjs-client'
import {Stomp} from "@stomp/stompjs";
import {request} from "https";

let sock : any
let client : any

function App() {
  const [output, setOutput] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const [socket, setSocket] = useState<WebSocket>()

  sock = new SockJS('http://localhost:8080/apollo/stomp')
  console.log('sock A',sock)
  // var client = Stomp.client(url);
  client = Stomp.over(sock);
  // let client = Stomp.client('http://localhost:8080/apollo/stomp')
  // client.connect( () => {
  //   console.log('connected')
  //
  // })

  // client.send()
  console.log('client',client)

    client.onConnect = function(frame:any){
      console.log('getting frame',frame)
        client.subscribe("/topic/AnnotationEditorService", function (message:any) {
            console.log('listening to main topic')
            console.log(message)
        });
        client.subscribe("/", function (message:any) {
            console.log('listening to all')
            console.log(message)
        });
    }

  client.activate()


  return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'column', width: 200}}>
        Apollo Web Socket Connection
        <button onClick={() => {
          // window.location.href = 'http://demo.genomearchitect.org/Apollo-staging/auth/login?targetUri=http://localhost:3000'
          window.location.href = 'http://localhost:8080/apollo/auth/login?targetUri=http://localhost:3000'
        }}>
          Login
        </button>
        <button onClick={() => {
          // let socket: WebSocket | undefined
          try {
            console.log('client connected',client.connected)

            console.log('sending')
            client.send("/app/AnnotationNotification",{},JSON.stringify({input:"output","operation":"ping"}))
              // client.publish("/app/AnnotationNotification",{},JSON.stringify({input:"output"}))
            console.log('sent')
          } catch (error) {
            setErrorOutput(errorOutput + String(error))
          }
        }}>Connect
        </button>
        <button onClick={() => {
          socket && socket.close()
        }} disabled={!socket}>Disconnect
        </button>
      </div>
      <h6>Output</h6>
      <textarea value={output} readOnly></textarea>
      <h6>Errors</h6>
      <textarea value={errorOutput} readOnly></textarea>
    </div>
  );
}

export default App;
