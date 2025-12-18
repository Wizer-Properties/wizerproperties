$(document).ready(function () {
    var sent_request = false;
    var $updateButton = $('#update-profile-button');
    var defaultButtonHtml = $updateButton.html();
    var loader_dom = '<span class="inline-flex items-center gap-2 text-primary-foreground">' +
                        '<svg class="h-5 w-5 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                            '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
                        '</svg>' +
                        '<span>Updating…</span>' +
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

    // File handle
    $("input[name='company_logo']").change(function () {
        var fileName = $(this)[0].files[0] ? $(this)[0].files[0].name : 'Select a file';
        $(".fileName").text(fileName);

        // Update preview if image exists
        if ($(this)[0].files && $(this)[0].files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var logoDiv = $(".companyLogoDiv");
                if (logoDiv.length === 0) {
                    // Create logo div if it doesn't exist
                    $("input[name='company_logo']").parent().before('<div class="flex justify-center pb-6 companyLogoDiv"><img src="' + e.target.result + '" alt="Company Logo" class="max-w-[200px] rounded-xl border border-border shadow-sm"></div>');
                } else {
                    logoDiv.find('img').attr('src', e.target.result);
                }
            }
            reader.readAsDataURL($(this)[0].files[0]);
        }
    });

    $("#profile-form").submit(function (event) {
        event.preventDefault();
        if(sent_request) return;

        $('.auth-response-messages').html('');

        // Get phone code and phone number values
        var phoneCode = $("#phone_code").val();
        var phoneNumber = $("input[name='phone_number']").val();
        var fullPhoneNumber = phoneCode + phoneNumber;

        var formData = new FormData(/** @type {HTMLFormElement} */ (this));

        // Set modified phone number in formData
        formData.set("phone_number", fullPhoneNumber);

        // Remove phone_code from formData
        formData.delete("phone_code");

        $updateButton.html(loader_dom);
        $updateButton.prop('disabled', true).attr('aria-busy', 'true');
        sent_request = true;

        $.ajax({
            url: profileSettingsUrl,
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response, status, xhr) {
                if (xhr.status == 200) {
                    $('.auth-response-messages').html(renderMessage('success', 'Profile updated successfully!'));
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 400) {
                    // Bad Request (validation error)
                    var errorData = xhr.responseJSON;
                    var errorMessages = "";
                    for (var key in errorData) {
                        if (errorData.hasOwnProperty(key)) {
                            errorMessages += renderMessage('error', errorData[key][0]);
                        }
                    }
                    $('.auth-response-messages').html(errorMessages);
                } else {
                    $('.auth-response-messages').html(renderMessage('error', 'An error occurred. Please try again later.'));
                }
            },
            complete: function(){
                sent_request = false;
                $updateButton.html(defaultButtonHtml);
                $updateButton.prop('disabled', false).attr('aria-busy', 'false');
            }
        });
    });
});
