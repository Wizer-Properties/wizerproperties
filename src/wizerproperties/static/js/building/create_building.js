$(document).ready(function () {
    var constructionYearInput = $("input[name='construction_year']");
    var descriptionModal = $("[data-description-modal]");

    // Change event listener to the construction year field
    constructionYearInput.on("change", function () {
        var enteredYear = $(this).val(); // Get the entered year value

        // Validate the entered year against the specified range
        if (enteredYear >= 2000 && enteredYear <= new Date().getFullYear()) {
            $(".error-message").html("");
        } else {
            var errorMessages = "";
            errorMessages +=
                "<span class='authErrorMessage'>Invalid construction year entered. Please enter a year between 2000 and" +
                new Date().getFullYear() +
                "</span>";

            // Invalid year, show an error message
            $(".error-message").html(errorMessages);
        }
    });

    var previousBuildingDescription = "" // Previous AI related response will append here

    // Get an automated professional description with ChatGPT
    $("#generate-building-description").click(function () {
        var title = $("input[name='title']").val();
        var lowest_price = $("input[name='lowest_price']").val();
        var highest_price = $("input[name='highest_price']").val();
        var type = $("select[name='type']").val();
        var status = $("select[name='status']").val();
        var quota = $("select[name='quota']").val();
        var furnishing = $("select[name='furnishing']").val();
        var total_units_for_sale = $("input[name='total_units_for_sale']").val();
        var construction_year = $("input[name='construction_year']").val();
        var address = $("input[name='address']").val();
        var province = $("input[name='province']").val();
        var district = $("input[name='district']").val();
        var project_total_area = $("input[name='project_total_area']").val();
        var total_floors = $("input[name='total_floors']").val();
        var distance_from_location_to_BTS_or_MRT = $("input[name='distance_from_location_to_BTS_or_MRT']").val();
        var distance_from_location_to_ARL = $("input[name='distance_from_location_to_ARL']").val();
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
            address,
            province,
            district,
        ];

        for (var i = 0; i < required_fields.length; i++) {
            if (required_fields[i] === "") {
                $(".error-message").html(
                    "<span class='authErrorMessage'>" +
                        "To generate description please fill in all required fields without title, price, address, province and district" +
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
            quota: quota || null,
            furnishing: furnishing || null,
            total_units_for_sale: total_units_for_sale || null,
            status: status || null,
            construction_year: construction_year || null,
            address: address,
            province: province,
            district: district,
            total_area: project_total_area + "sqm",
            total_floors: total_floors || null,
            distance_from_location_to_BTS_or_MRT:
                distance_from_location_to_BTS_or_MRT + "mile",
            distance_from_location_to_ARL:
                distance_from_location_to_ARL + "mile",
            view: view,
            have_freehold: have_freehold || null,
            have_leasehold: have_leasehold || null,
            have_infinity_pool: have_infinity_pool || null,
            have_pets_allowed: have_pets_allowed || null,
            have_sauna: have_sauna || null,
            have_rooftop_pool: have_rooftop_pool || null,
            have_fitness_area: have_fitness_area || null,
            have_grocery: have_grocery || null,
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
                previousBuildingDescription = response.generated_building_description;
                $(".error-message").html("");
                openDescriptionModal();
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

    // Regenerate description
    $(".regenerate-chatbot-send-btn").click(function(event) {
        event.preventDefault();
        var instruction_of_modification = $("input[name='instruction_of_modification']").val();
        if (instruction_of_modification.trim() === '') {
            // Show error message
            $(".re-generate-error-message").html(
                "<span class='reGenerateBarErrorMessage'>Please write something</span>"
            );
        } else {
            // Clear error message if input is not empty
            $(".re-generate-error-message").html("");
            $("input[name='instruction_of_modification']").val("");

            if (instruction_of_modification && previousBuildingDescription) {
                $.ajax({
                    url: reGenerateBuildingDescriptionAPIUrl,
                    type: "POST",
                    data: {
                        content: instruction_of_modification,
                        previous_response: previousBuildingDescription,
                    },
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                    success: function (response) {
                        previousBuildingDescription = response.generated_building_description;
                        $('.created-description-textarea').val(response.generated_building_description);
                    },
                    error: function (error) {
                        // Handle other error cases (e.g., server error)
                        console.error(error);
                        alert("An error occurred. Please try again later.");
                    },
                });
            }
        }
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

                // Redirect to the dashboard after 1 second
                setTimeout(function () {
                    window.location.href = "/dashboard";
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
        closeDescriptionModal();
    });

    //  Project status and construction year related ------------------ start
    var statusSelect = $('#status');
    var constructionYearDiv = $('#constructionYearDiv');
    var constructionYearInput = $('#construction_year');

    function updateConstructionYearVisibility() {
        var isCompleted = statusSelect.val() === 'completed';
        constructionYearDiv.toggleClass('hidden', !isCompleted);
        constructionYearInput.prop('required', isCompleted);
        if (!isCompleted) {
            constructionYearInput.val(null);
        }
    }

    updateConstructionYearVisibility();

    statusSelect.on('change', updateConstructionYearVisibility);
    // --------------------------------- end

    // Sub type visibility ------------------------------ start
    var subTypeSelect = $('#sub_type_select');

    function updateSubTypeOptions(subTypes) {
        subTypeSelect.empty();
        subTypeSelect.append('<option value="">Select sub type</option>');
        $.each(subTypes, function(value, label) {
            subTypeSelect.append('<option value="' + value + '">' + label + '</option>');
        });
    }

    function toggleSubTypeVisibility() {
        var typeValue = $('#type_select').val();
        var container = $('#sub_type_container');
        if (typeValue) {
            container.removeClass('hidden');
            subTypeSelect.prop('required', true);

            if (typeValue == 'residence') {
                updateSubTypeOptions(residenceSubTypes);
            } else if (typeValue == 'commercial') {
                updateSubTypeOptions(commercialSubTypes);
            }
        } else {
            container.addClass('hidden');
            subTypeSelect.prop('required', false).val('');
        }
    }

    toggleSubTypeVisibility();

    $('select[name="type"]').on('change', toggleSubTypeVisibility);
    // --------------------------------- end

    function openDescriptionModal() {
        descriptionModal.removeClass('hidden');
        $('body').addClass('overflow-hidden');
    }

    function closeDescriptionModal() {
        descriptionModal.addClass('hidden');
        $('body').removeClass('overflow-hidden');
    }

    $('[data-description-close]').on('click', closeDescriptionModal);

    descriptionModal.on('click', function(event) {
        if (event.target === this) {
            closeDescriptionModal();
        }
    });
});
