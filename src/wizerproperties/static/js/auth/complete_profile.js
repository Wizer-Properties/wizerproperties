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

        $('[button-name="complete-profile"]').html(loader_dom);
        sent_request = true;

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
