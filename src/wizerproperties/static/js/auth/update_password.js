$(document).ready(function () {
    $(".authButton").click(function () {
        var password1 = $("#password1").val();
        var password2 = $("#password2").val();

        var updatePasswordButtonText = $('#updatePasswordButtonText');
        var loadingSpinner = $('#loadingSpinner');

        updatePasswordButtonText.hide(); // Hide the text
        loadingSpinner.show() // Show the spinner

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
                loadingSpinner.hide(); // Hide the spinner
                updatePasswordButtonText.show(); // Show the text

                $(".authErrorMessage").text("");
                $(".authSuccessMessage").text(response.message);

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                loadingSpinner.hide(); // Hide the spinner
                updatePasswordButtonText.show(); // Show the text

                errorMessages = ""
                for (let i = 0; i < error.responseJSON.message.length; i++) {
                    errorMessages += error.responseJSON.message[i]
                }
                $(".authSuccessMessage").text("");
                $(".authErrorMessage").html(errorMessages);
            },
        });
    });
});
