var express = require('express');
var axios = require('axios');
var redis = require("redis");


var client = redis.createClient(6379);

client.on('error', (err) => console.log(err));

var swapiURL = "https://swapi.dev/api/people/";

var app = express();


app.get('/', (req, res) => {
    res.send('<h1>Caching App</h1>')
});

var checkCache = (req, res, next) => {
    var num = req.params.num;
    client.get(num, async (err, data) => {
        if (err) throw err;
        if (!num) return next();
        res.json({ data: JSON.parse(data), info: "retrived from cache" })
    })
}

app.get('/people/:num', checkCache, async (req, res) => {
    var num = req.params.num;

    var data = await axios.get(swapiURL + num);

    client.setex(num, 600, JSON.stringify(data.data));
    res.json({ data: data.data, info: 'retrieved from server' })
})

app.listen(3000, () => console.log('listening on port 3k'))