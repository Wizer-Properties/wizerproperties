$(document).ready(function(){
    
    // Create a URL object
    var url = new URL(window.location.href);
    var place = url.searchParams.get("place");
    $('#gm-search-input').val(place || '');
    $('.search-area').html(place || '');
    var markers = [];
    var markerIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    var markerSelectedAreaIcon = "http://maps.gstatic.com/mapfiles/ms2/micons/rangerstation.png";

    function clearMarkers() {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
    }

    function resetMarkerIcons() {
        markers.forEach((marker) => {
          marker.setIcon(markerIcon); // Reset icon of all markers
        });
    }
    

    $(document).on('click', '.filter-dropdown-btn', function(){
        var target_area = 
            $(this)
            .parents('.filter-categories-dropdown')
            .find('.filter-dropdown-field')

        target_area.slideToggle(200);

        $('body').prepend('<div class="filter-overlay"></div>');

        var target_position = target_area[0].getBoundingClientRect();
        var widnow_w = window.innerWidth;
        var total_el = target_position?.width + target_position?.x;

        if(total_el + 10 > widnow_w){
            target_area.css({
                left : widnow_w - (total_el + 10)
            })
        }else{
            target_area.css({
                left : 0
            })
        };
    });
    

    function filter_close_dropdown(){
        $('.filter-dropdown-field').slideUp(200)

        setTimeout(() => {
            $('.filter-dropdown-field').css({
                left : 0
            })
            $('.filter-overlay').remove()
        }, 200);
    };


    $(document).on('click', '.filter-overlay', filter_close_dropdown);

    function loader_tmp(){
        return '<div class="col-lg-12 mb-1 searching-loader">'+
                    '<div class="search-result-box-wrapper">'+
                        '<span class="skeleton-box" style="width: 100%; height: 200px;"></span>'+
                        '<div class="search-result-box">'+
                            '<h1> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </h1>'+
                            '<div class="location">'+
                                '<span class="skeleton-box" style="width: 100%; height: 20px;"></span>'+
                            '</div>'+
                            '<p class="sub-title">'+
                                '<span class="skeleton-box" style="width: 100%; height: 21px;"></span>'+
                            '</p>'+

                            '<p class="details">'+
                                '<span class="skeleton-box" style="width: 100%; height: 40px;"></span>'+
                            '</p>'+  
                        '</div>'+
                    '</div>'+
                '</div>'
    };

    function loader_tmp_nearby_items(){
        return '<div class="row" style="height: 115px;width: 100%;">'+
                '<div class="col-lg-3 col-xl-4">'+
                    '<div class="search-result-box-img">'+
                        '<span class="skeleton-box" style="width: 100%; height: 90px;"></span>'+
                    '</div>'+
                '</div>'+
                '<div class="col-lg-9 col-xl-8">'+
                    '<div class="search-result-box" style="height:auto">'+
                        '<h1> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </h1>'+
                        '<div class="location">'+
                            '<span class="skeleton-box" style="width: 100%; height: 20px;"></span>'+
                        '</div>'+
                        
                        '<p class="details">'+
                            '<span class="skeleton-box" style="width: 100%; height: 40px;"></span>'+
                        '</p>'+
                        
                    '</div>'+
                '</div>'+
            '</div>'
    };

    function getDetailProperty(propertyID){
        // Loader skeleton
        $(".property-search-map-detail-modal").find(".property-search-map-modal-body").find(".detail-body").html(loader_tmp)

        $.ajax({
            url: '/property/api/details/' + propertyID + '/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function(res){
                $(".property-search-map-detail-modal").find(".property-search-map-modal-body").find(".detail-body").html(
                    '<div class="item-detail-container">'+
                        '<div class="image-gallery">'+
                            '<img style="height: 160px;" class="card-img-top" src="'+ res.default_image +'" alt="Card image cap">' +
                        '</div>'+
                        '<div class="price" style="background-color:#b9acac21;font-weight: bold;padding:10px;">£'+ res.price +'</div>'+

                        '<p style="font-size: 13px;margin-top: 20px;">'+ res.description.slice(0, 200) +'</p>' +
                        '<a href="/property/details/'+ res.id +'" class="btn btn-success" target="_blank">See Full Property Details</button>'+
                    '</div>'
                    + "<hr>"
                )
            }
        })
    }

    function getRelatedProperties(propertyID){
        $.ajax({
            url: '/property/api/nearby_property_list/' + propertyID + '/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function(res){
                var nearbyItems = ""
                res.results.forEach(function(item){
                    nearbyItems += '<div class="row nearby-single-item" data-property-id="'+ item.id +'" style="height: 115px;width: 100%;cursor: pointer;">'+
                        '<div class="col-lg-3 col-xl-4">'+
                            '<div class="search-result-box-img">'+
                                '<img src="'+ item.default_image +'" class="img-responsive" alt=""  style="width: 100%; height: 90px;"/>'+
                            '</div>'+
                        '</div>'+
                        '<div class="col-lg-9 col-xl-8">'+
                            '<div class="search-result-box" style="height:auto">'+
                                '<p style="font-size: 14px; font-weight: bold;color: green;">'+ item.title.slice(0, 30) +'</p>'+
                                '<p style="font-size: 13px; color: grey;">'+ item.description.slice(0, 60) +'</p>'+
                                
                                '<p class="details">'+
                                '<p style="font-size: 16px; font-weight: bold;color: black;">$'+ item.price +'</p>'+
                                '</p>'+
                                
                            '</div>'+
                        '</div>'+
                    '</div>'
                })
                $(".property-search-map-detail-modal").find(".property-search-map-modal-body").find(".nearby-items").html(
                    "<p>Nearby properties matching your criteria</p>" + 
                    nearbyItems
                )
            }
        })
    }

    $(document).on("click", ".nearby-single-item", function(){
        var this_ = $(this)

        resetMarkerIcons()
        getDetailProperty(this_.data("property-id"))
        getRelatedProperties(this_.data("property-id"))

        // Select marker
        markers.forEach(function(marker) {
            if (marker.id == "marker_id_" + this_.data("property-id")) {
                marker.setIcon(markerSelectedAreaIcon);
            }
        });
    })

    var prams_list = {
        page_size : 5,
        search : place || ''
    }
    var next_property = 1;

    function searching(search_type){
        var search_param = prams_list;
        var get_url = new URL(window.location.href);
        var get_params = new URLSearchParams(get_url.search);
        var p_latitude = get_params.get('latitude');
        var p_longitude = get_params.get('longitude');

        if(p_latitude && p_longitude){
            search_param.lat = p_latitude;
            search_param.long = p_longitude;
        };
        
        if(next_property) search_param.page = next_property;
        if([null].includes(next_property)) return;

        // removing search filter for nearby
        if(
            search_param?.hasOwnProperty("nearby") &&
            search_param?.hasOwnProperty("search")
        ){
            delete search_param.search;
        };
        
        $.ajax({
            url: '/building/api/building_list_for_map_search/',
            type: 'GET',
            data : search_param,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {

                clearMarkers()

                data.results.forEach(function(item){
                    var marker = new google.maps.Marker({
                        position: {lat: item.latitude, lng: item.longitude },
                        map: search_page_map,
                        icon: {
                          url: markerIcon,
                          labelOrigin: new google.maps.Point(75, 32),
                          size: new google.maps.Size(32,32),
                          anchor: new google.maps.Point(16,32),
                        },
                        id: "marker_id_" + item.id
                    });

                    markers.push(marker)
        
                    marker.addListener('click', function() {
                        resetMarkerIcons()

                        marker.setIcon(markerSelectedAreaIcon)

                        $(".property-search-map-detail-modal").css({
                            "display": "block"
                        })
                        

                        // Loader skeleton
                        $(".property-search-map-detail-modal").find(".property-search-map-modal-body").find(".nearby-items").html(
                            loader_tmp_nearby_items() + loader_tmp_nearby_items() + loader_tmp_nearby_items()
                        )

                        // Get property details and related properties
                        getDetailProperty(item.id)
                        getRelatedProperties(item.id)
                        
                    });
                })
                
            },
            error: function (error) {
            }
        });
    };

    searching("search");


    $(document).on('change', 'select', function(){
        filter_close_dropdown();
        prams_list[$(this).attr('name')] = $(this).val() == 'null' ? '' : $(this).val();
        next_property = 1;
        searching("filter");
    });


    $(document).on('click', '.filter-dropdown-buttons button', function(){
        var get_val =  $(this).val() == 'null' ? '' :  $(this).val();
        filter_close_dropdown();

        var render_btn_dom = get_val == '' ? '' : ' ('+get_val+') ';
        if(prams_list[$(this).attr('name')] == get_val){
            render_btn_dom = ''
        };
        var label_name = $(this).parents('.filter-categories-dropdown').attr('label');

        $(this).parents('.filter-categories-dropdown').find('.filter-dropdown-btn')
        .html(label_name + render_btn_dom + ' <i class="bi bi-chevron-down"></i>')

        if(prams_list[$(this).attr('name')] == get_val){
            $(this).parents('.filter-dropdown-buttons').find('button').attr('active', false);
            prams_list[$(this).attr('name')] = '';
            $(this).parents('.filter-dropdown-buttons').find('button[value="null"]').attr('active', true);
            if(get_val != '') {
                next_property = 1;
                searching("filter");
            }
            
            return;
        };

        prams_list[$(this).attr('name')] =  get_val;
        next_property = 1;
        searching("filter");

        $(this).parents('.filter-dropdown-buttons').find('button').attr('active', false);
        $(this).attr('active', true);
    });


    $(document).on('click', '[name="features"] button', function(){
        filter_close_dropdown();
        prams_list[$(this).val()] = !prams_list[$(this).val()];
        $(this).attr('active', prams_list[$(this).val()]);

        if(!prams_list[$(this).val()]){
            delete prams_list[$(this).val()];
        };

        next_property = 1;
        searching("filter");
    });


    $(document).on('click', '[name="property-type"] button, [name="property-quota"] button, [name="property-furnishing"] button', function(){
        filter_close_dropdown();
        $(this).parents('.filter-dropdown-mtl-buttons').find('button').attr('active', false);

        if(prams_list[$(this).attr('name')] == $(this).val()){
            prams_list[$(this).attr('name')] = '';
            next_property = 1;
            searching("filter");
            return
        };

        prams_list[$(this).attr('name')] =  $(this).val();
        next_property = 1;
        searching("filter");
        $(this).attr('active', true);
    });


    $('.reset-btn').click(function(){
        if( Object.keys(prams_list).length > 1 ){
            prams_list = {
                search : place || ''
            };

            next_property = 1;
            searching("filter")

            $('[label="price"] button.filter-dropdown-btn').html('Any Price <i class="bi bi-chevron-down"></i>');
            $('[label="unit_area"] button.filter-dropdown-btn').html('Any Price <i class="bi bi-chevron-down"></i>');
            $('[label="Beds"] button.filter-dropdown-btn').html('Beds <i class="bi bi-chevron-down"></i>');
            $('[label="Baths"] button.filter-dropdown-btn').html('Baths <i class="bi bi-chevron-down"></i>');
            $('[label="Area"] button.filter-dropdown-btn').html('Area <i class="bi bi-chevron-down"></i>');
            $('.filter-dropdown-buttons button').attr('active', false);
            $('.filter-dropdown-buttons [value="null"]').attr('active', true);
            $('.filter-dropdown-mtl-buttons button').attr('active', false);
            $('select').val('null')
        }
    });


    function formatNumber(number) {
        if(
            Number(number) == NaN ||
            [null, undefined, ''].includes(number)
        ){
            return number
        }

        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(1) + ' B';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + ' M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + ' k';
        } else {
            return number.toString();
        }
    };

    // Onclick event handler on map click
    google.maps.event.addListener(search_page_map, "click", function(event) {
        $(".property-search-map-detail-modal").css({
            "display": "none"
        })
    });

});