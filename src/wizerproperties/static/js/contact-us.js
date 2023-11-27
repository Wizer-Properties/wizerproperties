$(document).ready(function(){
    

    $('.submit-button button').click(function(){
        var get_email = $('[name="email"]').val();
        var get_subject = $('[name="subject"]').val();
        var get_body = $('[name="body"]').val();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        $('.warrning-text').html('');
        if(
            get_email.trim() == '' ||
            !emailRegex.test(get_email)
        ){
            $('.warrning-text').append('<p> Wrong email. </p>');
        };

        if(get_subject.trim() == '') $('.warrning-text').append('<p> Subject is empty. </p>');
        if(get_body.trim() == '') $('.warrning-text').append('<p> Message is empty. </p>');

        if(
            get_email.trim() == '' ||
            !emailRegex.test(get_email) ||
            get_subject.trim() == '' ||
            get_body.trim() == ''
        ){
            return;
        };

        var data = {
            email : get_email,
            subject : get_subject,
            body : get_body
        };

        sending_message(data, $(this))
    });


    function sending_message(data, submit_btn_dom){
        $.ajax({
            url: '/core/api/contact/',
            type: 'POST',
            data: data,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend : function (){
                var loader_file = '<img src="/static/media/loader.svg" alt="loading...">';
                submit_btn_dom.prepend(loader_file);
            },
            success : function (data) {
                submit_btn_dom.html('Submit');
                $('.contact-form').prepend('<div class="alert alert-success" role="alert"> Your message succsesfully sent. </div>');
                $('[name="email"]').val('');
                $('[name="subject"]').val('');
                $('[name="body"]').val('');
            },
            error: function (error) {
                submit_btn_dom.html('Submit');
            }
        });
    }
});