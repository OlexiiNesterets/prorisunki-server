
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const fs = require("fs").promises;

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
    const dbData = await getDataFromFile('db.json');
    res.status(200).json(dbData);
});

app.post('/', async (req, res) => {

    clearTimeout(timerId);

    console.log('log 1');

    if (users[req.body.name]) {
        timerId = setTimeout(() => {
            fs.writeFile('db.json', Buffer.from(''));
            users = {};
        }, TIMEOUT);
        return res.status(200).send(users);
    }

    users[req.body.name] = Date.now();

    const dbData = await getDataFromFile('db.json');

    console.log('log 2');

    await writeToFile('db.json', JSON.stringify({...dbData, ...users}));

    console.log('log 3');

    timerId = setTimeout(() => {
        fs.writeFile('db.json', Buffer.from(''));
        users = {};
    }, TIMEOUT);

    res.status(200).send(users);
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

async function getDataFromFile(path) {
    const data = await fs.readFile(path);
    
    if (!data.length) {
        return [];
    }

    return JSON.parse(data);
}

async function writeToFile(path, content, error) {
    await fs.writeFile(path, content, error);
}
