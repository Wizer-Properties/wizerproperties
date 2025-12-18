$(document).ready(function () {
  var previousPropertyDescription = "";
  var descriptionModal = $("[data-property-description-modal]");
  var tenantValidityWrapper = $("[data-tenant-validity]");
  var tenantValidityInput = tenantValidityWrapper.find('input[name="tenant_occupied_validity"]');

  function toggleTenantValidity() {
    var isChecked = $("#tenant_occupied").is(":checked");
    tenantValidityWrapper.toggleClass("hidden", !isChecked);
    tenantValidityInput.prop("required", isChecked);
    if (!isChecked) {
      tenantValidityInput.val("");
    }
  }

  toggleTenantValidity();
  $("#tenant_occupied").on("change", toggleTenantValidity);

  function openDescriptionModal() {
    descriptionModal.removeClass("hidden");
    $("body").addClass("overflow-hidden");
  }

  function closeDescriptionModal() {
    descriptionModal.addClass("hidden");
    $("body").removeClass("overflow-hidden");
  }

  $("[data-property-description-close]").on("click", closeDescriptionModal);
  descriptionModal.on("click", function (event) {
    if (event.target === this) {
      closeDescriptionModal();
    }
  });

  $("#generate-property-description").on("click", function () {
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

    if (!title || !price) {
      $(".error-message").html(
        "<span class='authErrorMessage'>Please provide both title and price before generating a description.</span>"
      );
      return;
    }

    var generatePropertyDescription = $("#generatePropertyDescription");
    var loadingSpinner = $("#descriptionLoadingSpinner");

    var property_data = {
      building_id: building_id,
      title: title,
      price: price,
      price_per_sqm: price_per_sqm,
      unit_id: unit_id,
      floor_number: floor_number || null,
      unit_area: unit_area || null,
      interior_view: interior_view || null,
      number_of_bathroom: number_of_bathroom || null,
      number_of_bedroom: number_of_bedroom || null,
      number_of_balcony: number_of_balcony || null,
      number_of_car_parking: number_of_car_parking || null,
      balcony_direction: balcony_direction || null,
      main_door_direction: main_door_direction || null,
      unit_position: unit_position || null,
      have_vacant: have_vacant || null,
      have_owner_occupied: have_owner_occupied || null,
      have_bathtub: have_bathtub || null,
      have_duplex: have_duplex || null,
      have_pets_allowed: have_pets_allowed || null,
    };

    generatePropertyDescription.hide();
    loadingSpinner.show();

    $.ajax({
      url: generatePropertyDescriptionAPIUrl,
      type: "POST",
      data: property_data,
      headers: {
        "X-CSRFToken": csrfToken,
      },
      success: function (response) {
        loadingSpinner.hide();
        generatePropertyDescription.show();
        previousPropertyDescription = response.generated_property_description;
        $(".error-message").html("");
        $(".created-description-textarea").val(response.generated_property_description);
        openDescriptionModal();
      },
      error: function (error) {
        loadingSpinner.hide();
        generatePropertyDescription.show();
        console.error(error);
        alert("An error occurred. Please try again later.");
      },
    });
  });

  $(".regenerate-chatbot-send-btn").on("click", function (event) {
    event.preventDefault();
    var instruction_of_modification = $("input[name='instruction_of_modification']").val();
    if (!instruction_of_modification.trim()) {
      $(".re-generate-error-message").html(
        "<span class='reGenerateBarErrorMessage'>Please write something</span>"
      );
      return;
    }

    $(".re-generate-error-message").html("");
    $("input[name='instruction_of_modification']").val("");

    if (!previousPropertyDescription) return;

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
        $(".created-description-textarea").val(response.generated_property_description);
      },
      error: function (error) {
        console.error(error);
        alert("An error occurred. Please try again later.");
      },
    });
  });

  $("#property-create-form").on("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(/** @type {HTMLFormElement} */ (this));
    var createPropertyButtonText = $("#createPropertyButtonText");
    var loadingSpinner = $("#loadingSpinner");

    createPropertyButtonText.hide();
    loadingSpinner.show();

    $.ajax({
      url: createPropertyAPIUrl,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response, status, xhr) {
        loadingSpinner.hide();
        createPropertyButtonText.show();

        $(".error-message").html("");

        var successMessages = "";
        if (xhr.status === 201) {
          successMessages += "<span class='authSuccessMessage'>Property listed successfully! It's now live and visible to thousands of verified buyers.</span>";
        }

        $(".success-message").html(successMessages);

        setTimeout(function () {
          window.location.href = "/dashboard";
        }, 1000);
      },
      error: function (xhr, status, error) {
        loadingSpinner.hide();
        createPropertyButtonText.show();

        $(".success-message").html("");
        if (xhr.status === 400) {
          var errorData = xhr.responseJSON;
          var errorMessages = "";
          for (var key in errorData) {
            if (errorData.hasOwnProperty(key)) {
              errorMessages +=
                "<span class='authErrorMessage'>" + errorData[key][0] + "</span>";
            }
          }
          $(".error-message").html(errorMessages);
        } else {
          console.error(error);
          alert("Something went wrong. Please check your connection and try again.");
        }
      },
    });
  });

  $(".add-to-description-field").on("click", function () {
    var generatedText = $(".created-description-textarea").val();
    $("textarea[name='description']").val(generatedText);
    closeDescriptionModal();
  });
});
