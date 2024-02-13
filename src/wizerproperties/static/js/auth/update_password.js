$(document).ready(function () {
    var sent_request = false;
    var loader_dom = '<div id="loadingSpinner" class="spinner-border" role="status">'+
                        '<span class="sr-only">Loading...</span>' +
                      '</div>'

    $('[button-name="update-password"]').click(function () {
        if(sent_request) return;
        var password1 = $('[name="password1"]').val();
        var password2 = $('[name="password2"]').val();

        if(
            password1.trim() == '' ||
            password2.trim() == ''
        ){
            var msg_dom = '<div class="alert alert-danger p-2" role="alert">Fill up the passwords field</div>'
            $('.auth-response-messages').html(msg_dom);
            return;
        };

        if( password1 != password2  ){
            var msg_dom = '<div class="alert alert-danger p-2" role="alert">Password not matching</div>'
            $('.auth-response-messages').html(msg_dom);
            return;
        };

        $(this).html(loader_dom);
        sent_request = true;

        $.ajax({
            type: "POST",
            url: update_password_url,
            data: {
                password1: password1,
                password2: password2,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                var msg_dom = '<div class="alert alert-success p-2" role="alert">'+ response.message +'</div>'
                $('.auth-response-messages').html(msg_dom)

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                errorMessages = ""
                for (let i = 0; i < error.responseJSON.message.length; i++) {
                    errorMessages += error.responseJSON.message[i]
                }

                var msg_dom = '<div class="alert alert-danger p-2" role="alert">'+ errorMessages +'</div>'
                $('.auth-response-messages').html(msg_dom)
                
            },
            complete: function(){
                sent_request = false;
                $('[button-name="update-password"]').html('Save')
            }
        });
    });
});
