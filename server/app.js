var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url')
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));
app.use(express.static(path.join(__dirname + "/../client")));
app.set('appPath', 'client');

var server = http.createServer(app);
var gitHub = require('./GitHub.js')

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}

app.route('/getRepoDetails').get(function (req, res) {
    var repoUrl = req.query.repoUrl;
    var path = url.parse(repoUrl).path;
    if (!path) {
        return handleError(res, new Error("invalid url"))
    }
    var arr = path.split('/')
    var repoOwner = arr[1];
    var repoName = arr[2];
    gitHub.getRepoDetail(repoOwner, repoName, function (err, repoDetails) {
        if (err) {
            return handleError(res, err)
        }
        res.send(200, repoDetails)
    });

});

app.route('/*')
    .get(function (req, res) {
        res.sendfile(app.get('appPath') + '/index.html');
    });

var port = process.env.PORT || 9000;

server.listen(port, function () {
    console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});
