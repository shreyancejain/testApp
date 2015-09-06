var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url');
var gitHub = require('./GitHub.js');

//app related configuration
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));
app.use(express.static(path.join(__dirname + "/../client")));
app.set('appPath', 'client');
var server = http.createServer(app);


app.route('/getRepoDetails').get(function (req, res) {
    var repoUrl = req.query.repoUrl;
    var path = url.parse(repoUrl).path; //parsing url and get path
    if (!path) {    //if path is not set returning error
        return handleError(res, new Error("invalid url"))
    }
    var arr = path.split('/');
    var repoOwner = arr[1];  //get repo owner
    var repoName = arr[2];  //get repo name
    gitHub.getRepoDetail(repoOwner, repoName, function (err, repoDetails) {
        if (err) {
            return handleError(res, err)
        }
        res.send(200, repoDetails)
    });

});

//all undefined routes will serve index.html
app.route('/*')
    .get(function (req, res) {
        res.sendfile(app.get('appPath') + '/index.html');
    });

var port = process.env.PORT || 9000;

server.listen(port, function () { //started server
    console.log('Express server listening on %d, in %s mode', port, app.get('env'));
});

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}