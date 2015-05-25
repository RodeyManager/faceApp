var fs = require('fs');
var path = require('path');
var express = require('express');
var face = require('../modules/faceSdk');
var request = require('request');
var gm = require('gm').subClass({ imageMagick: true });
var qiniu = require('node-qiniu');

//配置七牛
qiniu.config({
    access_key: 'h12P06_HvNnRoeV0CotNWF4_mj1_EZm_SqraXP6H',
    secret_key: 'YEhf71syWPExd59yRYvgKaDP1TkaAoAS7rUsEVWQ'
});
var qnRsUrl = 'http://7xj9uy.com1.z0.glb.clouddn.com/';

//全局变量
var rsData, imgPath;

//获取指定空间对象
var faceappBucket = new qiniu.Bucket('faceapp');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '人脸识别' });
});

router.post('/detech', function(req, res, next){
    detech(req, res, next);
});

/**
 * 上传图片，对图片进行处理
 */

router.post('/convert', function(req, res, next){


    var imgData = req.body.imgData;
    var file = JSON.parse(req.body.file);
    //过滤data:URL
    imgData = imgData.replace(/^data:image\/\w+;base64,/, "");
    var imgBuffer = new Buffer(imgData, 'base64');

    var ext = path.extname(file.name);
    var imgName = new Date().getTime() + '_' + file.name.replace(/.\w+$/gi, '') + '.jpg';
    imgPath = './upload/' + imgName;

    if(imgBuffer){

        fs.writeFile(imgPath, imgBuffer, function(err){
            if(err){
                rsData = setResultData(201, '图片上传失败', err);
                res.send(rsData);
                return;
            }

            //对上传的图片进行剪切
            convertImage(function(error, data){
                if(error){
                    rsData = setResultData(201, '图片处理失败', null);
                    res.send(rsData);
                    return;
                }

                console.log('convert done!');

                //七牛获取图片url
                imageUrl = qnRsUrl + data.key;

                rsData = setResultData(200, '图片上传成功', imageUrl, data);
                res.send(rsData);

            });

        });
    }

});


/**
 * -------Functions--------
 */

function convertImage(cb){

    fs.exists(imgPath, function(exists){
        if(!exists) {
            convertImage(imgPath, cb);
            return;
        }

        resizeImage(cb);

    });

}

/**
 * 充值图片大小
 * @param cb
 */
function resizeImage(cb){

    gm(imgPath)
        .resize(400, 500)
        .autoOrient()
        .noProfile()
        .write(imgPath, function(err){

            if(err) throw err;
            putFileToQiniu(getFileName(imgPath), imgPath, cb);

        });

}

/**
 * 将图片上传到七牛
 * @param key
 * @param path
 * @param cb
 */
function putFileToQiniu(key, path, cb){

    //将图片上传到骑牛
    // 七牛 Node.js SDK 所提供的 Promise 对象遵循 Promise/A(+) 标准，使用 .then 方法进行响应
    faceappBucket.putFile(key, path, function(err, reply){
        if(err) throw err;

        //上传七牛成功后，删除本地资源
        fs.unlinkSync(imgPath);

        (typeof cb === 'function' && null != cb) && cb.call(router, err, reply);
    });

}

function detech(req, res, next){

    var postData = face.getConfig();
    postData.url = req.body.imgUrl;

    gm(postData.url).size(function(err, size){
        console.log(size);
    });
    return;


    request.post( face.apis.detech, {form: postData}, function (error, response, body) {
        if(!error){
            rsData = setResultData(201, '图片识别成功', body);
        }else{
            rsData = setResultData(201, '图片识别失败', error);
        }

        res.send(rsData);

    });

}

function setResultData(code, msg, dt, params){

    return JSON.stringify({
        "code": code,
        "msg": msg,
        "dt": dt,
        "params": params || null
    });

}

function getFileName(filePath){
    var ext = path.extname(filePath);
    return path.basename(filePath, ext);
}



/*--exports--*/
module.exports = router;
