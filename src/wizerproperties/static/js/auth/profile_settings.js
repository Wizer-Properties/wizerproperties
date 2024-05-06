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

    // Function to update the company logo preview
    function updateCompanyLogoPreview(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $(".companyLogoDiv img").attr("src", e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Listen for changes in the company logo file input field
    $("input[name='company_logo']").change(function() {
        updateCompanyLogoPreview(this);
    });

    $("#profile-form").submit(function (event) {
        event.preventDefault();

        // Get phone code and phone number values
        var phoneCode = $("#phone_code").val();
        var phoneNumber = $("input[name='phone_number']").val();

        var fullPhoneNumber = phoneCode + phoneNumber;

        var formData = new FormData(this);

        // Set modified phone number in formData
        formData.set("phone_number", fullPhoneNumber);

        // Remove phone_code from formData
        formData.delete("phone_code");

        var loginButtonText = $("#loginButtonText");
        var loadingSpinner = $("#loadingSpinner");

        loginButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: profileSettingsUrl, // Replace with your API endpoint
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                loginButtonText.show(); // Show the text

                $(".error-message").html("");

                var successMessages = "";
                if (xhr.status == 200) {
                    successMessages +=
                        "<span class='authSuccessMessage'>Profile update successfully</span>";
                }

                // Handle success (e.g., show a success message)
                $(".success-message").html(successMessages);

                // Redirect to the homepage after 1 second
                // setTimeout(function () {
                //     window.location.href = "/";
                // }, 1000);
            },
            error: function (xhr, status, error) {
                loadingSpinner.hide(); // Hide the spinner
                loginButtonText.show(); // Show the text

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
});
