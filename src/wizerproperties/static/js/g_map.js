let featureLayer;

async function initializeMap() {
    var options = {
        componentRestrictions: {
            country: "th"
        },
        fields : ["address_components", "geometry", "place_id"]
    };

    var search_input = document.getElementById("gm-search-input");
    var search_box = new google.maps.places.Autocomplete(search_input, options);

    google.maps.event.addListener(search_box, 'place_changed', function(){
        var place = search_box.getPlace();

        if (place.geometry) {
            var latitude = place.geometry.location.lat();
            var longitude = place.geometry.location.lng();
            
            console.log( place)
            window.location.href = '/property/search/?place='+search_input.value+'&latitude='+latitude+'&longitude='+longitude+'&place_id='+place?.place_id;
            return;
        };

        window.location.href = '/property/search/?place='+search_input.value
    })


    var gac_input = document.querySelectorAll(".pac-input");

    for (let i = 0; i < gac_input.length; i++) {        
        var autocomplete = new google.maps.places.Autocomplete(gac_input[i], options);
        
        google.maps.event.addListener(autocomplete, 'place_changed', function(){
            var _place = autocomplete.getPlace();
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

            if (_place.geometry) {
                var latitude = _place.geometry.location.lat();
                var longitude = _place.geometry.location.lng();
    
                $('[label-name="latitude"]').val(latitude);
                $('[label-name="longitude"]').val(longitude);
            }
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
    


    let search_render_dom = document.getElementById('search-map');

    if(search_render_dom){
        const { Map } = await google.maps.importLibrary("maps");

        console.log("=====================", Map)
        let map = new Map(search_render_dom, {
            zoom: 8,
            center: { lat: 13.7563309, lng: 100.5017651 },
            mapId: "a3efe1c035bad51b",
        });
        
        // new google.maps.Circle({
        //     strokeColor: "#FF0000",
        //     strokeOpacity: 0.8,
        //     strokeWeight: 2,
        //     fillColor: "#FF0000",
        //     fillOpacity: 0.35,
        //     map,
        //     center: { lat: 49.25, lng: -123.1 },
        //     radius: Math.sqrt(603502) * 100,
        // });



        featureLayer = map.getFeatureLayer("LOCALITY");

        // Define a style with purple fill and border.
        //@ts-ignore
        const featureStyleOptions = {
            strokeColor: "#810FCB",
            strokeOpacity: 1.0,
            strokeWeight: 3.0,
            fillColor: "#810FCB",
            fillOpacity: 0.5,
        };
      
        // Apply the style to a single boundary.
        //@ts-ignore
        featureLayer.style = (options) => {
            if (options.feature.placeId == "ChIJ82ENKDJgHTERIEjiXbIAAQE") {
                // Hana, HI
                return featureStyleOptions;
            }
        };

        
    };
};
