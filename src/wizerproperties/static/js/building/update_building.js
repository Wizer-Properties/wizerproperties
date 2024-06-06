$(document).ready(function () {
    var deletedImages = [];
    $(".remove-image").click(function () {
        var imageId = $(this).data("id");
        if (imageId) {
            deletedImages.push(imageId);
        }
    });

    $("#building-update-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        if (deletedImages.length > 0) {
            for (var i = 0; i < deletedImages.length; i++) {
                formData.append("deleted_images", deletedImages[i]);
            }
        }

        var updateBuildingButtonText = $("#updateBuildingButtonText");
        var loadingSpinner = $("#loadingSpinner");

        updateBuildingButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: updateBuildingAPIUrl, // Replace with your API endpoint
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                updateBuildingButtonText.show(); // Show the text

                $(".error-message").html("");

                var successMessages = "";
                if (xhr.status == 200) {
                    successMessages +=
                        "<span class='authSuccessMessage'>Building updated successfully</span>";
                }

                // Handle success (e.g., show a success message)
                $(".success-message").html(successMessages);

                // Redirect to the dashboard after 1 second
                setTimeout(function () {
                    window.location.href = "/dashboard";
                }, 1000);
            },
            error: function (xhr, status, error) {
                loadingSpinner.hide(); // Hide the spinner
                updateBuildingButtonText.show(); // Show the text

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

    //  Project status and construction year related ------------------ start
    var statusSelect = $('#status');
    var constructionYearDiv = $('#constructionYearDiv');
    var constructionYearInput = $('#construction_year');

    function updateConstructionYearVisibility() {
        if (statusSelect.val() === 'completed') {
            constructionYearDiv.show();
            constructionYearInput.prop('required', true);
        } else {
            constructionYearDiv.hide();
            constructionYearInput.prop('required', false);
            constructionYearInput.val(null); // Clear the value if hidden
        }
    }

    updateConstructionYearVisibility();

    statusSelect.on('change', updateConstructionYearVisibility);
    // --------------------------------- end

    // Sub type visibility ------------------------------ start
    function toggleSubTypeVisibility() {
        if ($('select[name="type"]').val()) {
            $('#sub_type_container').show();
            $('#sub_type_select').prop('required', true);
        } else {
            $('#sub_type_container').hide();
            $('#sub_type_select').prop('required', false).val('');
        }
    }

    toggleSubTypeVisibility();

    $('select[name="type"]').on('change', toggleSubTypeVisibility);
    // --------------------------------- end
});
