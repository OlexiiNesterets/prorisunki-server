
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const fs = require("fs").promises;
const { join } = require('path');

const app = express();

//делаем наш парсинг в формате json
app.use(bodyParser.json());

// парсит запросы по типу: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: '*'
}));

const port = 5000;

let users = {};

const myData = {
    someName: 'koko',
    num: 1305,
};

const TIMEOUT = 1000 * 30;
let timerId;

app.get('/', async (req, res) => {
    // const dbData = await getDataFromFile(join(__dirname, 'db.json'));
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache'
    });

    res.flushHeaders();
    console.log('REQUEST!!');
    setInterval(() => {
        res.write(`data: ${JSON.stringify(users)}\n\n`);
        // res.status(200).json(users);
    }, 1000);
    // res.write('event: message\n"');

    // res.write(`data: ${JSON.stringify({abc: 66})}\n\n`);
    write(res);

    // res.status(200).json(users);
});

app.post('/', async (req, res) => {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache'
    });
    res.flushHeaders();
    console.log('REQUEST!!');
    // res.write(`data: {fromPost: "yeah!"}`);
    users[req.body.name] = Date.now();

    // setInterval(() => {
    //     res.write(`data: ${JSON.stringify(users)}\n\n`);
    // }, 1000);

    // res.write(`data: ${JSON.stringify(users)}\n\n`);
    write(res);
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

function write(res) {
    res.write(`event: message\ndata: ${JSON.stringify(users)}\n\n`);
}