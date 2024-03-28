$(document).ready(function(){
    console.log("==========")

    $("#reels-create-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);
        var createReelButtonText = $("#createReelButtonText");
        var loadingSpinner = $("#loadingSpinner");

        createReelButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: '/advertise/api/reel/', // Replace with your API endpoint
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                createReelButtonText.show(); // Show the text

                $(".error-message").html("");

                var successMessages = "";
                if (xhr.status == 201) {
                    successMessages +=
                        "<span class='authSuccessMessage'>Property created successfully</span>";
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
                createReelButtonText.show(); // Show the text

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
})