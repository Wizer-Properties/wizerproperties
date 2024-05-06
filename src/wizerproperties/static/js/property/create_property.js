$(document).ready(function () {

    $(document).on('change', '#tenant_occupied', function(){
        var is_checked = $(this).is(":checked");
        
        if(is_checked){
            $('.property-options-area').append(
                '<div class="col-12 date_picker_box_wrapper">'+
                    '<div class="authFormDiv">'+
                        '<input type="text" class="authInput date_picker_box" placeholder="mm-dd-yyyy" name="tenant_occupied_validity" required>'+
                        '<div class="authlabelline authcompleteProfileLabe">State i.e until Oct 2024</div>'+
                        '<input type="date" name="tenant_occupied_validity" required class="authInput hidden_date_picker_box">'+
                    '</div>'+
                '</div>'
            );

            init_datepacker()
        }else{
            $('.date_picker_box_wrapper').remove()
        }
    });

    var previousPropertyDescription = "" // Previous AI related response will append here

    // Get an automated professional description with ChatGPT
    $("#generate-property-description").click(function () {
        var building_id = $("select[name='building']").val();
        var title = $("input[name='title']").val();
        var price = $("input[name='price']").val();
        var price_per_sqm = $("input[name='price_per_sqm']").val();
        var unit_id = $("input[name='unit_id']").val();
        var floor_number = $("input[name='floor_number']").val();
        var unit_area = $("input[name='unit_area']").val();
        var interior_view = $("input[name='interior_view']").val();
        var number_of_bathroom = $("input[name='number_of_bathroom']").val();
        var number_of_bedroom = $("input[name='number_of_bedroom']").val();
        var number_of_balcony = $("input[name='number_of_balcony']").val();
        var number_of_car_parking = $("input[name='number_of_car_parking']").val();
        var balcony_direction = $("input[name='balcony_direction']").val();
        var main_door_direction = $("input[name='main_door_direction']").val();
        var unit_position = $("select[name='unit_position']").val();

        var have_vacant = $("#vacant").prop("checked");
        var have_owner_occupied = $("#owner_occupied").prop("checked");
        var have_bathtub = $("#bathtub").prop("checked");
        var have_duplex = $("#duplex").prop("checked");
        var have_pets_allowed = $("#pets_allowed").prop("checked");

        // Check for empty input values
        var required_fields = [building_id, title, price, price_per_sqm, unit_id, floor_number, unit_area, 
            number_of_bathroom, number_of_bedroom, number_of_balcony, number_of_car_parking, 
            balcony_direction, main_door_direction];

        for (var i = 0; i < required_fields.length; i++) {
            if (required_fields[i] === "") {
                $(".error-message").html(
                    "<span class='authErrorMessage'>" +
                        "To generate description please fill in all required fields without description, image and video field." +
                    "</span>"
                );
                return; // Stop execution if any input is empty
            }
        }

        var generatePropertyDescription = $("#generatePropertyDescription");
        var loadingSpinner = $("#descriptionLoadingSpinner");

        // Construct the proprty data object to be sent to the API
        var property_data = {
            "building_id": building_id,
            "title": title,
            "price": price,
            "price_per_sqm": price_per_sqm,
            "unit_id": unit_id,
            "floor_number": floor_number,
            "unit_area": unit_area,
            "interior_view": interior_view,
            "number_of_bathroom": number_of_bathroom,
            "number_of_bedroom": number_of_bedroom,
            "number_of_balcony": number_of_balcony,
            "number_of_car_parking": number_of_car_parking,
            "balcony_direction": balcony_direction,
            "main_door_direction": main_door_direction,
            "unit_position": unit_position,
            "have_vacant": have_vacant,
            "have_owner_occupied": have_owner_occupied,
            "have_bathtub": have_bathtub,
            "have_duplex": have_duplex,
            "have_pets_allowed": have_pets_allowed,
        };

        generatePropertyDescription.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: generatePropertyDescriptionAPIUrl,
            type: "POST",
            data: property_data,
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                loadingSpinner.hide(); // Hide the spinner
                generatePropertyDescription.show(); // Show the text
                previousPropertyDescription = response.generated_property_description;
                $(".error-message").html("");
                $('body').attr('open-modal', 'property-description');
                $('.created-description-textarea').val(response.generated_property_description);

                // Redirect to the dashboard after 1 second
                setTimeout(function () {
                    window.location.href = "/dashboard";
                }, 1000);
            },
            error: function (error) {
                loadingSpinner.hide(); // Hide the spinner
                generatePropertyDescription.show(); // Show the text
                // Handle other error cases (e.g., server error)
                console.error(error);
                alert("An error occurred. Please try again later.");
            },
        });
    })

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

            if (instruction_of_modification && previousPropertyDescription) {
                $.ajax({
                    url: reGeneratePropertyDescriptionAPIUrl,
                    type: "POST",
                    data: {
                        content: instruction_of_modification,
                        previous_response: previousPropertyDescription,
                    },
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                    success: function (response) {
                        previousPropertyDescription = response.generated_property_description;
                        $('.created-description-textarea').val(response.generated_property_description);
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

    $("#property-create-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(this);
        var createPropertyButtonText = $("#createPropertyButtonText");
        var loadingSpinner = $("#loadingSpinner");

        createPropertyButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: createPropertyAPIUrl, // Replace with your API endpoint
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                createPropertyButtonText.show(); // Show the text

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
                createPropertyButtonText.show(); // Show the text

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
    })

    $('[ai-close-modal="description"]').click(function(){
        $('body').attr('open-modal', 'false');
    })
});
