
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');

const port = process.env.PORT || 5000;

const wss = new WebSocket.Server({ server: server });

let clientsMap = new Map();

const getValues = (map) => () => Array.from(map.values());

const getClientsMapValues = getValues(clientsMap);

const getSortedClientsValues = () =>
    getClientsMapValues()
        .slice()
        .sort((a, b) => new Date(a.time) - new Date(b.time));

function Timer(ms, onTimeout) {
    let timerId;

    this.restartTimer = () => {
        clearTimeout(timerId);
        timerId = setTimeout(onTimeout, ms);
    };

    this.stop = () => clearTimeout(timerId);
}

const timer = new Timer(20 * 1000, () => {
    clientsMap.clear();
    console.log('CLEARED_BY_TIMEOUT');
    console.log('clientsMap.size', clientsMap.size);

});


wss.on('connection', function connection(ws, req) {
    timer.restartTimer();

    ws.on('message', function incoming(message) {

        if (JSON.parse(message).ping) {
            return;
        }

        timer.restartTimer();
        const userInfo = JSON.parse(message);

        clientsMap.set(ws, userInfo);
        console.log('clientsMap.size', clientsMap.size);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(getSortedClientsValues()));
            }
        });
    });

    ws.on('close', function closing() {
        timer.restartTimer();
        clientsMap.delete(ws);
        console.log('clientsMap.size', clientsMap.size);
    });
});

server.listen(port, () => console.log(`Lisening on port :${port}`));