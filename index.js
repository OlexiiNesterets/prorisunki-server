
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');

const port = process.env.PORT || 5000;

const wss = new WebSocket.Server({ server: server });

const clientsMap = new Map();

let connections = 0;

const getValues = (map) => () => Array.from(map.values());

const getClientMapValues = getValues(clientsMap);

const TIMER = 20 * 1000;

let timerId;

function resetTimer(callback) {
    clearTimeout(timerId);
    return setTimeout(callback, TIMER);
}

function clearClientsList(wss) {
    clientsMap.clear();
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(getClientMapValues()));
            client.send(JSON.stringify({connections}));
        }
    });
    console.log('CLEARED_BY_TIMEOUT ');
}

wss.on('connection', function connection(ws, req) {
    console.log('A new client Connected!');
    ws.send('Welcome New Client!');
    connections++;

    ws.on('message', function incoming(message) {
        timerId = resetTimer(() => clearClientsList(wss));
        const newUser = JSON.parse(message);
        console.log('NEW_USER:', newUser);
        clientsMap.set(ws, newUser);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(getClientMapValues()));
                client.send(JSON.stringify({connections}));
                if (connections === clientsMap.size) {
                    client.send('START!');
                    const sortedValues = getClientMapValues().slice().sort((a, b) => a.time - b.time);
                    client.send(JSON.stringify(sortedValues));
                }
            }
        });
        console.log(getClientMapValues());
    });

    ws.on('close', function closing() {
        timerId = resetTimer(() => clearClientsList(wss));
        clientsMap.delete(ws);
        connections--;
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(getClientMapValues()));
                client.send(JSON.stringify({connections}));
            }
        });
        console.log(getClientMapValues());

    });
});

app.get('/', (req, res) => res.send('Hello World!'));

server.listen(port, () => console.log(`Lisening on port :${port}`));