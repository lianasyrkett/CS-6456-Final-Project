var express = require('express');
var path = require('path');
var log4js = require('log4js');

var utils = require('./utils');

var logger = log4js.getLogger('[eSense-Recorder]');
logger.level = 'INFO'

var app = express();
var http = require('http').Server(app);

var openAlbum = require('./routes/open-album');
app.use('/open-album', openAlbum);

var addToAlbum = require('./routes/add-to-album');
app.use('/add-to-album', addToAlbum);

var createAnAlbum = require('./routes/create-an-album');
app.use('/create-an-album', createAnAlbum);

app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 100 }));
app.use("/images", express.static(path.join(__dirname, "/images")));

var fs = require('fs');

var interactjs = require('interactjs');


app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

const serveIndex = require('serve-index');
app.use('/images', serveIndex(path.join(__dirname, '/images')));

http.listen(5000, function () {
	logger.info('eSense-Recorder is listening on port : 5000');
});