$(document).ready(function () {
    var deletedImages = [];
    $(".remove-image").click(function () {
        var imageId = $(this).data("id");
        if (imageId) {
            deletedImages.push(imageId);
        }
    });

    $("#property-update-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        if (deletedImages.length > 0) {
            for (var i = 0; i < deletedImages.length; i++) {
                formData.append("deleted_images", deletedImages[i]);
            }
        }

        var updatePropertyButtonText = $("#updatePropertyButtonText");
        var loadingSpinner = $("#loadingSpinner");

        updatePropertyButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: updatePropertyAPIUrl, // Replace with your API endpoint
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                updatePropertyButtonText.show(); // Show the text

                $(".error-message").html("");

                var successMessages = "";
                if (xhr.status == 200) {
                    successMessages +=
                        "<span class='authSuccessMessage'>Property updated successfully</span>";
                }

                // Handle success (e.g., show a success message)
                $(".success-message").html(successMessages);

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (xhr, status, error) {
                loadingSpinner.hide(); // Hide the spinner
                updatePropertyButtonText.show(); // Show the text

                $(".success-message").html("");

                if (xhr.status === 400) {
                    // Bad Request (validation error)
                    var errorData = xhr.responseJSON;
                    var errorMessages = "";
                    for (var key in errorData) {
                        if (errorData.hasOwnProperty(key)) {
                            errorMessages +=
                                "<span class='authErrorMessage'>" +
                                errorData[key][0] +
                                "</span>";
                        }
                    }
                    $(".error-message").html(errorMessages);
                } else {
                    // Handle other error cases (e.g., server error)
                    console.error(error);
                    alert("An error occurred. Please try again later.");
                }
            },
        });
    });

    $(document).on('change', '#have_tenant_occupied', function(){
        var is_checked = $(this).is(":checked");
        
        if(is_checked){
            $('.property-options-area').append(
                '<div class="col-6 date_picker_box_wrapper">'+
                    '<div class="authFormDiv">'+
                        '<input name="tenant_occupied_validity" type="text" class="authInput date_picker_box">'+
                        '<div class="authlabelline authcompleteProfileLabe">State i.e until Oct 2024</div>'+
                    '</div>'+
                '</div>'
            );

            $('.date_picker_box').datepicker('setStartDate', new Date());
        }else{
            $('.date_picker_box_wrapper').remove()
        }
    })
});
