import React, {useState} from 'react';
import './App.css';
// import axios from "axios";

import SockJS from 'sockjs-client'
import {Stomp} from "@stomp/stompjs";

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
            // const response = await axios.get('http://demo.genomearchitect.org/Apollo2/stomp')
            // axios.post('http://demo.genomearchitect.org/Apollo2/system').then((response) => {
            //   console.log('response', response)
            //   const {data} = response
            //   console.log('data', data)
            // })

            // Use this instead to try with native web socket
            // socket = new WebSocket('ws://demo.genomearchitect.org/Apollo2/stomp')
            // @ts-ignore
            console.log('client active BCD',client)
            sock.onopen = function() {
              console.log('ON OPEN');
              sock.send('test');
            };
          client.subscribe("/topic/AnnotationEditorService", function (message:any) {
            // $("#helloDiv2").append(JSON.parse(message.body));
            console.log(message)
          });

            console.log('client connected',client.connected)

            console.log('A')
            client.send("/app/AnnotationNotification",{},JSON.stringify({input:"output"}))
              // client.publish("/app/AnnotationNotification",{},JSON.stringify({input:"output"}))
            console.log('B')



            // client.subscribe("/topic/AnnotationEditorService", function (message) {
            //   // $("#helloDiv2").append(JSON.parse(message.body));
            //   console.log(message)
            // });
            // console.log('subscripted')
            //
            // client.publish({
            //   destination:'/AnnotationNotification',body:'Ping'
            // })
            console.log('published')

            // sock.onmessage = function(e) {
            //   console.log('message', e.data);
            //   sock.close();
            // };

            sock.onclose = function() {
              console.log('close');
            };
            console.log('finishe dbutton')
            // let client = Stomp.over(listener)
          } catch (error) {
            setErrorOutput(errorOutput + String(error))
          }
          // if (!socket) {
          //   return
          // }
          // console.log(socket)
          //
          // socket.onmessage = (e) => {
          //   console.log(e.data)
          //   setOutput(output + String(e.data))
          // }
          //
          // socket.onopen = () => {
          //   console.log('opening...')
          //   socket && socket.send('hello server')
          // }
          //
          // socket.onclose = () => {
          //   console.log('closing...')
          //   setSocket(undefined)
          // }
          //
          // socket.onerror = (error) => {
          //   setErrorOutput(errorOutput + String(error))
          //   console.error(error)
          //   console.dir(error)
          // }
          // setSocket(socket)
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
