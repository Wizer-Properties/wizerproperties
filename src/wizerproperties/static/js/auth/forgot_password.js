$(document).ready(function () {
    var sent_request = false;
    var loader_dom = '<div id="loadingSpinner" class="spinner-border" role="status">'+
                        '<span class="sr-only">Loading...</span>' +
                    '</div>'

    $('[button-name="forgot-password"]').click(function () {
        if(sent_request) return;
        var email = $('[name="email"]').val();
        $('.auth-response-messages').html('');

        if(email.trim() == ''){
            var msg_dom = '<div class="alert alert-danger p-2" role="alert">Fill up with email.</div>'
            $('.auth-response-messages').html(msg_dom);
            return;
        };

        $(this).html(loader_dom);
        sent_request = true;

        $.ajax({
            type: "POST",
            url: forgot_password_url,
            data: {
                email: email,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                var msg_dom = '<div class="alert alert-success p-2" role="alert"> Successfully done. </div>'
                $('.auth-response-messages').html(msg_dom)

                window.location.href = forgot_password_verify_url;
            },
            error: function (error) {
                msg = error.responseJSON.message;
                if (error.status == 401) {
                    msg = error.responseJSON.message;
                }
                var msg_dom = '<div class="alert alert-danger p-2" role="alert">'+ msg +'</div>'
                $('.auth-response-messages').html(msg_dom)
            },
            complete: function(){
                sent_request = false;
                $('[button-name="forgot-password"]').html('Log In')
            }
        });
    });


});
