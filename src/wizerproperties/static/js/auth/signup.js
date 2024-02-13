$(document).ready(function () {
    var loader_dom = '<div id="loadingSpinner" class="spinner-border" role="status">'+
                        '<span class="sr-only">Loading...</span>' +
                    '</div>'

    // Show loader when form submit
    $("#create-profile-form").submit(function () {
        $('.auth-response-messages').html('');
        $('[button-name="sign-up"]').html(loader_dom)
    });

});
