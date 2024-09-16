$(function(){

    // On-click events on details button
    $(document).on("click", ".property-detail-view-admin-modal-button", function(){
        fetchPropertyInfo($(this).data("id"))
    })

    // Fetch building information on modal open
    function fetchPropertyInfo(buildingID){
        $.ajax({
            url: propertyInformationURL(buildingID),
            method: "GET",
            success: function(res){
                loadDataToModal(res);
            }
        })
    }

    // Function to load property details into a modal
    function loadDataToModal(data) {
        var modalBody = $('#property-modal .modal-body');
        var leftPart = modalBody.find(".left-part");
        var rightPart = modalBody.find(".right-part");

        // Clear previous content
        leftPart.html('');
        rightPart.html('');

        // Checkmark and cross icons
        var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" width="24" height="24"><path d="M21.03 5.72a.75.75 0 0 1 0 1.06l-11.5 11.5a.747.747 0 0 1-1.072-.012l-5.5-5.75a.75.75 0 1 1 1.084-1.036l4.97 5.195L19.97 5.72a.75.75 0 0 1 1.06 0Z"></path></svg>';
        var crossIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" width="24" height="24"><path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path></svg>';

        // Left part data (text-based)
        function leftPartData(data) {
            return `
                <p><strong>Balcony Direction:</strong> ${data.balcony_direction}</p>
                <p><strong>Main Door Direction:</strong> ${data.main_door_direction}</p>
                <p><strong>Unit Position:</strong> ${data.unit_position}</p>
                <p><strong>Created At:</strong> ${new Date(data.created_at).toLocaleString()}</p>
                <p><strong>Updated At:</strong> ${new Date(data.updated_at).toLocaleString()}</p>
            `;
        }

        // Right part data (icon-based for boolean values)
        function rightPartData(data) {
            return `
                <p><strong>Tenant Occupied:</strong> ${(data.have_tenant_occupied ? checkIcon : crossIcon)}</p>
                <p><strong>Vacant:</strong> ${(data.have_vacant ? checkIcon : crossIcon)}</p>
                <p><strong>Owner Occupied:</strong> ${(data.have_owner_occupied ? checkIcon : crossIcon)}</p>
                <p><strong>Bathtub:</strong> ${(data.have_bathtub ? checkIcon : crossIcon)}</p>
                <p><strong>Duplex:</strong> ${(data.have_duplex ? checkIcon : crossIcon)}</p>
            `;
        }

        // Append data to the left and right parts
        leftPart.html(leftPartData(data));
        rightPart.html(rightPartData(data));

        // Show the modal (optional)
        var myModal = new bootstrap.Modal(document.getElementById('property-modal'));
        myModal.show();
    }
    
})
