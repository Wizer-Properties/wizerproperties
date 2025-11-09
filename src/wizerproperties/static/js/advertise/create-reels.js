$(function () {
  $("#reels-create-form").on("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(this);
    var $submitButton = $(this).find("button[type='submit']");
    var $buttonText = $("#createReelButtonText");
    var $spinner = $("#loadingSpinner");

    $submitButton.prop("disabled", true);
    $buttonText.hide();
    $spinner.show();

    $.ajax({
      url: "/advertise/api/reel/",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: { "X-CSRFToken": csrfToken },
      success: function (response, status, xhr) {
        $(".error-message").html("");

        if (xhr.status === 201) {
          $(".success-message").html("<span class='authSuccessMessage'>Reel shared successfully.</span>");
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
