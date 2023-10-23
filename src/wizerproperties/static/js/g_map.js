function initializeMap() {
    var options = {
        componentRestrictions: {
            country: "th"
        },
        types: ['(regions)'],
        fields : ['address_components']
    };

    var search_input = document.getElementById("gm-search-input");
    new google.maps.places.Autocomplete(search_input, options);

    var gac_input = document.querySelectorAll(".pac-input");

    for (let i = 0; i < gac_input.length; i++) {
        
        var autocomplete = new google.maps.places.Autocomplete(gac_input[i], options);
        
        google.maps.event.addListener(autocomplete, 'place_changed', function(){
            var address_data = autocomplete.getPlace()?.address_components;

            for (let i = 0; i < address_data.length; i++) {
                if(address_data[i]?.types.includes('administrative_area_level_1')){
                    if($('[label="provice"]')){
                        $('[label="provice"]').val(address_data[i]?.long_name)
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
        
    let render_dom = document.getElementById('map')
    
    var myLatLng = { lat: 37.7749, lng: -122.4194 };
    if(!render_dom) return;
    
    var map = new google.maps.Map(render_dom, {
        center: myLatLng,
        zoom: 12
    });

    new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Hello, World!'
    });

};
