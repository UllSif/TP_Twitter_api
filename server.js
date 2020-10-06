var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/capteurs', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection
db.once('open', function () {
    // we're connected!
    console.log('DB connected on port 27017');
});

const Sensor = require('./models/sensors');

var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'xErAcWaxOVMjqhJBYlfIh72yJ',
    consumer_secret: 'opY4lNyNCLpncKTlplcxOqKUwzhy9xZUpIkb1y9YkkWZIwXAsH',
    access_token_key: '1283450833330470914-edIMPYtGatbYyZcOEGspQCUiDknur2',
    access_token_secret: 'GGlCFa7WIYm0q68UINnGDCpW2l0M3jEkKnTLNJWOfuCak'
});

var stream = client.stream('statuses/filter', {track: 'testGui'});

// stream.on('error', function (error) {
//     throw error;
// });

stream.on('data', function (event) {
    console.log(event)
    io.emit('tweet', {'tweet': event})
    // On verifie l'id du user
    if (event.user.id_str == '1283450833330470914') {
        // console.log("C'est moi");
        // console.log(event.entities.hashtags);

        // Si l'id est le bon, alors on fait la suite des instructions
        if (event.entities.hashtags.length > 0) {
            event.entities.hashtags.forEach(function (hashtag) {
                // Si un des hashtags contient le mot color
                if (hashtag.text === 'color') {
                    // On sépare tous les hashtags
                    var hashtagSplit = event.text.split(' ');
                    hashtagSplit.forEach(function (word) {
                        // console.log(word)
                        // On choisit les mots qui ne contiennent pas de # (tout sauf les hashtags)
                        if (word.charAt(0) !== '#') {
                            // console.log(word)
                            // On emit la couleur
                            io.emit('backgroundColor', {
                                'newColor': word
                            });
                        }
                    });
                }
                if (hashtag.text === 'temp') {
                    var hashtagSplit = event.text.split(' ');
                    hashtagSplit.forEach(function (word) {
                        if (word.charAt(0) !== '#') {
                            var newSensor = {
                                name: 'Température',
                                sensor_type: 'temp',
                                value: word
                            }
                            const toCreate = new Sensor(newSensor);

                            toCreate.save().then(function (newValue) {
                                io.emit('tempChange', {
                                    'newTemp': word
                                });
                                console.log(newValue);
                                console.log('Object saved with id : ' + toCreate._id)
                            })
                        }
                    })
                }
                if (hashtag.text === 'hum') {
                    var hashtagSplit = event.text.split(' ');
                    hashtagSplit.forEach(function (word) {
                        if (word.charAt(0) !== '#') {
                            var newSensor = {
                                name: 'Humidité',
                                sensor_type: 'hum',
                                value: word
                            }
                            const toCreate = new Sensor(newSensor);

                            toCreate.save().then(function (newValue) {
                                io.emit('humChange', {
                                    'newHum': word
                                });
                                console.log(newValue);
                                console.log('Object saved with id : ' + toCreate._id)
                            })
                        }
                    })
                }
            });
        }
    }
});

// CREATE APP CONF
app.use('/lib', express.static(__dirname + '/client/static/'));

// CREATE ROUTES API
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/static/index.html');
});

app.get('/tweets', function (req, res) {
    res.sendFile(__dirname + '/client/static/tweets.html')
})

app.get('/dataviz', function (req, res) {
    res.sendFile(__dirname + '/client/static/dataviz.html')
})

app.get('/api/capteurs/:stype', function (req, res) {
    Sensor.find({'sensor_type': req.params.stype}).exec(function (err, sensorList) {
        if (err) {
            console.log(err);
        }
        console.log(sensorList);
        res.json(sensorList);
    })
})

// handle socket events
io.on('connection', (socket) => {
    console.log('a user connected');
});

// START server
http.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
