$(function(){

    // $('#building-info-modal').modal("show");

    // On-click events on details button
    $(document).on("click", ".building-detail-view-admin-modal-button", function(){
        fetchBuildingInfo($(this).data("id"))
    })

    // Fetch building information on modal open
    function fetchBuildingInfo(buildingID){
        $.ajax({
            url: buildingInformationURL(buildingID),
            method: "GET",
            success: function(res){
                loadDataToModal(res);
            }
        })
    }

    // Function to load data to modal
    function loadDataToModal(data){
        // Get the modal body element
        var modalBody = $('#building-info-modal .modal-body');
        var leftPart = modalBody.find(".left-part")
        var rightPart = modalBody.find(".right-part")

        // Clear previous content (if any)
        modalBody.innerHTML = '';

        // Define check and cross icons
        var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" width="24" height="24" ><path d="M21.03 5.72a.75.75 0 0 1 0 1.06l-11.5 11.5a.747.747 0 0 1-1.072-.012l-5.5-5.75a.75.75 0 1 1 1.084-1.036l4.97 5.195L19.97 5.72a.75.75 0 0 1 1.06 0Z"></path></svg>';  // ✓
        var crossIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" width="24" height="24"><path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path></svg>';    // ✗

        function leftPartData(data){
            return '<p><strong>Province:</strong> ' + data.province + '</p>' +
            '<p><strong>District:</strong> ' + data.district + '</p>' +
            '<p><strong>Sub District:</strong> ' + data.sub_district + '</p>' +
            '<p><strong>Construction Year:</strong> ' + data.construction_year + '</p>' +
            '<p><strong>Total Floors:</strong> ' + data.total_floors + '</p>' +
            '<p><strong>Project Total Area:</strong> ' + data.project_total_area + ' sq. km</p>' +
            '<p><strong>Distance to BTS/MRT:</strong> ' + data.distance_from_location_to_BTS_or_MRT + ' meters</p>' +
            '<p><strong>Distance to ARL:</strong> ' + data.distance_from_location_to_ARL + ' meters</p>' +
            '<p><strong>Quota:</strong> ' + data.quota + '</p>' +
            '<p><strong>View:</strong> ' + data.view + '</p>';
        }

        function rightPartData(data){
            return '<p><strong>Freehold Available:</strong> ' + (data.have_freehold ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Leasehold Available:</strong> ' + (data.have_leasehold ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Infinity Pool:</strong> ' + (data.have_infinity_pool ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Pets Allowed:</strong> ' + (data.have_pets_allowed ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Guard House:</strong> ' + (data.have_guard_house ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Sauna:</strong> ' + (data.have_sauna ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Sky Lounge:</strong> ' + (data.have_sky_lounge ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Grocery:</strong> ' + (data.have_grocery ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Fitness Area:</strong> ' + (data.have_fitness_area ? checkIcon : crossIcon) + '</p>' +
            '<p><strong>Created At:</strong> ' + new Date(data.created_at).toLocaleString() + '</p>' +
            '<p><strong>Last Updated:</strong> ' + new Date(data.updated_at).toLocaleString() + '</p>';
        }

        // Append the new content to the modal body
        leftPart.html(leftPartData(data));
        rightPart.html(rightPartData(data));

        // Show the modal (optional: depending on how you trigger the modal)
        var myModal = new bootstrap.Modal(document.getElementById('building-info-modal'));
        myModal.show();
    }
})
