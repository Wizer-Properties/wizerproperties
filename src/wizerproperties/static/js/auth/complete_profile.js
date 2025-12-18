$(document).ready(function () {
    var sent_request = false;
    var $completeButton = $('[button-name="complete-profile"]');
    var defaultButtonHtml = $completeButton.html();
    var loader_dom = '<span class="inline-flex items-center gap-2 text-primary-foreground">' +
                        '<svg class="h-5 w-5 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                            '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
                        '</svg>' +
                        '<span>Completing profile…</span>' +
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

    function prospect_form() {
        var inputClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
        var selectClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
        
        return(
            '<div class="space-y-2">' +
                '<label for="first_name" class="text-sm font-medium text-muted-foreground">First Name</label>' +
                '<input id="first_name" type="text" name="first_name" placeholder="First Name" value="'+(user_first_name || "") +'" required aria-required="true" aria-describedby="first-name-error" aria-invalid="false" autocomplete="given-name" class="' + inputClasses + '">' +
                '<div id="first-name-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<div class="space-y-2">' +
                '<label for="last_name" class="text-sm font-medium text-muted-foreground">Last Name</label>' +
                '<input id="last_name" type="text" name="last_name" placeholder="Last Name" value="'+(user_last_name || "")+'" required aria-required="true" aria-describedby="last-name-error" aria-invalid="false" autocomplete="family-name" class="' + inputClasses + '">' +
                '<div id="last-name-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<div class="space-y-2">' +
                '<label for="gender" class="text-sm font-medium text-muted-foreground">Gender</label>' +
                '<select id="gender" name="gender" required aria-required="true" aria-describedby="gender-error" aria-invalid="false" class="' + selectClasses + '">' +
                    '<option value="">Select Gender</option>' +
                    '<option value="male">Male</option>' +
                    '<option value="female">Female</option>' +
                '</select>' +
                '<div id="gender-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<div class="space-y-2">' +
                '<label for="address" class="text-sm font-medium text-muted-foreground">Address</label>' +
                '<input id="address" type="text" name="address" class="pac-input ' + inputClasses + '" placeholder="Address" required aria-required="true" aria-describedby="address-error" aria-invalid="false" autocomplete="street-address">' +
                '<div id="address-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            '<input name="latitude" label="latitude" label-name="latitude" type="text" placeholder="Latitude" style="display:none;" aria-hidden="true">' +
            '<input name="longitude" label="longitude" label-name="longitude" type="text" placeholder="Longitude" style="display:none;" aria-hidden="true">'
        )
    }

    function agent_and_developer_form() {
        var inputClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
        var selectClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
        var textareaClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none';
        var fileInputClasses = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90';
        
        return(
            '<div class="space-y-2">' +
                '<label for="company_logo" class="text-sm font-medium text-muted-foreground">Company Logo</label>' +
                '<input id="company_logo" type="file" accept="image/*" name="company_logo" required aria-required="true" aria-describedby="company-logo-error" aria-invalid="false" class="' + fileInputClasses + '">' +
                '<div id="company-logo-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<div class="space-y-2">' +
                '<label for="company_name" class="text-sm font-medium text-muted-foreground">Company Name</label>' +
                '<input id="company_name" type="text" name="company_name" placeholder="Company Name" required aria-required="true" aria-describedby="company-name-error" aria-invalid="false" autocomplete="organization" class="' + inputClasses + '">' +
                '<div id="company-name-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<div class="space-y-2">' +
                '<label for="company_address" class="text-sm font-medium text-muted-foreground">Company Address</label>' +
                '<input id="company_address" type="text" name="address" class="pac-input ' + inputClasses + '" placeholder="Company Address" required aria-required="true" aria-describedby="company-address-error" aria-invalid="false" autocomplete="street-address">' +
                '<div id="company-address-error" class="sr-only" role="alert"></div>' +
            '</div>' +
            
            '<input name="latitude" label="latitude" label-name="latitude" type="text" placeholder="Latitude" style="display:none;" aria-hidden="true">' +
            '<input name="longitude" label="longitude" label-name="longitude" type="text" placeholder="Longitude" style="display:none;" aria-hidden="true">' +
            
            '<div class="space-y-2">' +
                '<label for="company_details" class="text-sm font-medium text-muted-foreground">Company details</label>' +
                '<textarea id="company_details" rows="5" name="company_details" placeholder="Company details" required aria-required="true" aria-describedby="company-details-error" aria-invalid="false" class="' + textareaClasses + '"></textarea>' +
                '<div id="company-details-error" class="sr-only" role="alert"></div>' +
            '</div>'
        )
    }


    $('[name="user_type"]').change(async function () {
        var userType = $(this).val();
        if (userType == "prospect") {
            $("[form-for='complete-profile']").html(prospect_form());
        } else if (userType == "agent" || userType == "developer") {
            $("[form-for='complete-profile']").html(agent_and_developer_form());
        }else{
            $("[form-for='complete-profile']").html('');
            return
        }
        
        // Wait for Google Maps to be available, then initialize
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.places !== 'undefined') {
            // Small delay to ensure DOM is updated
            setTimeout(function() {
                if (typeof initializeMap === 'function') {
                    initializeMap();
                }
            }, 100);
        }
    });

    // Auto-strip country code from phone number input
    $('#phone_number').on('input', function() {
        var phoneNumber = $(this).val().trim();
        var phoneCode = $('#phone_code').val();
        
        // Strip country code if user entered it manually
        var countryCodes = ['+66', '+60', '+65', '+852', '+86', '+886', '+84', '+62', '+63', '+95', '+855', '+856', '+673'];
        countryCodes.forEach(function(code) {
            if (phoneNumber.startsWith(code)) {
                phoneNumber = phoneNumber.substring(code.length).trim();
                $(this).val(phoneNumber);
            }
        }.bind(this));
        
        // Remove any leading + or spaces
        phoneNumber = phoneNumber.replace(/^\+/, '').trim();
        if ($(this).val() !== phoneNumber) {
            $(this).val(phoneNumber);
        }
    });

    $("#complete-profile-form").submit(function (event) {
        event.preventDefault();
        if(sent_request) return;
        
        // Clear previous errors
        $('.auth-response-messages').html('');
        $('[aria-invalid="true"]').attr('aria-invalid', 'false');
        $('.text-destructive').removeClass('text-destructive').addClass('sr-only');
        
        // Get phone code and phone number values
        var phoneCode = $('[name="phone_code"]').val();
        var phoneNumber = $("[name='phone_number']").val().trim();
        
        // Strip country code if user entered it manually
        var countryCodes = ['+66', '+60', '+65', '+852', '+86', '+886', '+84', '+62', '+63', '+95', '+855', '+856', '+673'];
        countryCodes.forEach(function(code) {
            if (phoneNumber.startsWith(code)) {
                phoneNumber = phoneNumber.substring(code.length).trim();
            }
        });
        
        // Remove any leading + or spaces
        phoneNumber = phoneNumber.replace(/^\+/, '').trim();
        
        var fullPhoneNumber = phoneCode + phoneNumber;
        var formData = new FormData(/** @type {HTMLFormElement} */ (this));

        // Set modified phone number in formData
        formData.set('phone_number', fullPhoneNumber);

        // Remove phone_code from formData
        formData.delete('phone_code');

        // console.log(formData.get('user_type'))
        // return

        $completeButton.html(loader_dom);
        $completeButton.prop('disabled', true).attr('aria-busy', 'true');
        sent_request = true;
        var userType = $('[name="user_type"]').val();
        var profileCreateUrl = "";
        if (userType == "developer") {
            profileCreateUrl = DEVELOPER_CREATE_URL;
        } else if (userType == "agent") {
            profileCreateUrl = AGENT_CREATE_URL;
        } else if (userType == "prospect") {
            profileCreateUrl = PROSPECT_CREATE_URL;
        }

        $.ajax({
            url: profileCreateUrl,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response, status, xhr) {
                if (xhr.status == 201) {
                    $('.auth-response-messages').html(renderMessage('success', 'Profile completed successfully!'));

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
                }
            },
            error: function (xhr, status, error) {
                var errorMessages = "";
                
                if (xhr.status === 400) {
                    // Bad Request (validation error)
                    var errorData = xhr.responseJSON;
                    
                    if (errorData && typeof errorData === 'object') {
                        // Handle different error formats
                    for (var key in errorData) {
                        if (errorData.hasOwnProperty(key)) {
                                var fieldErrors = errorData[key];
                                
                                // Handle array of errors
                                if (Array.isArray(fieldErrors)) {
                                    fieldErrors.forEach(function(err) {
                                        if (err) {
                                            errorMessages += renderMessage('error', err);
                                        }
                                    });
                                } else if (typeof fieldErrors === 'string') {
                                    errorMessages += renderMessage('error', fieldErrors);
                                } else if (typeof fieldErrors === 'object' && fieldErrors.message) {
                                    errorMessages += renderMessage('error', fieldErrors.message);
                                }
                                
                                // Update field-specific error displays
                                var $field = $('[name="' + key + '"]');
                                if ($field.length) {
                                    $field.attr('aria-invalid', 'true');
                                    var errorId = key.replace(/_/g, '-') + '-error';
                                    var $errorDiv = $('#' + errorId);
                                    if ($errorDiv.length) {
                                        var errorText = Array.isArray(fieldErrors) ? fieldErrors[0] : (typeof fieldErrors === 'string' ? fieldErrors : 'Invalid value');
                                        $errorDiv.text(errorText).removeClass('sr-only').addClass('text-sm text-destructive mt-1');
                                    }
                                }
                            }
                        }
                    } else if (typeof errorData === 'string') {
                        errorMessages = renderMessage('error', errorData);
                    } else if (errorData && errorData.message) {
                        errorMessages = renderMessage('error', errorData.message);
                    } else if (errorData && errorData.error) {
                        errorMessages = renderMessage('error', errorData.error);
                    }
                    
                    if (!errorMessages) {
                        errorMessages = renderMessage('error', 'Please check the form and try again.');
                    }
                } else if (xhr.status === 500) {
                    errorMessages = renderMessage('error', 'Server error. Please try again later.');
                } else if (xhr.status === 0) {
                    errorMessages = renderMessage('error', 'Network error. Please check your connection.');
                } else {
                    var responseText = xhr.responseText;
                    try {
                        var jsonResponse = JSON.parse(responseText);
                        if (jsonResponse.message) {
                            errorMessages = renderMessage('error', jsonResponse.message);
                        } else if (jsonResponse.error) {
                            errorMessages = renderMessage('error', jsonResponse.error);
                        } else {
                            errorMessages = renderMessage('error', 'An error occurred. Please try again later.');
                        }
                    } catch (e) {
                        errorMessages = renderMessage('error', 'An error occurred. Please try again later.');
                    }
                }
                
                $('.auth-response-messages').html(errorMessages);
                
                // Scroll to first error message
                if (errorMessages) {
                    $('.auth-response-messages')[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            },
            complete: function(){
                sent_request = false;
                $completeButton.html(defaultButtonHtml);
                $completeButton.prop('disabled', false).attr('aria-busy', 'false');
            }
        });
    });
});
