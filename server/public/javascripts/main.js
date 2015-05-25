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

    var fileDom = $('#file'),
        resultDom = $('#result-img'),
        imgData, imgProps;

    //选择图片后将图片按照正常比例压缩输出 Convert Image
    fileDom.on('change', readFile, false);

    /**
     * 读取上传的图片, 并以base64数据上传至 server
     * @param evt
     * @returns {boolean}
     */
    function readFile(evt){

        var file = this.files[0];
        //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
        if(!/image\/\w+/.test(file.type)){
            alert("请确保文件为图像类型");
            return false;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            if(this.result){
                imgData = this.result;
                //resultDom.attr('src', imgData);
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
                console.log(res);
                if(res.code == 200){
                    resultDom.attr('src', res.dt);
                    imgProps = res.params;
                }
            },
            error: function(err){
                alert('图片上传失败, 请重试');
            }
        });

    }


    /**
     * 开始识别
     */

    $('#detechBtn').click(function(){

        var postData = { imgUrl: location.href + resultDom.attr('src') };
        $.ajax({
            url: apis.detech,
            data: postData,
            type: 'POST',
            dataType: 'json',
            success: function(res){
                console.log(res);
            },
            error: function(xhr, err){
                alert('识别失败, 请重试');
            }
        });



    });



});