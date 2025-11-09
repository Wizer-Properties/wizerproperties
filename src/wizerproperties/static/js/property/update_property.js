$(document).ready(function () {
  var deletedImages = [];
  var tenantValidityWrapper = $("[data-tenant-validity]");
  var tenantValidityInput = tenantValidityWrapper.find('input[name="tenant_occupied_validity"]');

  function toggleTenantValidity() {
    var isChecked = $("#tenant_occupied").is(":checked");
    tenantValidityWrapper.toggleClass("hidden", !isChecked);
    if (tenantValidityInput.length) {
      tenantValidityInput.prop("required", isChecked);
      if (!isChecked) {
        tenantValidityInput.val("");
      }
    }
  }

  toggleTenantValidity();
  $("#tenant_occupied").on("change", toggleTenantValidity);

  $(document).on("click", ".remove-image", function (event) {
    event.preventDefault();
    var imageId = $(this).data("id");
    if (imageId && !deletedImages.includes(imageId)) {
      deletedImages.push(imageId);
    }
    $(this).closest(".group").remove();
  });

  $("#property-update-form").on("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(this);
    if (deletedImages.length > 0) {
      deletedImages.forEach(function (id) {
        formData.append("deleted_images", id);
      });
    }

    var updatePropertyButtonText = $("#updatePropertyButtonText");
    var loadingSpinner = $("#loadingSpinner");

    updatePropertyButtonText.hide();
    loadingSpinner.show();

    $.ajax({
      url: updatePropertyAPIUrl,
      type: "PUT",
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        "X-CSRFToken": csrfToken,
      },
      success: function (response, status, xhr) {
        loadingSpinner.hide();
        updatePropertyButtonText.show();

        $(".error-message").html("");

        var successMessages = "";
        if (xhr.status === 200) {
          successMessages += "<span class='authSuccessMessage'>Property updated successfully</span>";
        }

        $(".success-message").html(successMessages);

        setTimeout(function () {
          window.location.href = "/dashboard";
        }, 1000);
      },
      error: function (xhr, status, error) {
        loadingSpinner.hide();
        updatePropertyButtonText.show();

        $(".success-message").html("");

        if (xhr.status === 400) {
          var errorData = xhr.responseJSON || {};
          var errorMessages = "";
          for (var key in errorData) {
            if (errorData.hasOwnProperty(key) && errorData[key].length > 0) {
              errorMessages += "<span class='authErrorMessage'>" + errorData[key][0] + "</span>";
            }
          }
          $(".error-message").html(errorMessages);
        } else {
          console.error(error);
          alert("An error occurred. Please try again later.");
        }
      },
    });
  });
});
