
// IMPORTS
const { Client, Intents, MessageEmbed  } = require('discord.js');
require('dotenv').config()
const fs = require('fs')
const bapbap = require('./getSocket.js')
const socket = require('./connectSocket.js')
const serverEvent = socket.commonEmitter


//begin
let socket2;
let players = fs.readFileSync("./data.txt", {"encoding": "utf-8"})

setTimeout(function(){
    bapbap.getSocket()
        .then(value => socket2 = value)
}, 2000)


setTimeout(()=> {
    socket.connectSocket(`${socket2}`)
    serverEvent.on('PlayersUpdated', (data) => players = data )
}, 4000)

const start = new Date().getTime()

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})

// CLIENT ON READY
client.on('ready', () => {
    const end = new Date().getTime()
    // set presence
    client.user.setPresence({
        activities: [{
            name: "connected in: " + (end - start) + ' ms',
            type: "WATCHING"
        }],
        status: "idle"
    })
    // GET GUILD ID
    let guild = client.guilds.cache.get('955081914333663232') // change this with your guild id
    // CHECKS IF CATEGORY AND CHANNEL EXISTS
    let check_current_players = guild.channels.cache.find(channel => channel.name.includes('current-players-') && channel.type === "GUILD_VOICE")
    let check_status = guild.channels.cache.find(channel => channel.name.includes('bapbap.gg') && channel.type === "GUILD_CATEGORY");
    // HANDLES CREATION
    if(!check_status) {
        let category = guild.channels.create('bapbap.gg', {type: 'GUILD_CATEGORY', position: 1})
        .then(category => category.createChannel('current-players-', {type: 'GUILD_VOICE', permissionOverwrites: [{ id: guild.id, deny: ['CONNECT'] }]}))
        .then(test => check_current_players = test)
    }
    if(!check_current_players){
        let vc = guild.channels.create('current-players-', {
            type: 'GUILD_VOICE',
            permissionOverwrites: [
                {
                    id: client.user.id,
                    allow: ['CONNECT']
                },
                {
                id: guild.roles.everyone,
                deny: ['CONNECT']
            }
        ]
        })
        .then(VoiceChannel => VoiceChannel.setParent(check_status.id))
        .then(test => check_current_players = test)
        
    }
    if(check_status && check_current_players){
        check_current_players.setParent(check_status.id)
    }
    // Dynamically changes the name based on socket
    setInterval(() => {
        check_current_players.setName(`current-players-${players}`)
        console.log('Current Numbers of players on the server : ' + players)
    }, 60000) //every 10 mins to avoid ratelimit

    // END OF HANDLE
    console.log('client ready in : ' + (end - start) + ' ms')
})


client.on('error', (error) => {
    console.log(error.message)
})

client.login(process.env.TOKEN)
