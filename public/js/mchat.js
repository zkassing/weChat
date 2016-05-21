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
    }
    socket.on('pmessage',function (data) {

        if(user == data.user){
            $('.user').each(function () {
                if($(this).find('.user-name').html() == data.to){
                    $(this).find('.messageShow').html(data.message);
                }
            });
            $('.chat-list').append('<div class="message me">' +
                '<div class="owner-head">'+data.user.substr(data.user.length-1,1)+'</div>' +
                '<div class="bubble bubble_primary right" >' +
                '<div class="bubble_cont">' +
                '<div class="plain">' +
                '<span>'+data.message+'</span>' +
                '</div></div></div></div>');
            Arr[data.user+data.to]+='<div class="message me">' +
            '<div class="owner-head">'+data.user.substr(data.user.length-1,1)+'</div>' +
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
                    '<div class="user-head">'+data.to.substr(data.to.length-1,1)+'</div>' +
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
                            '<div class="user-head">'+data.to.substr(data.to.length-1,1)+'</div>' +
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

    var sendNickName = function () {
        socket.emit('nickName',$('#nickname').val(),function (data) {
            //验证昵称是否存在
            if(data){
                user = $('#nickname').val();
            }else if($('#nickname').val() == 'allofpeople'){
                $('#nickname').after('<span class="text-warning">对不起，该昵称已存在。</span>');
            }else{
                $('#nickname').after('<span class="text-warning">对不起，该昵称已存在。</span>');
            }
            $('#login').remove();
            $('.chat').removeClass('hidden');

        });
    }
    $('#sendNickName').on("click",{},sendNickName);
    socket.on('owner',function (data) {
        $('#owner-head').html(data.head);
        $('#owner-name').html(data.name);
    })
    socket.on('addUser',function (data) {
        if(data.nicknames.indexOf(user) !== -1){
            data.nicknames.splice(data.nicknames.indexOf(user),1);
        }
        if($("#userList").data('type') == 0){
            var tmpdiv = $('<div id="tmp"></div>')
            $.each(data.nicknames,function (i) {
                var userp = $('<div class="user"></div>'),
                    user_head = $('<div class="user-head">'+data.nicknames[i].substr(data.nicknames[i].length-1,1)+'</div>'),
                    user_body = $('<div class="user-body"></div>'),
                    user_name = $('<div class="user-name ellipsis">'+data.nicknames[i]+'</div>'),
                    user_message = $('<div class="messageShow ellipsis"></div>');
                user_body.append(user_name).append(user_message);
                userp.append(user_head).append(user_body);
                tmpdiv.append(userp);
                Arr[user + data.nicknames[i]] = '';
            })
            $('#userList').append(tmpdiv);
            $('#userList').data('type',1)
        }else{
            if(data.add == user){
                return;
            }else{
                var userp = $('<div class="user"></div>'),
                    user_head = $('<div class="user-head">'+ data.name +'</div>'),
                    user_body = $('<div class="user-body"></div>'),
                    user_name = $('<div class="user-name ellipsis">'+data.add+'</div>'),
                    user_message = $('<div class="messageShow ellipsis"></div>');
                user_body.append(user_name).append(user_message);
                userp.append(user_head).append(user_body);
                $('#tmp').append(userp);
                Arr[user + data.add] = '';
            }
        }
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