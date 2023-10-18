$(document).ready(function () {
    var itemId;
    var toggleActiveAPIUrl;
    var isChecked;
    var checkboxElement;
    var modalId = "#confirmationModal";
    $(".toggle-active").change(function () {
        checkboxElement = $(this);
        itemId = checkboxElement.data("id");
        toggleActiveAPIUrl = checkboxElement.data("api-url");
        isChecked = checkboxElement.prop("checked");

        // Show the change active status confirmation modal
        var modalTitle = "Toggle Active Status";
        var modalBody = "Are you sure you want to change the active status?";
        var buttonLabel = "Change";
        showModal(modalId, modalTitle, modalBody, buttonLabel);
    });

    // Click event for confirm change button inside the modal
    $("#confirmButton").click(function () {
        // Call your API endpoint to update the 'is_active' field
        $.ajax({
            url: toggleActiveAPIUrl,
            type: "PATCH",
            data: {
                is_active: isChecked,
            },
            headers: {
                "X-CSRFToken": csrfToken,
            },
            success: function (response) {
                // Close the modal after the change button is clicked
                $(modalId).modal("hide");
            },
            error: function (error) {
                // Handle error, show an error message to the user
                console.error("Toggle error:", error);
                // If the user cancels the confirmation, revert the checkbox state
                checkboxElement.prop("checked", !isChecked);
            },
        });
    });
});
