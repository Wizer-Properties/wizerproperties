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

    // Get an automated professional description with ChatGPT
    $("#generate-building-description").click(function () {
        var title = $("input[name='title']").val();
        var lowest_price = $("input[name='lowest_price']").val();
        var highest_price = $("input[name='highest_price']").val();
        var type = $("select[name='type']").val();
        var quota = $("select[name='quota']").val();
        var furnishing = $("select[name='furnishing']").val();
        var total_units_for_sale = $(
            "input[name='total_units_for_sale']"
        ).val();
        var construction_year = $("input[name='construction_year']").val();
        var address = $("input[name='address']").val();
        var project_total_area = $("input[name='project_total_area']").val();
        var total_floors = $("input[name='total_floors']").val();
        var distance_from_location_to_BTS_or_MRT = $(
            "input[name='distance_from_location_to_BTS_or_MRT']"
        ).val();
        var distance_from_location_to_ARL = $(
            "input[name='distance_from_location_to_ARL']"
        ).val();
        var view = $("input[name='view']").val();

        var have_freehold = $("#freehold").prop("checked");
        var have_leasehold = $("#leasehold").prop("checked");
        var have_infinity_pool = $("#infinity_pool").prop("checked");
        var have_pets_allowed = $("#pets_allowed").prop("checked");
        var have_sauna = $("#sauna").prop("checked");
        var have_rooftop_pool = $("#rooftop_pool").prop("checked");
        var have_fitness_area = $("#fitness_area").prop("checked");
        var have_grocery = $("#grocery").prop("checked");

        // Check for empty input values
        var required_fields = [
            title,
            lowest_price,
            highest_price,
            type,
            quota,
            furnishing,
            total_units_for_sale,
            construction_year,
            address,
            project_total_area,
            total_floors,
            distance_from_location_to_BTS_or_MRT,
            distance_from_location_to_ARL,
            view,
        ];

        for (var i = 0; i < required_fields.length; i++) {
            if (required_fields[i] === "") {
                $(".error-message").html(
                    "<span class='authErrorMessage'>" +
                        "To generate description please fill in all required fields without description and media field." +
                        "</span>"
                );
                return; // Stop execution if any input is empty
            }
        }

        var generateBuildingDescription = $("#generateBuildingDescription");
        var loadingSpinner = $("#descriptionLoadingSpinner");

        // Construct the building data object to be sent to the API
        var building_data = {
            title: title,
            lowest_price: lowest_price,
            highest_price: highest_price,
            type: type,
            quota: quota,
            furnishing: furnishing,
            total_units_for_sale: total_units_for_sale,
            construction_year: construction_year,
            address: address,
            total_area: project_total_area + "sqm",
            total_floors: total_floors,
            distance_from_location_to_BTS_or_MRT:
                distance_from_location_to_BTS_or_MRT + "mile",
            distance_from_location_to_ARL:
                distance_from_location_to_ARL + "mile",
            view: view,
            have_freehold: have_freehold,
            have_leasehold: have_leasehold,
            have_infinity_pool: have_infinity_pool,
            have_pets_allowed: have_pets_allowed,
            have_sauna: have_sauna,
            have_rooftop_pool: have_rooftop_pool,
            have_fitness_area: have_fitness_area,
            have_grocery: have_grocery,
        };

        generateBuildingDescription.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: generateBuildingDescriptionAPIUrl,
            type: "POST",
            data: building_data,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                loadingSpinner.hide(); // Hide the spinner
                generateBuildingDescription.show(); // Show the text
                $(".error-message").html("");
                $('body').attr('open-modal', 'building-description');
                $('.created-description-textarea').val(response.generated_building_description);
            },
            error: function (error) {
                loadingSpinner.hide(); // Hide the spinner
                generateBuildingDescription.show(); // Show the text
                // Handle other error cases (e.g., server error)
                console.error(error);
                alert("An error occurred. Please try again later.");
            },
        });
    });

    $("#building-create-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        var createBuildingButtonText = $("#createBuildingButtonText");
        var loadingSpinner = $("#loadingSpinner");

        createBuildingButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: createBuildingAPIUrl, // Replace with your API endpoint
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

    $('.add-to-description-field').click(function(){
        $('textarea[name="description"]').val($('.created-description-textarea').val());
        $('body').attr('open-modal', 'false');
    });

    $('[ai-close-modal="description"]').click(function(){
        $('body').attr('open-modal', 'false');
    })
});
