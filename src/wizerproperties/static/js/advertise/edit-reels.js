$(function () {
  function populateReelForm() {
    $.ajax({
      url: "/advertise/api/reel/" + REEL_ID + "/",
      type: "GET",
      headers: { "X-CSRFToken": csrfToken },
      success: function (data) {
        $('[name="url"]').val(data && data.url ? data.url : "");
        $('[name="social_media"]').val(data && data.social_media ? data.social_media : "");
        $('[name="category"]').val(data && data.category ? data.category : "");
        $('[name="property"]').val(data && data.property ? data.property : "");
      },
      error: function (error) {
        console.error(error);
      },
    });
  }

  populateReelForm();

  $("#reels-create-form").on("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(/** @type {HTMLFormElement} */ (this));
    var $submitButton = $(this).find("button[type='submit']");
    var $buttonText = $("#createReelButtonText");
    var $spinner = $("#loadingSpinner");

    $submitButton.prop("disabled", true);
    $buttonText.hide();
    $spinner.show();

    $.ajax({
      url: "/advertise/api/reel/" + REEL_ID + "/",
      type: "PATCH",
      headers: { "X-CSRFToken": csrfToken },
      data: formData,
      processData: false,
      contentType: false,
      success: function (response, status, xhr) {
        $(".error-message").html("");

        if (xhr.status === 200) {
          $(".success-message").html("<span class='authSuccessMessage'>Reel updated successfully.</span>");
        }

        setTimeout(function () {
          window.location.href = "/advertise/reels/";
        }, 1000);
      },
      error: function (xhr, status, error) {
        $(".success-message").html("");
        if (xhr.status === 400) {
          var errorData = xhr.responseJSON || {};
          var errorMessages = "";
          for (var key in errorData) {
            if (Object.prototype.hasOwnProperty.call(errorData, key) && errorData[key].length > 0) {
              errorMessages += "<span class='authErrorMessage'>" + errorData[key][0] + "</span>";
            }
          }
          $(".error-message").html(errorMessages);
        } else {
          console.error(error);
          alert("An error occurred. Please try again later.");
        }
      },
      complete: function () {
        $submitButton.prop("disabled", false);
        $buttonText.show();
        $spinner.hide();
      },
    });
  });
});
$(document).ready(function(){

    function shared_reels_data(){
        $.ajax({
            url: '/advertise/api/reel/'+REEL_ID+'/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                console.log(data)
                $('[name="url"]').val(data?.url);
                $('[name="social_media"]').val(data?.social_media);
                $('[name="category"]').val(data?.category);
                $('[name="property"]').val(data?.property);

                console.log($('[name="social_media"]'))
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    shared_reels_data();






    $("#reels-create-form").submit(function (event) {
        event.preventDefault();

        var formData = new FormData(/** @type {HTMLFormElement} */ (this));
        var createReelButtonText = $("#createReelButtonText");
        var loadingSpinner = $("#loadingSpinner");

        createReelButtonText.hide(); // Hide the text
        loadingSpinner.show(); // Show the spinner

        $.ajax({
            url: '/advertise/api/reel/'+REEL_ID+'/', // Replace with your API endpoint
            type: "PATCH",
            headers: {
                'X-CSRFToken': csrfToken,
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response, status, xhr) {
                loadingSpinner.hide(); // Hide the spinner
                createReelButtonText.show(); // Show the text

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
                    window.location.href = "/dashboard";
                }, 1000);
            },
            error: function (xhr, status, error) {
                loadingSpinner.hide(); // Hide the spinner
                createReelButtonText.show(); // Show the text

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
                    // alert("An error occurred. Please try again later.");
                }
            },
        });
    });



});