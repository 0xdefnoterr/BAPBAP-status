const WebSocketClient = require('websocket').client;
const events = require('events');
const em = new events.EventEmitter();
require('dotenv').config();
const fs = require('fs');
const connectSocket = (url) => {
    return new Promise((resolve, reject) => {
        const socks = new WebSocketClient();

        socks.on('connectFailed', function (error) {
            console.log(error.toString());
            reject(error.toString());
            return;
        })
        socks.on('connect', function(connection){

            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
                reject(error.toString());
                return;
            });
    
            
            connection.on('close', function() {
                console.log('echo-protocol Connection Closed');
                reject('connection closed');
                return;
            });

            connection.on('message', function(message){
                let data = message.utf8Data
                let sMessage = JSON.parse(data)
                if(sMessage["event"] === 'PING'){
                	console.log("Got a Ping!")
                	connection.send(JSON.stringify({"event": "PONG"}))
                	setTimeout(function() {
                    	connection.send(JSON.stringify({"event": "PING"}))
                	}, 5000)
                }
                if(sMessage["event"] === 'PLAYERS_ONLINE_UPDATED'){
                    let players = sMessage["payload"].toString()
                    em.emit('PlayersUpdated', players)

                    fs.writeFile('data.txt', players, function(err){
                        if(err) return console.error(err);
                    })
                }
            })
        })
        socks.connect(`${url}`,null,null, {'Cookie': `${process.env.COOKIE}`})
    })
}
exports.connectSocket = connectSocket
exports.commonEmitter = em
