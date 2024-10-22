$(document).ready(function () {
    // File handle
    $(".authFile").change(function () {
        $(this).parents('[respons="error"]').attr("respons", "");

        try {
            $(".fileName").text($(this)[0].files[0].name);
            $(".fileName").attr("add-file", "true");
        } catch {
            $(".fileName").text("Select input");
            $(".fileName").attr("add-file", "false");
        }
    });

    var sent_request = false;
    var loader_dom = '<div id="loadingSpinner" class="spinner-border" role="status">'+
                        '<span class="sr-only">Loading...</span>' +
                      '</div>';


    function prospect_form() {
        return(
            '   <div class="auth-input-wrapper">' +
                '<label>First Name</label>' +
                '<input type="text" name="first_name" placeholder="First Name" value="'+(user_first_name || "") +'" required>' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Last Name</label>' +
                '<input type="text" name="last_name" placeholder="Last Name" value="'+(user_last_name || "")+'" required>' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Gender</label>' +
            
                '<select name="gender" placeholder="Gender" required>' +
                    '<option value="">Select Gender</option>' +
                    '<option value="male">Male</option>' +
                    '<option value="female">Female</option>' +
                '</select>' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Address</label>' +
                '<input type="text" name="address" class="pac-input" placeholder="Address" required>' +
            '</div>' +
            '<input name="latitude" label="latitude" label-name="latitude" type="text" class="authInput" placeholder="Latitude">' +
            '<input name="longitude" label="longitude" label-name="longitude" type="text" class="authInput" placeholder="Longitude">'
        )
    }


    function agent_and_developer_form() {
        return(
            '<div class="auth-input-wrapper">' +
                '<label>Company Logo</label>' +
                '<input type="file" accept="image/*" name="company_logo" required>' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Company Name</label>' +
                '<input type="text" name="company_name" placeholder="Company Name" required>' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Company Address</label>' +
                '<input type="text" name="address" class="pac-input" placeholder="Company Address" required>' +
            '</div>' +
            
            '<input name="latitude" label="latitude" label-name="latitude" type="text" class="authInput" placeholder="Latitude">' +
            '<input name="longitude" label="longitude" label-name="longitude" type="text" class="authInput" placeholder="Longitude">' +
            
            '<div class="auth-input-wrapper">' +
                '<label>WhatsApp Link</label>' +
                '<input type="text" name="whats_app_link" placeholder="WhatsApp Link">' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Line Link</label>' +
                '<input type="text" name="line_link" placeholder="Line Link">' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>WeChat Link</label>' +
                '<input type="text" name="we_chat_link" placeholder="WeChat Link">' +
            '</div>' +
            
            '<div class="auth-input-wrapper">' +
                '<label>Company details</label>' +
                '<textarea rows="5" name="company_details" placeholder="Company details" required></textarea>' +
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
        await initializeMap();
    });

    $("#complete-profile-form").submit(function (event) {
        event.preventDefault();
        if(sent_request) return;
        $('.auth-response-messages').html('');
        // Get phone code and phone number values
        var phoneCode = $('[name="phone_code"]').val();
        var phoneNumber = $("[name='phone_number']").val();
        var fullPhoneNumber = phoneCode + phoneNumber;
        var formData = new FormData(this);

        // Set modified phone number in formData
        formData.set('phone_number', fullPhoneNumber);

        // Remove phone_code from formData
        formData.delete('phone_code');

        // console.log(formData.get('user_type'))
        // return

        $('[button-name="complete-profile"]').html(loader_dom);
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
            url: profileCreateUrl, // Replace with your API endpoint
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response, status, xhr) {
                if (xhr.status == 201) {
                    var msg_dom = '<div class="alert alert-success p-2" role="alert"> Profile completed successfully </div>'
                    $('.auth-response-messages').html(msg_dom)
                };

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (xhr, status, error) {
                
                if (xhr.status === 400) {
                    // Bad Request (validation error)
                    var errorData = xhr.responseJSON;
                    var errorMessages = "";
                    for (var key in errorData) {
                        if (errorData.hasOwnProperty(key)) {
                            errorMessages += '<div class="alert alert-danger p-2 mb-2" role="alert">'+ errorData[key][0] +'</div>'
                        }
                    };
                    $('.auth-response-messages').html(errorMessages);
                } else {
                    alert("An error occurred. Please try again later.");
                }
            },
            complete: function(){
                sent_request = false;
                $('[button-name="complete-profile"]').html('Complete Profile')
            }
        });
    });
});
