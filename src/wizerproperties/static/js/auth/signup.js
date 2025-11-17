$(document).ready(function () {
    var sent_request = false;
    var $signupButton = $('[button-name="sign-up"]');
    var defaultButtonHtml = $signupButton.html();
    var loader_dom = '<span class="inline-flex items-center gap-2 text-primary-foreground">' +
                        '<svg class="h-5 w-5 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                            '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
                        '</svg>' +
                        '<span>Signing up…</span>' +
                     '</span>';

    // Show loader when form submit
    $("#create-profile-form").submit(function (e) {
        if (sent_request) {
            e.preventDefault();
            return false;
        }
        
        // Validate form fields
        var email = $('#email').val();
        var password1 = $('#password1').val();
        var password2 = $('#password2').val();
        var $emailInput = $('#email');
        var $password1Input = $('#password1');
        var $password2Input = $('#password2');
        
        $('.auth-response-messages').html('');
        $emailInput.attr('aria-invalid', 'false');
        $password1Input.attr('aria-invalid', 'false');
        $password2Input.attr('aria-invalid', 'false');
        $('#email-error').text('').attr('class', 'sr-only');
        $('#password1-error').text('').attr('class', 'sr-only');
        $('#password2-error').text('').attr('class', 'sr-only');
        
        if (email.trim() === '' || password1.trim() === '' || password2.trim() === '') {
            var errorMsg = '<div class="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm" role="alert" aria-live="polite">' +
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
                '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zM10 14a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>' +
                '<span>Please fill in all fields.</span></div>';
            $('.auth-response-messages').html(errorMsg);
            if (email.trim() === '') {
                $emailInput.attr('aria-invalid', 'true').focus();
                $('#email-error').text('Email is required').removeClass('sr-only');
            }
            if (password1.trim() === '') {
                $password1Input.attr('aria-invalid', 'true');
                $('#password1-error').text('Password is required').removeClass('sr-only');
            }
            if (password2.trim() === '') {
                $password2Input.attr('aria-invalid', 'true');
                $('#password2-error').text('Password confirmation is required').removeClass('sr-only');
            }
            $signupButton.html(defaultButtonHtml);
            $signupButton.attr('aria-busy', 'false').prop('disabled', false);
            sent_request = false;
            return false;
        }
        
        if (password1 !== password2) {
            var errorMsg = '<div class="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm" role="alert" aria-live="polite">' +
                '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
                '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zM10 14a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>' +
                '<span>Passwords do not match.</span></div>';
            $('.auth-response-messages').html(errorMsg);
            $password1Input.attr('aria-invalid', 'true');
            $password2Input.attr('aria-invalid', 'true');
            $('#password1-error').text('Passwords do not match').removeClass('sr-only');
            $('#password2-error').text('Passwords do not match').removeClass('sr-only');
            $signupButton.html(defaultButtonHtml);
            $signupButton.attr('aria-busy', 'false').prop('disabled', false);
            sent_request = false;
            return false;
        }
        
        // Show loader and allow form to submit
        $signupButton.html(loader_dom);
        $signupButton.attr('aria-busy', 'true').prop('disabled', true);
        sent_request = true;
        
        // Form will submit normally, page will reload on success/error
    });

});
