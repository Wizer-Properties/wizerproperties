$(document).ready(function () {
    var buildingId;
    var deleteBuildingAPIUrl;

    $(".delete-building").click(function () {
        buildingId = $(this).data("id");
        deleteBuildingAPIUrl = $(this).data("api-url");

        // Show the delete confirmation modal
        var modalTitle = "Delete Building";
        var modalBody = "Are you sure you want to delete this building?";

        var modal_option = {
            modalTitle : modalTitle, // modal title text
            modalBody : modalBody, // modal body text
            confirmButtonLabel : "Delete", // action button text
            parentClass : 'delete-building', // adding a class with #confirmationModal
            confirmButtonType : 'success'
        };

        showModal(modal_option);
    });

    // Click event for confirm delete button inside the modal
    $(document).on('click', '.delete-building #confirmButton', function () {
        $(this).parents('.delete-building').removeClass('delete-building');

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
                if (typeof hideModal === "function") {
                    hideModal();
                }
            },
            error: function (error) {
                // Display error message in modal
                var errorMessage = error.responseJSON.detail; // Assuming error response has a 'detail' field
                // $("#error-message").html(
                //     "<div class='alert alert-danger'>" + errorMessage + "</div>"
                // );
                
                var modal_option = {
                    modalTitle : "Error massage", // modal title text
                    modalBody : errorMessage, // modal body text
                    confirmButtonType : 'hidden'
                };        
                showModal(modal_option);
            },
        });
    });
});
