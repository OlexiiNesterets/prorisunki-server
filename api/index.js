
const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.status(200).json({
        someName: 'koko',
        num: 1305,
    });
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});