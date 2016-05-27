var socket = io.connect();
//变量声明
var user = '',
    to = '',
    Arr = {};
$(function ($) {
    $("#nickname").on('blur',function () {
        if($('#nickname').val()){
            $('#sendNickName').removeAttr('disabled')
        }else{
            $('#sendNickName').attr('disabled','disabled')
        }
    });

    $('.menu').click(function () {
        $('.lchat').css({left:0})
        $(".masking").fadeIn();
    });
    $('.masking').click(function () {
        $('.masking').fadeOut()
        $('.lchat').css({left:-191+"px"})
    });
    //聊天
    var sendMessage = function () {
        if($('#message').val()==undefined||$('#message').val()==''){
            $('#message').attr('placeholder','请输入聊天信息');
            $('#message').blur();
        }else{
            socket.emit('message',{message:$('#message').val(),user:user,to:$('.chat-list').data('to')});
            $('#message').removeAttr('placeholder');
            $('#message').val("");
        }
    }
    socket.on('pmessage',function (data) {
        if(user == data.user){
            $('.user').each(function () {
                if($(this).find('.user-name').html() == data.to){
                    $(this).find('.messageShow').html(data.message);
                }
            });
            $('.chat-list').append('<div class="message me">' +
                '<div class="owner-head"><img class="img" alt="" src="'+$('#owner-head').attr('src')+'" width="40" height="40"></div>' +
                '<div class="bubble bubble_primary right" >' +
                '<div class="bubble_cont">' +
                '<div class="plain">' +
                '<span>'+data.message+'</span>' +
                '</div></div></div></div>');
            Arr[data.user+data.to]+='<div class="message me">' +
            '<div class="owner-head"><img class="img" alt="" src="'+$('#owner-head').attr('src')+'" width="40" height="40"></div>' +
            '<div class="bubble bubble_primary right" >' +
            '<div class="bubble_cont">' +
            '<div class="plain">' +
            '<span>'+data.message+'</span>' +
            '</div></div></div></div>';
        }else {
            if($('.chat-list').data('to') == data.user){
                $('.user').each(function () {
                    if($(this).find('.user-name').html() == data.user){
                        $(this).find('.messageShow').html(data.message);
                    }
                });
                $('.chat-list').append('<div class="message you">' +
                    '<div class="user-head"><img class="img" alt="" src="'+$('.user.active img').attr('src')+'" width="40" height="40"></div>' +
                    '<div class="bubble bubble_default left" >' +
                    '<div class="bubble_cont">' +
                    '<div class="plain">' +
                    '<span>'+data.message+'</span>' +
                    '</div></div></div></div>')
                Arr[data.to+data.user]+='<div class="message you">' +
                    '<div class="user-head"><img class="img" alt="" src="'+$('.user.active img').attr('src')+'" width="40" height="40"></div>' +
                    '<div class="bubble bubble_default left" >' +
                    '<div class="bubble_cont">' +
                    '<div class="plain">' +
                    '<span>'+data.message+'</span>' +
                    '</div></div></div></div>';
            }else {
                $('.user').each(function () {
                    if($(this).find('.user-name').html() == data.user){
                        $(this).find('.messageShow').html(data.message);
                        Arr[data.to+data.user]+='<div class="message you">' +
                            '<div class="user-head"><img class="img" alt="" src="'+$(this).find('img').attr('src')+'" width="40" height="40"></div>' +
                            '<div class="bubble bubble_default left" >' +
                            '<div class="bubble_cont">' +
                            '<div class="plain">' +
                            '<span>'+data.message+'</span>' +
                            '</div></div></div></div>';
                    }
                });
            }
        }
        $('.chat-list').scrollTop(999999);
    });
    $('#sendMessage').on('click',{},sendMessage);
    $("#message").on('keydown',function (e) {
        if(e.ctrlKey && e.which == 13 ){
            $("#sendMessage").click()
        }
    });

    $('.frm_search').keydown(function () {
        $('.user').addClass('hidden');
    }).keyup(function () {
        var index = $('.frm_search').val();
        if($('.frm_search').val()==''||$('.frm_search').val()==undefined){
            $('.user').removeClass('hidden');
        }else{
            $(".user-name:contains('"+index+"')").parents('.user').removeClass('hidden');
        }

    })

    $('.img-group img').click(function () {
        $('.img-group img').removeClass('active');
        $(this).addClass('active');
        $('#img-src').val($(this).attr('src'));
    })
    var sendNickName = function () {
        socket.emit('nickName',{nick:$('#nickname').val(),src:$('#img-src').val()},function (data) {
            //验证昵称是否存在
            if(data){
                user = $('#nickname').val();
                $('#login').remove();
                $('.chat').removeClass('hidden');
            }else{
                $('#nickname').before('<div class="alert alert-danger" role="alert">对不起，该昵称已存在</div>');
            }


        });
    }
    $('#sendNickName').on("click",{},sendNickName);
    socket.on('owner',function (data) {
        $('#owner-head').attr('src',data.src);
        $('#owner-name').html(data.nick);
    })
    //生成用户列表
    socket.on('addUser',function (data) {
        if($("#userList").data('type') == 0){
            var tmpdiv = $('<div id="tmp"></div>');
            $.each(data.nicknames,function (name,value) {
                var userp = '<div class="user">' +
                    '<div class="user-head"><img width="40" height="40" src="'+value[1]+'"></div>' +
                    '<div class="user-body">' +
                    '<div class="user-name ellipsis">'+value[0]+'</div>' +
                    '<div class="messageShow ellipsis"></div>' +
                    '</div></div>';
                tmpdiv.append(userp);
                Arr[user + value[0]] = '';
            })
            $('#userList').append(tmpdiv);
            $('#userList').data('type',1)
        }else{
            if(data.add == user){
                return;
            }else{
                var userp = '<div class="user">' +
                    '<div class="user-head"><img width="40" height="40" src="'+data.src+'"></div>' +
                    '<div class="user-body">' +
                    '<div class="user-name ellipsis">'+data.add+'</div>' +
                    '<div class="messageShow ellipsis"></div>' +
                    '</div></div>';
                $('#tmp').append(userp);
                Arr[user + data.add] = '';
            }
        }
        $('.user').each(function () {
            if($(this).find('.user-name').html() == user){
                $(this).remove();
            }
        })

    });
    //给点击用户名绑定事件
    $('#userList').on('click','.user',function () {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $('.chat-list').data('to', $(this).find('.user-name').html()).data('user', user);
        $('.name').html($(this).find('.user-name').html());
        $('.chat-list').empty();
        $('.chat-list').html(Arr[user+$(this).find('.user-name').html()]);
        if($(window).width() <= 500){
            $('.lchat').css('left',-$(window).width()+'px')
            $('.back').click(function () {
                $('.lchat').css('left',0)
            });
        }
        $('.chat-send').removeClass('hidden');
    });

    //创建压缩图片用的canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    var maxsize = 300 * 1024;

    //图片上传
    $('#img-send').change(readFile);
    function readFile(){
        var file = this.files[0];
        if(!/image\/\w+/.test(file.type)){
            alert("文件必须为图片！");
            return false;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
            console.log($('#img-send'))
            var img = new Image,
                width = 1800,    //图片resize宽度
                quality = 0.9,  //图像质量
                canvas = document.createElement("canvas"),
                drawer = canvas.getContext("2d");
            img.src = this.result;
            canvas.width = width;
            canvas.height = width * (img.height / img.width);
            drawer.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = canvas.toDataURL("image/jpeg", quality);
            socket.emit('img',{src:img.src,user:user,to:$('.chat-list').data('to')})
        }
    }

    socket.on('pimg',function (data) {
        if (user == data.user) {
            $('.user').each(function () {
                if ($(this).find('.user-name').html() == data.to) {
                    $(this).find('.messageShow').html('[图片]');
                }
            });
            $('.chat-list').append('<div class="message me">' +
                '<div class="owner-head"><img class="img" alt="" src="' + $('#owner-head').attr('src') + '" width="40" height="40"></div>' +
                '<div class="bubble bubble_primary right" >' +
                '<div class="bubble_cont">' +
                '<div class="plain">' +
                '<img src="' + data.src + '" alt="" width=100%>' +
                '</div></div></div></div>');
            Arr[data.user + data.to] += '<div class="message me">' +
                '<div class="owner-head"><img class="img" alt="" src="' + $('#owner-head').attr('src') + '" width="40" height="40"></div>' +
                '<div class="bubble bubble_primary right" >' +
                '<div class="bubble_cont">' +
                '<div class="plain">' +
                '<img src="' + data.src + '" alt="" width="100%">' +
                '</div></div></div></div>';
        } else {
            if ($('.chat-list').data('to') == data.user) {
                $('.user').each(function () {
                    if ($(this).find('.user-name').html() == data.user) {
                        $(this).find('.messageShow').html('[图片]');
                    }
                });
                $('.chat-list').append('<div class="message you">' +
                    '<div class="user-head"><img class="img" alt="" src="' + $('.user.active img').attr('src') + '" width="40" height="40"></div>' +
                    '<div class="bubble bubble_default left" >' +
                    '<div class="bubble_cont">' +
                    '<div class="plain">' +
                    '<img src="' + data.src + '" alt="" width=100%>' +
                    '</div></div></div></div>')
                Arr[data.to + data.user] += '<div class="message you">' +
                    '<div class="user-head"><img class="img" alt="" src="' + $('.user.active img').attr('src') + '" width="40" height="40"></div>' +
                    '<div class="bubble bubble_default left" >' +
                    '<div class="bubble_cont">' +
                    '<div class="plain">' +
                    '<img src="' + data.src + '" alt="" width="100%">' +
                    '</div></div></div></div>';
            } else {
                $('.user').each(function () {
                    if ($(this).find('.user-name').html() == data.user) {
                        $(this).find('.messageShow').html('[图片]');
                        Arr[data.to + data.user] += '<div class="message you">' +
                            '<div class="user-head"><img class="img" alt="" src="' + $(this).find('img').attr('src') + '" width="40" height="40"></div>' +
                            '<div class="bubble bubble_default left" >' +
                            '<div class="bubble_cont">' +
                            '<div class="plain">' +
                            '<img src="' + data.src + '" alt="" width=100%>' +
                            '</div></div></div></div>';
                    }
                });
            }
        }
        $('.chat-list').scrollTop(999999);
    });
    $('#img-get').click(function () {
        $('#img-send').click();
    })
    //用户离开
    socket.on('leave',function (data) {
        $('.user').each(function (i) {
            if($(this).find('.user-name').html() == data){
                $(this).remove();
            }
        });
    })
})