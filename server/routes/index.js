var fs = require('fs');
var path = require('path');
var express = require('express');
var face = require('../modules/faceSdk');
var request = require('request');
var gm = require('gm').subClass({ imageMagick: true });

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '人脸识别' });
});

router.get('/detech', function(req, res, next){
    detech(req, res, next);
});

/*router.post('/detech', function(req, res, next){

    var postData = face.getConfig();
    var body;
    request.post('https://apicn.faceplusplus.com/v2/detection/detect', {form: postData}, function (error, response, body) {
       body = body;
    });

    res.json(body);

});*/

function detech(req, res, next){
    var postData = face.getConfig();
    request.post('https://apicn.faceplusplus.com/v2/detection/detect', {form: postData}, function (error, response, body) {
        res.send('<pre>' + body + '</pre>');
    });

}


/**
 * 上传图片，对图片进行处理
 */

router.post('/convert', function(req, res, next){
    res.header('Content-Type', 'text/plain');
    var rsData;

//    console.log(req.body);return;
    var imgData = req.body.imgData;
    var file = JSON.parse(req.body.file);
    //过滤data:URL
    imgData = imgData.replace(/^data:image\/\w+;base64,/, "");
    var imgBuffer = new Buffer(imgData, 'base64');

    var imgName = new Date().getTime() + '_' + file.name.replace(/.\w+$/gi, '') + '.jpg';
    var imgPath = './upload/' + imgName;

    if(imgBuffer){
        fs.writeFile(imgPath, imgBuffer, function(err){
            if(err){
                rsData = setResultData(201, '图片上传失败', null);
                res.send(rsData);
                return;
            }

            //对上传的图片进行剪切
            convertImage(imgPath, function(error, data){
                if(error){  throw error;
                    /*rsData = setResultData(201, '图片处理失败', imgPath);
                    res.send(rsData);
                    return;*/
                }

                rsData = setResultData(200, '图片上传成功', data);
                res.send(rsData);

            });

        });
    }

});


/**
 * -------Functions--------
 */

function convertImage(filePath, cb){

    var filePath = './upload/1432094032133_QQ20150409-1.jpg';
    //var ext = path.extname(filePath);
    var disPath = './upload/out_resize.jpg';

    fs.exists(filePath, function(exists){
        if(!exists) convertImage(filePath, cb);

        gm(filePath)
            .resize(40, 50)
            .autoOrient()
            .write(disPath, function(err){
                //fs.unlinkSync(filePath);
                (typeof cb === 'function' && null != cb) && cb.call(router, err, disPath);
        });

    });

}


function setResultData(code, msg, dt){

    return JSON.stringify({
        "code": code,
        "msg": msg,
        "dt": dt
    });

}




module.exports = router;
