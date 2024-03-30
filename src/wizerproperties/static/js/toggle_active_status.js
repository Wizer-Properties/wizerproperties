$(document).ready(function () {
    var itemId;
    var toggleActiveAPIUrl;
    var isChecked;
    var checkboxElement;
    var props_status;

    // Function to update active_properties_count
    function updateActivePropertiesCount(change) {
        var currentCount = parseInt($("#active-properties-count").text());
        $("#active-properties-count").text(currentCount + change);
    }

    $(document).on('change', '.toggle-active', function () {
        checkboxElement = $(this);
        itemId = checkboxElement.data("id");
        toggleActiveAPIUrl = checkboxElement.data("api-url");
        isChecked = checkboxElement.prop("checked");

        var data_item = checkboxElement.data("item");

        if(['reels'].includes(data_item)){
            props_status = isChecked ? 'active' : 'inactive';
        }

        // Show the change active status confirmation modal
        var modalTitle = "Toggle Active Status";
        var modalBody = "Are you sure you want to change the active status?";

        var modal_option = {
            modalTitle : modalTitle, // modal title text
            modalBody : modalBody, // modal body text
            confirmButtonLabel : "Change", // action button text
            parentClass : 'active-status', // adding a class with #confirmationModal
            confirmButtonType : 'success'
        };

        showModal(modal_option);
    });

    // Click event for confirm change button inside the modal
    $(document).on('click', '.active-status #confirmButton', function () {
        $(this).parents('.active-status').removeClass('active-status');

        // Call your API endpoint to update the 'is_active' field
        $.ajax({
            url: toggleActiveAPIUrl,
            type: "PATCH",
            data: {
                is_active: isChecked,
                status : props_status,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                // Update active_properties_count if successful
                if (checkboxElement.data("item") == "property") {
                    updateActivePropertiesCount(isChecked ? 1 : -1);
                }
                // Close the modal after the change button is clicked
                $('#confirmationModal').modal("hide");
            },
            error: function (error) {
                // Handle error, show an error message to the user
                console.error("Toggle error:", error);
                // If the user cancels the confirmation, revert the checkbox state
                checkboxElement.prop("checked", !isChecked);

                var modal_option = {
                    modalTitle : "Error massage", // modal title text
                    modalBody : error, // modal body text
                    confirmButtonType : 'hidden'
                };        
                showModal(modal_option);
            },
        });
    });
});
