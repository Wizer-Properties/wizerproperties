$(document).ready(function () {
    var propertyId;
    var deletePropertyAPIUrl;

    $(".delete-property").click(function () {
        propertyId = $(this).data("id");
        deletePropertyAPIUrl = $(this).data("api-url");

        // Show the delete confirmation modal
        var modalTitle = "Delete Property";
        var modalBody = "Are you sure you want to delete this property?";

        var modal_option = {
            modalTitle : modalTitle, // modal title text
            modalBody : modalBody, // modal body text
            confirmButtonLabel : "Delete", // action button text
            parentClass : 'delete-property', // adding a class with #confirmationModal
            confirmButtonType : 'danger'
        };

        showModal(modal_option);
    });

    // Click event for confirm delete button inside the modal
    $(document).on('click', '.delete-property #confirmButton', function () {
        $(this).parents('.delete-property').removeClass('delete-property');

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
                $('#confirmationModal').modal("hide");
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
