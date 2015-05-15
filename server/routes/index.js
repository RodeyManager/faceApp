var express = require('express');
var face = require('../modules/faceSdk');
var request = require('request');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/detech', function(req, res, next){
    detech(req, res, next);
});

router.post('/detech', function(req, res, next){

    var postData = face.getConfig();
    var body;
    request.post('https://apicn.faceplusplus.com/v2/detection/detect', {form: postData}, function (error, response, body) {
       body = body;
    });

    res.json(body);

});

function detech(req, res, next){
    var postData = face.getConfig();
    request.post('https://apicn.faceplusplus.com/v2/detection/detect', {form: postData}, function (error, response, body) {
        res.send('<pre>' + body + '</pre>');
    });

}

module.exports = router;
