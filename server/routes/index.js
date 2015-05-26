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
//获取指定空间对象
var faceappBucket = new qiniu.Bucket('faceapp');
//全局变量
var rsData, imgPath;
var COMPRESS = 'JPEG';
//开启路由
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: '人脸识别' });
});

router.post('/detech', function(req, res){
    detech(req, res);
});

/**
 * 上传图片，对图片进行处理
 */

router.post('/convert', function(req, res){

    var imgData = req.body.imgData;
    var file = JSON.parse(req.body.file);
    imgData = imgData.replace(/^data:image\/\w+;base64,/, "");
    var imgBuffer = new Buffer(imgData, 'base64');
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
                //上传七牛成功后，删除本地资源（无论是否成功都清除本地资源）
                fs.unlinkSync(imgPath);
                if(error){
                    rsData = setResultData(201, '图片处理失败', null);
                    res.send(rsData);
                    return;
                }
                console.log('convert done!');

                //七牛获取图片url
                var imageUrl = qnRsUrl + data.key;
                //获取图片资源信息
                getImageInfo(req, res, function(err, response, info){
                    if(!err){
                        rsData = setResultData(200, '图片识别成功', imageUrl, info);
                    } else {
                        rsData = setResultData(201, '图片识别失败', err);
                    }
                    res.send(rsData);
                });

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
        .compress(COMPRESS)
        .quality(90)
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
    faceappBucket.putFile(key, path, { endUser: 'Rodey Luo' }, function(err, reply){
        (typeof cb === 'function' && null != cb) && cb(err, reply);
    });

}

/**
 * 识别图片
 * @param req
 * @param res
 * @param next
 */
function detech(req, res){

    var postData = face.getConfig();
    postData.url = req.body.imgUrl;
    request.post( face.apis.detech, {form: postData}, function (error, response, body) {
        if(!error){
            //获取图片资源的实际信息
            getImageInfo(req, res, function(err, response, info){
                if(!err){
                    body = JSON.parse(body);
                    body.imageInfo = JSON.parse(info);
                    body = JSON.stringify(body);
                    rsData = setResultData(200, '图片识别成功', body);

                } else {
                    rsData = setResultData(201, '图片识别失败', err);
                }
                res.send(rsData);

            });

        }else{
            rsData = setResultData(201, '图片识别失败', error);
            res.send(rsData);
        }

    });

}

/**
 * 获取图片资源的实际信息
 * @param req
 * @param res
 * @param cb
 */
function getImageInfo(req, res, cb){

    var imgUri = qnRsUrl + getFileName(imgPath) + '?imageInfo';
    request({ url: imgUri, headers: { 'Content-Type': 'text/plan' }}, function(err, response, info){
        (cb && typeof cb === 'function') && cb(err, response, info);
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
