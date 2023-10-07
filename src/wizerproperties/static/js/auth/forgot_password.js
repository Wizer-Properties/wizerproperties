$(document).ready(function () {
    $(".authButton").click(function () {
        var email = $("#email").val();

        var forgotPasswordButtonText = $('#forgotPasswordButtonText');
        var loadingSpinner = $('#loadingSpinner');

        forgotPasswordButtonText.hide(); // Hide the text
        loadingSpinner.show() // Show the spinner

        $.ajax({
            type: "POST",
            url: forgot_password_url,
            data: {
                email: email,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                loadingSpinner.hide(); // Hide the spinner
                forgotPasswordButtonText.show(); // Show the text

                $(".authErrorMessage").text("");
                $(".authSuccessMessage").text(response.message);

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                loadingSpinner.hide(); // Hide the spinner
                forgotPasswordButtonText.show(); // Show the text

                msg = error.responseJSON.message;
                if (error.status == 401) {
                    msg = error.responseJSON.message;
                }
                $(".authSuccessMessage").text("");
                $(".authErrorMessage").text(msg);
            },
        });
    });
});
