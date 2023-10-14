$(document).ready(function () {
    var constructionYearInput = $("input[name='construction_year']");

    // Change event listener to the construction year field
    constructionYearInput.on("change", function () {
        var enteredYear = $(this).val(); // Get the entered year value

        // Validate the entered year against the specified range
        if (enteredYear >= 1930 && enteredYear <= new Date().getFullYear()) {
            $(".error-message").html("");
        } else {
            var errorMessages = "";
            errorMessages +=
                "<span class='authErrorMessage'>Invalid construction year entered. Please enter a year between 1930 and" +
                new Date().getFullYear() +
                "</span>";

            // Invalid year, show an error message
            $(".error-message").html(errorMessages);
        }
    });

    $("#building-create-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        for (const pair of formData.entries()) {
            console.log(`${pair[0]}, ${pair[1]}`);
        }

        var createBuildingButtonText = $("#createBuildingButtonText");
        var loadingSpinner = $("#loadingSpinner");

        createBuildingButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: createBuildingUrl, // Replace with your API endpoint
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                createBuildingButtonText.show(); // Show the text

                $(".error-message").html("");

                var successMessages = "";
                if (xhr.status == 201) {
                    successMessages +=
                        "<span class='authSuccessMessage'>Building created successfully</span>";
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
                createBuildingButtonText.show(); // Show the text

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
