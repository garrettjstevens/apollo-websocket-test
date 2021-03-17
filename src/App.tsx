import React, {useState} from 'react';
import './App.css';
// import axios from "axios";

import {Stomp} from "@stomp/stompjs";
// import SockJS from 'sockjs-client';

// let sock : any
let client : any


const App = () => {


    const [output, setOutput] = useState('')
    const [errorOutput, setErrorOutput] = useState('')
    const [socket, setSocket] = useState<WebSocket>()
    const [constructorHasRun, setConstructorHasRun] = useState(false);


    const constructor = () => {
        if (constructorHasRun) return;
        // sock = new SockJS('http://localhost:8080/apollo/stomp')
        // sock = new WebSocket('ws://localhost:8080/apollo/stomp/websocket')
        // client = Stomp.over(sock);
        client = Stomp.over(function(){
            return new WebSocket('ws://localhost:8080/apollo/stomp/websocket')
        });
        // client.reconnectDelay = 300
        // client.debug = function (str:string) {
        //     console.log(str)
        // };
        client.onDisconnect  = function(){
            console.log('disconnected')
        }
        client.onWebSocketClose = function(){
            console.log('websocket closed')
        }

        let username:any = undefined
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('username')){
            username = urlParams.get('username')
        }

        console.log('usernames',username)

        // client.send()
        console.log('client',client)


        client.onConnect = function(frame:any){
            console.log('client connected',client.connected)
            console.log('client connected state',client.state)
            console.log('getting frame',frame)
            client.subscribe("/topic/AnnotationNotification", function (message:any) {
                console.log('listening to main topic')
                console.log(message)
                console.log(message.binaryBody)
                console.log(message.body)
                console.log(message.headers)
                const finalOutput = `body\n======\n${message.body}\n====\ntype: ${message.binaryBody ? 'binary' : 'text' }\nheader:\n${JSON.stringify(message.headers)}\n=====\n`
                setOutput(finalOutput)
            });
            if(username){
                client.subscribe(`/topic/AnnotationNotification/user/${username}`, function (message:any) {
                    console.log('listening to user topic')
                    const finalOutput = `body\n======\n${message.body}\n====\ntype: ${message.binaryBody ? 'binary' : 'text' }\nheader:\n${JSON.stringify(message.headers)}\n=====\n`
                    console.log(finalOutput)
                    setOutput(finalOutput)
                });
            }
        }

        client.onStompError = function(frame:any){
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
            setErrorOutput(frame.headers['message'])
        }


        client.activate()
        setConstructorHasRun(true);
    };

    constructor()



  return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'column', width: 200}}>
        Apollo Web Socket Connection
        <button
            disabled={!client.active}
            onClick={() => {
          // let socket: WebSocket | undefined
          try {
            console.log('sending')
            // client.send("/app/AnnotationNotification",{},JSON.stringify({input:"output","operation":"ping"}))
              console.log('connected',client.connected,client.active)
                  client.publish({
                      destination: "/app/AnnotationNotification",
                      body: JSON.stringify({input: "output", "operation": "ping"})
                  })
              // client.publish("/app/AnnotationNotification",{},JSON.stringify({input:"output"}))
            console.log('sent')
          } catch (error) {
            setErrorOutput(errorOutput + String(error))
          }
        }}>Test Send
        </button>
        <button
            disabled={!client.active}
            onClick={() => {
            // let socket: WebSocket | undefined
            try {
                console.log('client connected',client.connected)

                console.log('sending')
                client.send("/app/AnnotationNotification",{},JSON.stringify({input:"output","operation":"broadcast"}))
                // client.publish("/app/AnnotationNotification",{},JSON.stringify({input:"output"}))
                console.log('sent')
            } catch (error) {
                setErrorOutput(errorOutput + String(error))
            }
        }}>Broadcast Test
        </button>
        <button onClick={() => {
          client.active && client.deactivate()
        }} disabled={!client.active}>Disconnect
        </button>
      </div>
      <h6>Output</h6>
      <textarea rows={10} value={output} readOnly/>
      <h6>Errors</h6>
      <textarea rows={10} value={errorOutput} readOnly/>
    </div>
  );
}

export default App;
