const axios = require('axios');
require('dotenv').config()
const getSocket = () => {
    return new Promise((resolve, reject) => {
        let socketUrl;
        const config = {
            method: 'GET',
            url: 'https://bapbap.gg/api/lobby/socket',
            headers: {
                'Cookie': `${process.env.COOKIE}`
            }
        };
        axios.request(config)
        .then(function (response, err) {
            if(err){
                console.log(err);
                reject(err);
                return;
            }
            socketUrl = JSON.stringify(response.data["socketUrl"]).replace(/\"/g, "");
            resolve(socketUrl);
        })
    })
};
exports.getSocket = getSocket;