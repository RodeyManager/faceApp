/**
 * Created by Rodey on 15/5/16.
 * Lessions: www.senuu.com
 * Email: Rodeyluo@gmail.com
 */

window.onload = function(){

    var box = document.querySelector('#box');
    var span = document.querySelector('#border');
    var pre = document.querySelector('#response');
    var img = document.querySelector('#img');
    var startBtn = document.querySelector('#start');
    var imgUrl = document.querySelector('#imgUrl');
    var imgW = 0, imgH = 0;

    startBtn.onclick = loadImage;

    function loadImage(){

        if(imgUrl.value.indexOf('http') === -1){
            pre.innerHTML = '请输入合法的url地址';
            return;
        }

        box.querySelector('.temp');
        pre.innerHTML = 'Loading...';

        img.src = imgUrl.value;
        var newImg = new Image();
        newImg.src = imgUrl.value;
        newImg.onload = function(){
            startDetch();
        };

    }


    function startDetch(){

        pre.innerHTML = 'Loading...';

        var api = new FacePP('fae0d64949e418ec234978a31b80ab97', 'PYNn3r2ySdeBgICAHiAovbYF_6sLBO3R');
        api.request('detection/detect', {
            url: imgUrl.value,
            attribute: "gender,age,race,smiling,pose"
        }, function(err, result){
            if(err){
                // TODO handle error
                pre.innerHTML = '无法解析该图片';
                return;
            }
            // TODO use result
            //document.getElementById('response').innerHTML = JSON.stringify(result, null, 2);
            console.log(result);

            pre.innerHTML = '';
            //解析数据，显示边框
            parseData(result);

        });

    }

    /**
     * 解析数据，显示内容
     * @param data
     */
    function parseData(data){
        imgW = data.img_width;
        imgH = data.img_height;
        box.style.width = imgW + 'px';
        box.style.height = imgH + 'px';
        pre.style.width = imgW + 'px';

        var faces = data.face;
        if(faces.length === 0){
            pre.innerHTML = '无法解析该图片';
            return;
        }
        for(var i = 0; i < faces.length; i++){
            var face = faces[i];
            var position = face.position;
            var center = position.center;
            var attribute = face.attribute;
            var w = position.width, h = position.height;
            var pose = attribute.pose;

            var span = document.createElement('span');
            span.setAttributeNode('class', 'temp');

            //Math.round((d.position.center.x - d.position.width / 2) * a.width * 0.01),
            span.style.width = Math.round(w * .01 * imgW) + 'px';
            span.style.height = Math.round(h * .01 * imgH) + 'px';
            span.style.opacity = 1;
            //span.style.left = Math.round(center.x * .01 * ( imgW >> 1 )) + 'px';
            //span.style.top = Math.round(center.y * .01 * ( imgH >> 1 )) + 'px';
            span.style.left = Math.round((center.x - (w >> 1)) * imgW * .01) + 'px';
            span.style.top = Math.round((center.y - (h >> 1)) * imgH * .01) + 'px';
            span.style.webkitTransform = 'rotateZ(' + pose.roll_angle.value + 'deg)';
            box.appendChild(span);

            pre.innerHTML += '性别: ' + formateGender(attribute.gender.value) + ';  年龄: ' + attribute.age.value + "\n";

        }

    }

    function formateGender(sex){
        if(sex && 'Male' === sex){
            return '男';
        }else{
            return '女';
        }
    }

};
