$(document).ready(function () {
    $(".authButton").click(function () {
        var email = $("#email").val();
        var password = $("#password").val();

        $.ajax({
            type: "POST",
            url: login_url,
            data: {
                email: email,
                password: password,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                $(".authErrorMessage").text("");
                $(".authSuccessMessage").text(response.message);

                // Redirect to the homepage after 1 second
                setTimeout(function () {
                    window.location.href = "/";
                }, 1000);
            },
            error: function (error) {
                msg = "Something went wrong!";
                if (error.status == 401) {
                    msg = error.responseJSON.message;
                }
                $(".authSuccessMessage").text("");
                $(".authErrorMessage").text(msg);
            },
        });
    });
});
