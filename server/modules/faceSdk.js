/**
 * Created by Rodey on 15/5/16.
 * Lessions: www.senuu.com
 * Email: Rodeyluo@gmail.com
 */

var apiKey = 'fae0d64949e418ec234978a31b80ab97';
var apiSecret = 'uj70xIv-OvtB6TkLBCLzhtUfxiiXbSEF';
var RE_TRIM = /^\/+|\/+$/g;
var apiUrl = 'https://apicn.faceplusplus.com/v2/';

var apis = {
    detech: apiUrl + 'detection/detect'
};

function getDefaultConfig(){

    var config = {
        url: 'http://img0.bdstatic.com/img/image/f3165146edddf5807b7cb40a426ffaaf1426747348.jpg',
        attribute: "gender,age,race,smiling,pose"
    };

    return config;

}

function getApiConfig(){
    return {
        api_key: apiKey,
        api_secret: apiSecret
    }
}

function setApiConfig(apiKey, apiSecret){
    apiKey = apiKey;
    apiSecret = apiSecret;
}

function getConfig(){

    var dcf = getDefaultConfig();
    var api = getApiConfig();
    var options = {};

    for( var key in dcf){
        if(options[key] == null){
            options[key] = dcf[key];
        }
    }

    for( var key in api){
        if(options[key] == null){
            options[key] = api[key];
        }
    }

    return options;

}


exports.getApiConfig = getApiConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.getConfig  = getConfig;
exports.apis = apis;
