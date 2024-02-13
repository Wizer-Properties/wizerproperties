$(document).ready(function () {

    var sent_request = false;
    var loader_dom = '<div id="loadingSpinner" class="spinner-border" role="status">'+
                        '<span class="sr-only">Loading...</span>' +
                      '</div>'

    $('[button-name="log-in"]').click(function () {
        console.log("=========")
        if(sent_request) return;
        var email = $('[name="email"]').val();
        var password = $('[name="password"]').val();
        $('.auth-response-messages').html('');

        if(
            email.trim() == '' ||
            password.trim() == ''
        ){
            var msg_dom = '<div class="alert alert-danger p-2" role="alert">Fill up with email and password</div>'
            $('.auth-response-messages').html(msg_dom);
            return;
        };

        $(this).html(loader_dom);
        sent_request = true;

        $.ajax({
            type: "POST",
            url: login_url,
            data: {
                email: email,
                password: password,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                var msg_dom = '<div class="alert alert-success p-2" role="alert">'+ response.message +'</div>'
                $('.auth-response-messages').html(msg_dom)

                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                msg = "Something went wrong!";
                if (error.status == 401) {
                    msg = error.responseJSON.message;
                }
                var msg_dom = '<div class="alert alert-danger p-2" role="alert">'+ msg +'</div>'
                $('.auth-response-messages').html(msg_dom)
            },
            complete: function(){
                sent_request = false;
                $('[button-name="log-in"]').html('Log In')
            }
        });
    });
});
