$(document).ready(function () {
    var loginButtonText = $("#loginButtonText");
    var loadingSpinner = $("#loadingSpinner");

    // Show loader when form submit
    $("#signupForm").submit(function () {
        loginButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner
    });

});
