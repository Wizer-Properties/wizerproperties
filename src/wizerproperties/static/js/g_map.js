let featureLayer;
var search_page_map;
var search_page_map_circle;

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
        var address_data = place?.address_components;
        var place_id;
        var fature_type;

        if([undefined, 'undefined'].includes(address_data)) return;

        for (let i = 0; i < address_data.length; i++){
            if(address_data[i]?.types.includes('locality')){
                place_id = place?.place_id;
                fature_type = "locality";
                break;
            }else{
                place_id = 'none';
                fature_type = "circle";
            }
        }

        if (place.geometry) {
            var latitude = place.geometry.location.lat();
            var longitude = place.geometry.location.lng();
            window.location.href = '/property/search/?place='+search_input.value+'&latitude='+latitude+'&longitude='+longitude+'&place_id='+place_id+'&fature_type='+fature_type;
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

    if(
        search_render_dom &&
        window.innerWidth > 991
    ){
        var get_url = new URL(window.location.href);
        var get_params = new URLSearchParams(get_url.search);
        var p_latitude = get_params.get('latitude');
        var p_longitude = get_params.get('longitude');
        var p_place_id = get_params.get('place_id');
        var p_fature_type = get_params.get('fature_type');
        var center_option = {lat: 13.7563309, lng: 100.5017651 }
        
        if(p_latitude && p_longitude){
            center_option.lat = Number(p_latitude);
            center_option.lng = Number(p_longitude);
        };
        
        if(p_fature_type == 'locality') {
            const { Map } = await google.maps.importLibrary("maps");
            search_page_map = new Map(search_render_dom, {
                zoom: 9,
                center: center_option,
                mapId: "a3efe1c035bad51b",
                zoomControl: false,
                mapTypeControl: false, 
                fullscreenControl: false,
            });
    
            featureLayer = search_page_map.getFeatureLayer("LOCALITY");
            
            const featureStyleOptions = {
                strokeColor: "#810FCB",
                strokeOpacity: 1.0,
                strokeWeight: 3.0,
                fillColor: "#810FCB",
                fillOpacity: 0.5,
            };
          
            featureLayer.style = (options) => {
                if (options.feature.placeId == p_place_id) {
                    return featureStyleOptions;
                }
            };

            console.log(search_page_map)
        } else {
            search_page_map = new google.maps.Map(search_render_dom, {
                zoom: 9,
                center: center_option,
                mapTypeId: "terrain",
                zoomControl: false,
                mapTypeControl: false, 
                fullscreenControl: false,
            });
            
            search_page_map_circle = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map : search_page_map ,
                center: center_option,
                radius: 20 * 1609.34,
            });
        };        
    };

    $(document).on('click', '.area-filter-buttons button', function(){
        if(window.innerWidth <= 991) return;
        if(search_page_map_circle){
            search_page_map_circle.setRadius( Number($(this).val()) * 1609.34);
        }else{
            var get_url = new URL(window.location.href);
            var get_params = new URLSearchParams(get_url.search);
            var p_latitude = get_params.get('latitude');
            var p_longitude = get_params.get('longitude');
            var center_option = {lat: 13.7563309, lng: 100.5017651 }
        
            if(p_latitude && p_longitude){
                center_option.lat = Number(p_latitude);
                center_option.lng = Number(p_longitude);
            };

            search_page_map = null;
            search_page_map = new google.maps.Map(search_render_dom, {
                zoom: 9,
                center: center_option,
                mapTypeId: "terrain",
                zoomControl: false,
                mapTypeControl: false, 
                fullscreenControl: false,
            });
            
            search_page_map_circle = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map : search_page_map ,
                center: center_option,
                radius: 20 * 1609.34,
            });
        }
    })
};
