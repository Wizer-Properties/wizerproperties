$(document).ready(function () {
    var buildingId;
    var deleteBuildingAPIUrl;
    var modalId = "#confirmationModal";
    $(".delete-building").click(function () {
        buildingId = $(this).data("id");
        deleteBuildingAPIUrl = $(this).data("api-url");

        // Show the delete confirmation modal
        var modalTitle = "Delete Building";
        var modalBody = "Are you sure you want to delete this building?";
        var buttonLabel = "Delete";
        showModal(modalId, modalTitle, modalBody, buttonLabel);
    });

    // Click event for confirm delete button inside the modal
    $("#confirmButton").click(function () {
        // Send AJAX request to delete the building
        $.ajax({
            url: deleteBuildingAPIUrl,
            type: "DELETE",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                // Remove the row from DataTable by ID
                var rowId = "building-" + buildingId;
                var table = $("#building-table").DataTable();
                table
                    .row("#" + rowId)
                    .remove()
                    .draw(false);

                // Close the modal after the delete button is clicked
                $(modalId).modal("hide");
            },
            error: function (error) {
                // Display error message in modal
                var errorMessage = error.responseJSON.detail; // Assuming error response has a 'detail' field
                $("#error-message").html(
                    "<div class='alert alert-danger'>" + errorMessage + "</div>"
                );
            },
        });
    });
});
