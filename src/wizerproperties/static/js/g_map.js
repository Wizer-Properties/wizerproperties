function initializeMap() {
    var options = {
        componentRestrictions: {
            country: "th"
        },
        fields : ['address_components']
    };

    var search_input = document.getElementById("gm-search-input");
    var search_box = new google.maps.places.Autocomplete(search_input, options);

    google.maps.event.addListener(search_box, 'place_changed', function(){

        console.log("hello", search_input.value)
        window.location.href = '/property/search/?place='+search_input.value
    })


    var gac_input = document.querySelectorAll(".pac-input");

    for (let i = 0; i < gac_input.length; i++) {        
        var autocomplete = new google.maps.places.Autocomplete(gac_input[i], options);
        
        google.maps.event.addListener(autocomplete, 'place_changed', function(){
            var address_data = autocomplete.getPlace()?.address_components;

            for (let i = 0; i < address_data.length; i++) {
                if(address_data[i]?.types.includes('administrative_area_level_1')){
                    if($('[label="province"]')){
                        $('[label="province"]').val(address_data[i]?.long_name)
                    };
                }else if(
                    address_data[i]?.types.includes('administrative_area_level_2') ||
                    address_data[i]?.types.includes('sublocality_level_1')
                ){
                    if($('[label="district"]')){
                        $('[label="district"]').val(address_data[i]?.long_name)
                    };
                }else if(
                    address_data[i]?.types.includes('locality')
                ){
                    if($('[label="sub-district"]')){
                        $('[label="sub-district"]').val(address_data[i]?.long_name)
                    };
                };
            };
        });


    };



    // Specify the location for the map
    
        
    let render_dom = document.getElementById('map');

    if(render_dom){
        let default_lat_lng = {
            lat : 13.764898,
            lng : 100.538283
        }
        buildingGeocodeAddress(render_dom, default_lat_lng)
    };
    

};
