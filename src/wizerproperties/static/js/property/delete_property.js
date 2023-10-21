$(document).ready(function () {
    var propertyId;
    var deletePropertyAPIUrl;
    var modalId = "#confirmationModal";
    var actionType = "delete-property";

    $(".delete-property").click(function () {
        propertyId = $(this).data("id");
        deletePropertyAPIUrl = $(this).data("api-url");

        // Show the delete confirmation modal
        var modalTitle = "Delete Property";
        var modalBody = "Are you sure you want to delete this property?";
        var buttonLabel = "Delete";
        showModal(modalId, modalTitle, modalBody, buttonLabel, actionType);
    });

    // Click event for confirm delete button inside the modal
    $("#confirmButton").click(function () {
        if ($(this).attr("action-type") != "delete-property") return;

        // Send AJAX request to delete the property
        $.ajax({
            url: deletePropertyAPIUrl,
            type: "DELETE",
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                // Remove the row from DataTable by ID
                var rowId = "property-" + propertyId;
                var table = $("#property-table").DataTable();
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
