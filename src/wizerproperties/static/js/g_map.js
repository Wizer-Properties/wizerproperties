let featureLayer;
var search_page_map;
var search_page_map_circle;

async function initializeMap() {
    var options = {
        componentRestrictions: {
            country: "th"
        },
        fields : ["address_components", "geometry", "place_id", "types"]
    };

    var search_input = document.getElementById("gm-search-input");
    var search_box = new google.maps.places.Autocomplete(search_input, options);

    google.maps.event.addListener(search_box, 'place_changed', function(){
        var place = search_box.getPlace();
        var place_id = place?.place_id;
        var fature_type = place?.feature_type;
        
        if(['', null, undefined].includes(fature_type)){
            if( place?.types.includes("administrative_area_level_1") ){
                fature_type = "administrative_area_level_1";
            }else if( place?.types.includes("locality") ){
                fature_type = "locality";
            }else if( place?.types.includes("postal_code") ){
                fature_type = "postal_code";
            }else{
                fature_type = "circle";
            }
        };

        var redirectPath = "/property/search/"
        if(window.location.pathname == "/property/map-list/"){
            redirectPath = "/property/map-list/"
        }

        if (place.geometry) {
            var latitude = place.geometry.location.lat();
            var longitude = place.geometry.location.lng();
            window.location.href = redirectPath +
                                    '?place='+search_input.value+
                                     '&latitude='+latitude+
                                    '&longitude='+longitude+
                                    '&place_id='+place_id+
                                    '&fature_type='+fature_type;
            return
        };

        window.location.href = redirectPath + '?place='+search_input.value
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
        
        async function init_map_circle (){
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

            function circle_shape_void () {
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
                    radius: 15 * 1609.34,
                });
            };
            
            if(p_fature_type != 'circle') {
                const { Map } = await google.maps.importLibrary("maps");

                function MAPFEATURETYPE(){
                    if(
                        ["ADMINISTRATIVE_AREA_LEVEL_1", "administrative_area_level_1"].includes(p_fature_type)
                    ) return google.maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_1;
                    if(p_fature_type == "locality") return google.maps.FeatureType.LOCALITY;
                    if(p_fature_type == "postal_code") return google.maps.FeatureType.POSTAL_CODE;
                }

                // function MAPID(){
                //     if(
                //         ["ADMINISTRATIVE_AREA_LEVEL_1", "administrative_area_level_1"].includes(p_fature_type)
                //     ) return "7ba16be0c9375fa7";
                //     if(p_fature_type == "locality") return "a3efe1c035bad51b";
                //     if(p_fature_type == "postal_code") return "a3efe1c035bad51b";
                // }

                search_page_map = new Map(search_render_dom, {
                    zoom: 9,
                    center: center_option,
                    mapId: 'b0addd8cbd8a8fc6',
                    zoomControl: false,
                    mapTypeControl: false, 
                    fullscreenControl: false,
                });
        
                featureLayer = search_page_map.getFeatureLayer(MAPFEATURETYPE());

                
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
            } else {
                circle_shape_void()
            };
        };

        init_map_circle();

        $(document).on('click', '.reset-btn', async function(){
            init_map_circle();
            search_page_map_circle = null;
        });

        $(document).on('click', '.search-box-clear-button', function(){
            $('#gm-search-input').val('');
            $('#gm-search-input').focus();
        })
        
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
                radius:  Number($(this).val()) * 1609.34,
            });
        }
    });




};
