var socket = io.connect();
//变量声明
var user = '',
    to = '',
    Arr = {};
$(function ($) {
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
        socket.emit('message',{message:$('#message').html(),user:user,to:$('.chat-list').data('to')});
        $('#message').html("");
    }
    socket.on('pmessage',function (data) {

        if(user == data.user){
            $('.user').each(function () {
                if($(this).find('.user-name').html() == data.to){
                    $(this).find('.messageShow').html(data.message);
                }
            });
            $('.chat-list').append('<div class="message me">' +
                '<div class="owner-head"><img class="img" alt="" src="img/chat1.jpg" width="40" height="40"></div>' +
                '<div class="bubble bubble_primary right" >' +
                '<div class="bubble_cont">' +
                '<div class="plain">' +
                '<span>'+data.message+'</span>' +
                '</div></div></div></div>');
            Arr[data.user+data.to]+='<div class="message me">' +
            '<div class="owner-head"><img class="img" alt="" src="img/chat1.jpg" width="40" height="40"></div>' +
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
                    '<div class="user-head"><img class="img" alt="" src="img/chat1.jpg" width="40" height="40"></div>' +
                    '<div class="bubble bubble_default left" >' +
                    '<div class="bubble_cont">' +
                    '<div class="plain">' +
                    '<span>'+data.message+'</span>' +
                    '</div></div></div></div>')
                Arr[data.to+data.user]+='<div class="message you">' +
                    '<div class="user-head">'+data.to.substr(data.to.length-1,1)+'</div>' +
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
                            '<div class="user-head"><img class="img" alt="" src="img/chat1.jpg" width="40" height="40"></div>' +
                            '<div class="bubble bubble_default left" >' +
                            '<div class="bubble_cont">' +
                            '<div class="plain">' +
                            '<span>'+data.message+'</span>' +
                            '</div></div></div></div>';
                    }
                });
            }
        }
    });
    $('#sendMessage').on('click',{},sendMessage);

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
            }else{
                $('#nickname').after('<span class="text-warning">对不起，该昵称已存在。</span>');
            }
            $('#login').remove();
            $('.chat').removeClass('hidden');

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


    //用户离开
    socket.on('leave',function (data) {
        $('.user-name').each(function (i) {
            if($(this).html() == data.name){
                $(this).parents('.user').remove();
            }
        });
    })
})