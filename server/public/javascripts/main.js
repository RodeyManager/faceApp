/**
 * Created by rodey on 15/5/19.
 */


$(function(){

    //api
    var apis = {
        convert: '/convert',
        upload: '/upload',
        detech: '/detech'
    };

    var imgBox = $('#img-box'),
        fileDom = $('#file'),
        resultDom = $('#result-img'),
        loadingIconDom = $('#loading-icon'),
        imgData, imgProps, isPost = false;

    //选择图片后将图片按照正常比例压缩输出 Convert Image
    fileDom.on('change', readFile, false);

    /**
     * 读取上传的图片, 并以base64数据上传至 server
     * @param evt
     * @returns {boolean}
     */
    function readFile(evt){

        //获取图片
        var file = this.files[0];
        if(!file) return;
        //先清楚之前的span
        imgBox.find('div.temp').remove();
        resultDom.removeAttr('src');
        //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
        if(!/image\/\w+/.test(file.type)){
            errorHandler(null, null, "请确保文件为图像类型");
            return false;
        }

        if(isPost === true) return;
        showOrHide_LoadingIcon(true);

        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            if(this.result){
                imgData = this.result;
                convertImageServer(imgData, file);
            }
        };

    }

    /**
     * 处理上传的图片, 返回处理后的结果
     * @param imgData
     * @param file
     */
    function convertImageServer(imgData, file){

        var postData = { imgData: imgData, file: JSON.stringify(file) };
        $.ajax({
            url: apis.convert,
            data: postData,
            type: 'POST',
            dataType: 'json',
            success: function(res){
                showOrHide_LoadingIcon(false);
                if(res.code == 200){
                    imgProps = JSON.parse(res.params);
                    console.log(res);
                    resultDom.attr('src', res.dt).css({
                        'margin-top': (502 - imgProps.height) *.5,
                        'margin-left': (402 - imgProps.width) *.5
                    });
                } else {
                    errorHandler();
                }
            },
            error: function(xhr, err){
                errorHandler(xhr, err);
                showOrHide_LoadingIcon(false);
            }
        });

    }


    /**
     * 开始识别
     */

    $('#detechBtn').click(function(){

        if(isPost === true) return;
        showOrHide_LoadingIcon(true);

        var postData = { imgUrl: resultDom.attr('src') };
        $.ajax({
            url: apis.detech,
            data: postData,
            type: 'POST',
            dataType: 'json',
            success: function(res){
                showOrHide_LoadingIcon(false);
                if(res.code == 200){
                    addTechs(JSON.parse(res.dt));
                } else {
                    errorHandler();
                }
            },
            error: function(xhr, err){
                errorHandler(xhr, err);
                showOrHide_LoadingIcon(false);
            }
        });

    });

    function addTechs(data){

        if(data.error){
            errorHandler(null, null, '图片识别失败，请重试');
            return;
        }

        var faces = data.face,
            i = 0,
            len = faces.length;

        if(faces.length === 0){
            errorHandler(null, null, '无法解析该图片');
            return;
        }
        for(; i < len; ++i){
            appendSpan(faces[i], data);
        }

    }

    function appendSpan(face, data){

        var imageInfo = data.imageInfo,
            /*imgW = imageInfo.width,
            imgH = imageInfo.height,*/
            imgW = data.img_width,
            imgH = data.img_height;

        var position = face.position,
            center = position.center,
            attribute = face.attribute,
            w = position.width,
            h = position.height,
            pose = attribute.pose;

        var tw = Math.round(w * .01 * imgW),
            th = Math.round(h * .01 * imgH)

        //Create tech box tag
        var tech = document.createElement('div');
        tech.setAttribute('class', 'temp');
        tech.style.width = tw + 'px';
        tech.style.height = th + 'px';
        tech.style.left = Math.round((center.x - (w >> 1)) * imgW * .01) + (402 - imgW) * .5 + 'px';
        tech.style.top = Math.round((center.y - (h >> 1)) * imgH * .01) + (502 - imgH) * .5 + 'px';
        tech.style.webkitTransform = 'rotateZ(' + pose.roll_angle.value + 'deg)';
        imgBox.append(tech);

        //Create bottom box( sex|age ) tag
        var span = $('<span />').css({
            'width': tw + 4,
            'margin-top': th
        }).appendTo($(tech));
        //Create icon tag
        var icon = $('<i />').css({ 'margin-top': th + 5 }).appendTo(span).attr('title', formateGender(attribute.gender.value));
        if('Male' === attribute.gender.value){
            icon.addClass('male');
        } else {
            icon.addClass('female');
        }
        //Create age tag
        var strong = $('<strong />').text(attribute.age.value).appendTo(span);

        $(tech).animate({ opacity: 1 }, 1000, 'linner');


        var rsText = '性别: ' + formateGender(attribute.gender.value) + ';  年龄: ' + attribute.age.value + "\n";
        console.log(rsText);

    }

    function formateGender(sex){
        if(sex && 'Male' === sex){
            return '男';
        }else{
            return '女';
        }
    }

    function showOrHide_LoadingIcon(flag){
        if(flag === true){
            loadingIconDom.show();
            isPost = true;
        } else {
            loadingIconDom.hide();
            isPost = false;
        }

    }

    function errorHandler(xhr, error, msg){
        alert(msg || '图片上传失败，请重试');
    }

});