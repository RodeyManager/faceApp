/**
 * Created by Rodey on 15/5/16.
 * Lessions: www.senuu.com
 * Email: Rodeyluo@gmail.com
 */

var face = require('./modules/faceSdk');
var request = require('request');

/*var postData = {
    api_key: 'fae0d64949e418ec234978a31b80ab97',
    api_secret: 'uj70xIv-OvtB6TkLBCLzhtUfxiiXbSEF',
    url: 'http://img0.bdstatic.com/img/image/f3165146edddf5807b7cb40a426ffaaf1426747348.jpg',
    attribute: "gender,age,race,smiling,pose"
};*/

var postData = face.getConfig();
request.post('https://apicn.faceplusplus.com/v2/detection/detect', {form: postData}, function (error, response, body) {

    console.log(body);
});
