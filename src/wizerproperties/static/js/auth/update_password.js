$(document).ready(function () {
    var sent_request = false;
    var $updateButton = $('[button-name="update-password"]');
    var defaultButtonHtml = $updateButton.html();
    var loader_dom = '<span class="inline-flex items-center gap-2 text-primary-foreground">' +
                        '<svg class="h-5 w-5 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                            '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
                        '</svg>' +
                        '<span>Saving…</span>' +
                     '</span>';

    function renderMessage(type, text) {
        var baseClasses = 'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm';
        var icon = '';
        var variantClasses = '';
        var role = type === 'success' ? 'status' : 'alert';

        if (type === 'success') {
            variantClasses = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700';
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 011.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z" clip-rule="evenodd"/></svg>';
        } else {
            variantClasses = 'border-destructive/40 bg-destructive/10 text-destructive';
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zM10 14a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>';
        }

        return '<div class="' + baseClasses + ' ' + variantClasses + '" role="' + role + '" aria-live="polite">' +
                    icon +
                    '<span>' + text + '</span>' +
               '</div>';
    }

    $('[button-name="update-password"]').click(function () {
        if(sent_request) return;
        var password1 = $('[name="password1"]').val();
        var password2 = $('[name="password2"]').val();
        var $password1Input = $('#password1');
        var $password2Input = $('#password2');
        var $button = $(this);
        
        $('.auth-response-messages').html('');
        $password1Input.attr('aria-invalid', 'false');
        $password2Input.attr('aria-invalid', 'false');
        $('#password1-error').text('').attr('class', 'sr-only');
        $('#password2-error').text('').attr('class', 'sr-only');

        if(password1.trim() == '' || password2.trim() == ''){
            $('.auth-response-messages').html(renderMessage('error', 'Please fill in both password fields.'));
            if (password1.trim() == '') {
                $password1Input.attr('aria-invalid', 'true').focus();
                $('#password1-error').text('Password is required').removeClass('sr-only');
            }
            if (password2.trim() == '') {
                $password2Input.attr('aria-invalid', 'true');
                $('#password2-error').text('Password confirmation is required').removeClass('sr-only');
            }
            return;
        };

        if(password1 != password2){
            $('.auth-response-messages').html(renderMessage('error', 'Passwords do not match.'));
            $password1Input.attr('aria-invalid', 'true');
            $password2Input.attr('aria-invalid', 'true');
            $('#password1-error').text('Passwords do not match').removeClass('sr-only');
            $('#password2-error').text('Passwords do not match').removeClass('sr-only');
            return;
        };

        $button.html(loader_dom);
        $button.attr('aria-busy', 'true').prop('disabled', true);
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
                $('.auth-response-messages').html(renderMessage('success', response.message || 'Password updated successfully.'));
                $password1Input.attr('aria-invalid', 'false');
                $password2Input.attr('aria-invalid', 'false');
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                var errorMessages = "";
                if (error.responseJSON && error.responseJSON.message) {
                    if (Array.isArray(error.responseJSON.message)) {
                        errorMessages = error.responseJSON.message.join(' ');
                    } else {
                        errorMessages = error.responseJSON.message;
                    }
                } else {
                    errorMessages = "Something went wrong. Please try again.";
                }
                $('.auth-response-messages').html(renderMessage('error', errorMessages));
                $password1Input.attr('aria-invalid', 'true');
                $password2Input.attr('aria-invalid', 'true');
                $('#password1-error').text(errorMessages).removeClass('sr-only');
            },
            complete: function(){
                sent_request = false;
                $button.html(defaultButtonHtml);
                $button.attr('aria-busy', 'false').prop('disabled', false);
            }
        });
    });
});
