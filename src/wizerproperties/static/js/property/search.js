$(document).ready(function(){
    // Create a URL object
    var url = new URL(window.location.href);
    var place = url.searchParams.get("place");

    // default value from url path
    var d_building__sub_type = [];
    if(url.searchParams.get("building__sub_type")?.length > 0){
        d_building__sub_type = url.searchParams.get("building__sub_type")?.split(",");
    };

    var filter_data = new FilterData({
        min_price : url.searchParams.get("min_price") || null,
        max_price : url.searchParams.get("max_price") || null,
        min_number_of_bedroom : url.searchParams.get("min_number_of_bedroom") || null,
        max_number_of_bedroom : url.searchParams.get("max_number_of_bedroom") || null,
        building__type : url.searchParams.get("building__type") || '',
        building__sub_type : d_building__sub_type,
    });


    $('#gm-search-input').val(place || '');
    $('.search-area').html(place || '');
    var path_name = page_view == "search" ? "map-list" : "search"
    $('[label-name="view-tag"]').attr("href", "/property/"+path_name+"/"+window.location.search)


    


    function loader_tmp(){
        return '<div class="col-lg-12 mb-4 searching-loader">'+
                    '<div class="search-result-box-wrapper">'+
                        '<div class="row">'+
                            '<div class="col-lg-5 col-xl-4">'+
                                '<div class="search-result-box-img">'+
                                    '<span class="skeleton-box" style="width: 100%; height: 240px;"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="col-lg-6 col-xl-5">'+
                                '<div>'+
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
                                    '<div class="d-flex">'+
                                        '<span class="skeleton-box me-2" style="width: 40px; height: 30px;"></span>'+
                                        '<span class="skeleton-box me-2" style="width: 40px; height: 30px;"></span>'+
                                        '<span class="skeleton-box" style="width: 40px; height: 30px;"></span>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
    };
    
    
    function property_facility_tmp(data){
        var facility_tmp = '';

        if(data?.have_freehold){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Freehold</span>'
        };

        if(data?.have_leasehold){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Leasehold</span>'
        };
        
        if(data?.construction_year){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  Year Built '+data?.construction_year+'</span>'
        };

        if(data?.quota){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  '+data?.quota+' Quota </span>'
        };

        if(data?.distance_from_location_to_BTS_or_MRT){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  BTS Or MRT : '+data?.distance_from_location_to_BTS_or_MRT+'</span>'
        };

        if(data?.distance_from_location_to_ARL){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  ART : '+data?.distance_from_location_to_ARL+'</span>'
        };

        if(data?.have_pets_allowed){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  Pet Friendly </span>'
        };
        
        if(data?.view){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> '+data?.view+'</span>'
        };

        if(data?.have_infinity_pool){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Infinity Pool</span>'
        };

        if(data?.have_fitness_area){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Gym</span>'
        };

        if(data?.have_sky_lounge){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Sky Lounge</span>'
        };

        return facility_tmp;
    };


    function property_image_tmp(data, total_default_images){
        var image_tmp = '';
        for (let i = 0; i < data?.length; i++) {
            image_tmp += '<div class="splide__slide search-result-box-img">'+
                            '<img src="'+data[i]?.file+'" alt="image" loading="lazy">'+
                         '</div>'
        };

        if(data?.length < total_default_images){
            image_tmp += '<div class="splide__slide search-result-box-img search-result-box-img-loader">'+
                            '<span class="skeleton-box" style="width: 100%; height: 100%;"></span>'+
                         '</div>'
        }

        return image_tmp;
    };



    function property_multiple_images(data, id){
        if(data.length == 0) return '';
        var image_list = '';

        for (let i = 0; i < data.length; i++) {
            image_list += (
                '<div  class="pr-ml-image"> <img src="'+data[i]?.file+'" alt="img" loading="lazy"> </div>'
            )
        };

        return(
            '<a href="/property/details/'+id+'/" class="pr-ml-images-area">'+
                image_list +
            '</a>'
        )
    };

    

    function property_list_tmp(data, link){
        var dateString = data?.created_at;
        var formattedDate = new Date(dateString).toLocaleDateString('en-GB');   // Output formattedDate, it should be "09/03/2024"

        if( ['agent', 'developer'].includes(user_type) ){
            $('.add-to-compare').remove();
            $('.add-to-favorite').remove();
        };

        function detail_page_url() {
            let url = '/property/details/'+data?.id+'/'
            if (data?.tag == 'spotlight') {
                url = url + '?discounted=True'
            } else if (data?.tag == 'feature') {
                url = url + '?featured=True'
            }
            return url
        }

        var is_fav_effect = localStorage.getItem('favorite-effect');
        // property-type value seted newly-created, popular in css

        return  '<div class="col-12 mb-4 property-single-box" property-type="'+data?.tag+'">'+
                    '<div class="search-result-box-wrapper">'+
                        '<div class="row m-0">'+

                            '<div class="col-lg-6 col-xl-6 p-0">'+
                                '<div class="image-area-with-add-btns">'+
                                    '<div class="splide search-result-box-img-splid"'+
                                        'property-id="'+data?.id+'" images-next-page="'+(window.innerWidth <= 768 ? 2 : 3)+'"'+
                                        'loading moved-page="0" total-images="'+data?.total_default_images+'">'+
                                        '<div class="splide__track">'+
                                            '<div class="splide__list">'+
                                                property_image_tmp(data?.default_images, data?.total_default_images)+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                    (
                                        !['agent', 'developer'].includes(user_type) ?
                                        '<div class="compare-favorite-btn-area">'+
                                            '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                                '<i class="bi bi-heart-fill"></i>'+
                                                '<span> Favorite </span>'+
                                            '</button>' +
                                            '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                                '<i class="bi bi-arrow-left-right"></i>'+
                                                '<i class="bi bi-check2"></i>'+
                                                '<span> Compare </span>'+
                                            '</button>'+
                                        '</div>' : ''
                                    )+
                                    property_multiple_images(data?.images, data?.id) +
                                '</div>'+
                                '<div class="card-identity-area">'+
                                    (
                                        data?.tag == "spotlight" ?  // 'DiscountProperty' consider as 'spotlight'  
                                        '<div class="special-sale"><span> Flash Sale </span></div>' : ''
                                    )+
                                    (
                                        data?.tag == "feature" ?
                                        '<div class="special-sale"><span> Featured Listing </span></div>' : ''
                                    )+
                                '</div>'+
                            '</div>'+

                            '<div class="col-lg-6 col-xl-6 p-0">'+
                                '<div class="search-result-box">'+
                                    '<a href="'+detail_page_url()+'" class="d-block w-100">'+
                                        '<div class="search-box-title">'+
                                            '<span> '+data?.building_title+' </span>'+
                                            (   data?.discount_period ? 
                                                '<div class="search-date-count">'+
                                                    '<div date-count="'+data?.discount_period+'"></div>' +
                                                '</div>' : '') +
                                        '</div>'+
                                    '</a>'+
                                    '<div class="search-result-content">'+
                                        '<div>'+
                                            '<a href="/property/details/'+data?.id+'/" class="d-block w-100">'+
                                                '<div class="d-flex align-items-center flex-wrap gap-2">'+
                                                    '<div class="search-box-price">'+
                                                        '฿ '+ 
                                                        formatBalance(Math.floor(data?.price) || 0)+
                                                    '</div>'+
                                                    (
                                                        data?.building_status ? 
                                                        '<div class="building-status">'+
                                                            data?.building_status +
                                                        '</div>' : ''
                                                    )+
                                                '</div>'+
                                                
                                                '<div class="property-contains">'+
                                                ' <div class="property-short-info-box">'+
                                                        '<span class="material-symbols-outlined">bed</span>'+
                                                        '<span class="property-value"> '+ data?.number_of_bedroom +' </span>'+
                                                    '</div>'+
                                                    '<div class="property-short-info-box">'+
                                                        '<span class="material-symbols-outlined"> bathtub </span>' +
                                                        '<span class="property-value">'+ data?.number_of_bathroom +'</span>'+
                                                    '</div>'+
                                                    '<div class="property-short-info-box">'+
                                                        '<span class="material-symbols-outlined">apartment</span>' +
                                                        '<span class="property-value">'+ data?.unit_area +' sqm </span>'+
                                                    '</div>'+
                                                    '<div class="property-short-info-box">'+
                                                        '<span class="material-symbols-outlined">stairs</span>'+
                                                        '<span class="property-value">'+ data?.floor_number +'</span>'+
                                                    '</div>'+
                                                '</div>'+

                                                '<div class="property-faciluties-list mt-3">'+
                                                    property_facility_tmp(data)+
                                                '</div>'+
                                            '</a>'+

                                            '<div class="d-flex gap-2 mt-3">'+
                                                ( 
                                                    ![null, ''].includes(data?.interior_view) ?
                                                    '<button class="link border-0 open-3D-model" data-src="'+data?.interior_view+'" > Interior 3D View </button>' : ''
                                                )+
                                                (
                                                    data?.ariel_view ?
                                                    '<button class="link border-0 open-drone-view" data-src="'+data?.ariel_view+'" > Ariel View </button>' : ''
                                                )+
                                            '</div>'+
                                        '</div>'+

                                        '<div class="property-card-down-area">'+
                                            '<div class="agency-company-info">'+
                                                '<div class="buillding-agency-logo mb-2">'+
                                                    '<img src="'+ data?.developer_image +'" alt="company logo">'+
                                                '</div>'+
                                                '<div class="agent-company-name">'+
                                                    '<span>'+ data?.developer_company_name +'</span>'+
                                                    '<span> Added: '+ formattedDate +' </span>'+
                                                '</div>'+
                                            '</div>'+

                                            '<div class="property-card-modal-btns gap-2">'+
                                                '<div class="property-schedule-contact-btn">'+
                                                    '<a href="/schedule/create_schedule/?type=property&id='+data?.id+'" class="link border-0"'+
                                                        '<i class="bi bi-envelope"></i>Schedule Viewing'+
                                                    '</a>'+
                                                    '<a href="mailto:'+data?.developer_email+'" class="link border-0"'+
                                                        '<i class="bi bi-envelope"></i> Contact'+
                                                    '</a>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+

                                '</div>'+
                            '</div>'+

                        '</div>'+
                    '</div>'+
                '</div>'
    }


    var search_prams_list = {
        page_size : 5,
        search : place || '',
    };


    var active_free_scrolling = false;
    var next_property = 1;
    var price_slider_filter = false;


    function searching(search_type){
        var search_param = _.cloneDeep(search_prams_list);

        var get_filter_data = filter_data.only_has_value();
        for (var key in get_filter_data) {
            search_param[key] = get_filter_data[key];
        };

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
            url: '/property/api/list/',
            type: 'GET',
            data : search_param,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                if(
                    search_type == 'filter' &&
                    search_param.page == 1
                ) {
                    $('#search-result-list').html('');
                }

                $('#search-result-list').append(
                    loader_tmp() + loader_tmp() + loader_tmp()
                );                
            },
            success: function (data) {
                $('[label="available-properties"]').html(data?.count);

                next_property = data?.next;
                var new_data = data?.results;
                var search_dom = '';

                for (let i = 0; i < new_data.length; i++) {
                    search_dom += property_list_tmp(new_data[i])
                };
                
                if(search_type == 'filter'){
                    $('#search-result-list').html(search_dom);
                    pop_up_filter_active(search_param) // for give active color

                    if(!price_slider_filter){
                        pop_dispatch() // this is call from main.js file fow hide pop up
                    };
                    
                    price_slider_filter = false;
                }else{
                    $('#search-result-list').append(search_dom);
                };


                var timer = new Countdown({
                    template : "dd|hh|mm",
                    labels : "Days|Hours|Minutes"
                }) // for time countdown
                timer.start()

                installing_splide(); // init slider for image

                active_free_scrolling = false;
                last_property_box = $('.property-single-box').last();
                $('.searching-loader').remove();

                // showing sorting type dom
                if(search_param.ordering) sorting_dom(search_param);
            },
            error: function (error) {
                active_free_scrolling = false;
                $('.searching-loader').remove();
                console.log("error")
            }
        });
    };

    searching("search");


    function pop_up_filter_active(search_param){
        function active_status(selector, param){
            var nearby_status = ![undefined, null, ''].includes(param);
            selector.attr('active-filter', nearby_status);
        };

        active_status($('[filter-name="radius"]'), search_param.nearby)
        active_status($('[filter-name="property-type"]'), search_param.building__type)

        active_status($('[filter-name="price-box"]'), search_param.min_price || search_param.max_price);
        var bed_room_status = search_param.min_number_of_bedroom || search_param.max_number_of_bedroom;
        active_status($('[filter-name="bed-box"]'), bed_room_status);
    };


    function sorting_dom(search_param){
        if(search_param.ordering == "-created_at") $('[label="sorting-type"]').html("Default");
        if(search_param.ordering == "-price" ) $('[label="sorting-type"]').html("Highest price");
        if(search_param.ordering == "price" ) $('[label="sorting-type"]').html("Lowest price");
    }


    $(window).on('scroll', function() {
        var targetSection =  $('.property-single-box').last()[0];
        const elementRect = targetSection?.getBoundingClientRect();
        if(!elementRect) return;
        if(active_free_scrolling) return;
        if (
            elementRect.top >= 0 && 
            elementRect.bottom <= window.innerHeight
        ){
            active_free_scrolling = true;
            searching("search");
        }
    });


    $(document).on('change', 'select', function(){
        filter_data.set_value( $(this).attr('name'), $(this).val() )

        if(["min_price", "max_price"].includes($(this).attr('name'))){
            select_price_vai_slide()
        }

        next_property = 1;
        searching("filter");
    });

    function select_price_vai_slide(){
        var newMinValue = filter_data.min_price == "500000" ? 0 : Number(filter_data.min_price || 0) / 1000000;
        var newMaxValue = filter_data.max_price == "500000" ? 0 : Number(filter_data.max_price || 100000000) / 1000000;

        $("#price-slider").slider("values", [newMinValue, newMaxValue]);
        $('.before-li').css({ width : newMinValue+'%'  })
        $('.after-li').css({ width : (100 - newMaxValue)+'%'  })
    };

    $(document).on('click', '.apply-btn', function(){
        next_property = 1;
        searching("filter");
    })

    $(document).on('click', '.filter-clear', function(){
        var for_type = $(this).attr('for');
        if(for_type == "property-type") filter_data.clear_building_type();
        next_property = 1;
        searching("filter");
    });


    $(document).on('click', '[name="ownership"] button', function(){
        $(this).parents('.filter-dropdown-mtl-buttons').find('button').attr('active', false);        
        var active_status = filter_data.free_lease_hold_toggle_data($(this).attr("name"));
        next_property = 1;
        searching("filter");
        $(this).attr('active', active_status);
    });


    $(document).on('click', '[name="property-type"] button, [name="property-quota"] button, [name="property-furnishing"] button, [name="project-status"] button', function(){
        $(this).parents('.filter-dropdown-mtl-buttons').find('button').attr('active', false);
        var active_status = filter_data.select_vai_button($(this).attr('name'), $(this).val())
        next_property = 1;
        searching("filter");
        $(this).attr('active', active_status);
    });


    // building type filter ========================= (start)
    
    $(document).on('change', '.custom-radio-checkbox input', function(){
        filter_data.building_sub_type_void($(this).val());

        if( $(this).parents('[type-init]').attr('type-init') == 'RESIDENCE_SUB_TYPES' ){
            filter_data.set_value( 'building__type', 'residence' )
        };

        if( $(this).parents('[type-init]').attr('type-init') == 'COMMERCIAL_SUB_TYPES' ){
            filter_data.set_value( 'building__type', 'commercial' )
        };
    });


    $(document).on('click', '.property-type-list button', function(){
        filter_data.building__type = $(this).attr('value');
        filter_data.building_type_void();
    });


    $(document).on('click', '.property-type-apply, .filter-done', function(){
        if(
            $(this).attr('class').includes('filter-done') &&
            window.innerWidth > 991
        ) return;

        next_property = 1;
        searching("filter");
    });

    $(document).on('click', '.property-type-clear, .reset-btn', function(){
        if(
            $(this).attr('class').includes('reset-btn') &&
            window.innerWidth > 991
        ) return;


        pop_dispatch()
        next_property = 1;
        searching("filter");
    });

    // building type filter ========================= (end)


    $('.reset-btn').click(function(){
        filter_data.clear_all();
        prams_list = {
            search : place || ''
        };

        next_property = 1;
        searching("filter");

        $('[label="sorting-type"]').html("Default");
        $('body').attr('filter-modal-open', 'false')
    });




    function installing_splide(){
        var elms = $('.search-result-box-img-splid');

        for (var i = 0; i < elms.length; i++) {
            (function (index) {
                var image_splider = new Splide(elms[index], {
                    gap: 5,
                    perPage: 1,
                    pagination: false,
                    breakpoints: {
                        991 : {
                            perPage: 2,
                        },
                        768 : {
                            perPage: 1,
                        },
                    }
                }).mount();
        
                image_splider.on('moved', function (e) {
                    var option_list = {
                        splide_el : image_splider,
                        element : elms[index],
                        moved_page : e
                    };

                    get_images(option_list)
                });
            })(i);
        }
    };

    function loader_for_img(){
        return  '<div class="splide__slide search-result-box-img search-result-box-img-loader">'+
                    '<span class="skeleton-box" style="width: 100%; height: 100%;"></span>'+
                '</div>'
    }

    function get_images ({
        element,
        splide_el,
        moved_page
    }){
        var is_loading = element.getAttribute('loading');
        if( Boolean(is_loading) ) return;

        var moved_page_to = element.getAttribute('moved-page');
        if(Number(moved_page_to) >= moved_page ) return;
        element?.setAttribute('moved-page', moved_page);
        var property_id = element.getAttribute('property-id');
        var next_page = element.getAttribute('images-next-page');
        if( [null, undefined, NaN, ''].includes(Number(next_page))) return;
        
        element?.setAttribute('loading', 'true');

        $.ajax({
            url: '/property/api/details/'+property_id+'/media-files/',
            type: 'GET',
            data : {
                page_size : 1,
                media_type : 'image',
                page : Number(next_page)
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                element?.setAttribute('images-next-page', data?.next);
                splide_el.add(property_image_tmp(data?.results));
                splide_el.remove('.search-result-box-img-loader');
                if(data?.next){
                    splide_el.add(loader_for_img())
                };
            },
            error : function () {
                console.log("erorr")
            },
            complete: function(){
                element?.setAttribute('loading', '');
            }
        });
    };


    $(document).on('click', '.open-3D-model', function(){
        var _iframe = '<iframe width="100%" height="100%" src="'+$(this).attr('data-src')+'" frameborder="0" allowfullscreen=""></iframe>'
        $('#_3d_view_dialog ._3d_model_display').html(_iframe);
        $('#_3d_view_dialog').modal("show");
    });


    $(document).on('click', '.open-drone-view', function(){
        var _player = videojs($('#_3d_drone_view video')[0]);
        _player.reset();
        var _video = '<source src="'+$(this).attr('data-src')+'" type="video/mp4" />';
        $('#_3d_drone_view ._3d_model_display video').append(_video);
        $('#_3d_drone_view').modal("show");
    });


    $(document).on('click', '.close_3d_view_dialog', function(){
        $('#_3d_view_dialog').modal("hide");
        $('#_3d_view_dialog ._3d_model_display').html('');
    });


    $(document).on('click', '.close_3d_drone_view', function(){
        var _player = videojs($('#_3d_drone_view video')[0]);
        _player.pause();
        _player.reset();

        $('#_3d_drone_view').modal("hide");
        $(this).parents('#_3d_drone_view').find('video')[0].pause()
        $(this).parents('#_3d_drone_view').find('video').html(
            '<p class="vjs-no-js">'+
                'To view this video please enable JavaScript, and consider upgrading to a web browser that'+
            '</p>'
        );
    });


    $('[aria-label="filter-button"]').click(function(){
        var is_modal_open = $('body').attr('filter-modal-open');
        if(is_modal_open == 'true'){
            $('body').attr('filter-modal-open', 'false')
        }else{
            $('body').attr('filter-modal-open', 'true')
        };
    });


    $('.filter-done').click(function(){
        $('body').attr('filter-modal-open', 'false');
    });

    $('.filter-option-single-box select').click(function(){
        $('body').attr('filter-modal-open', 'false');
    });


    function default_price_range(){
        var default_range = [0, 100];

        if(Number(filter_data.min_price)){
            var _rt = Number(filter_data.min_price) / 1000000;
            default_range[0] = _rt;
            $('.before-li').css({ width : _rt+'%'  })
        };

        if(Number(filter_data.max_price)){
            var _rt = Number(filter_data.max_price) / 1000000
            default_range[1] =  _rt;
            $('.after-li').css({ width : (100 - _rt)+'%'  })
        };

        return default_range;
    };

    $("#price-slider").slider({
        range: true, // Enable range
        min: 0,
        max: 100,
        step: 1,
        values: default_price_range(), // Initial range values
        slide : function(event, ui){
            $('.before-li').css({ width : ui.values[0]+'%'  })
            $('.after-li').css({ width : (100 - ui.values[1])+'%'  })

            var min_val = Number(ui.values[0]) + '000000';
            var max_val = Number(ui.values[1]) + '000000';
            $('[name="min_price"]').val( ui.values[0] ? min_val : '500000');
            $('[name="max_price"]').val( ui.values[1] ? max_val : 'null');
        },
        stop: function(event, ui) {
            var min_val = Number(ui.values[0]) + '000000';
            var max_val = Number(ui.values[1]) + '000000';
            filter_data.set_value("min_price",  ui.values[0] ? Number(min_val) : '500000')
            filter_data.set_value("max_price",  ui.values[1] ? Number(max_val) : '')

            next_property = 1;
            price_slider_filter = true;
            searching("filter");
        }
    });


    $(document).on('click', '.sorting-list-box li', function(){
        var _val = $(this).attr('value');
        $(this).parent().find('li').attr('active', 'false');
        $(this).attr('active', 'true');
        prams_list.ordering = _val;
        prams_list.page = 1;
        next_property = 1;
        searching("filter")
    });


    $(document).on('click', '.filter-location-box .filter-icon', function(){
        $(this).parents('.filter-location-box').find('input').trigger( "focus" );
    });



    var got_price_data = false;
    $(document).on('click', '[tag-name="price"]', function(){
        if(got_price_data) return;

        $.ajax({
            url: '/property/api/count-in-price-ranges/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                console.log("hello")
            },
            success: function (data) {
                got_price_data = true;

                var obje = {
                    [data.highest_count_range] : data.highest_count
                }

                var sadf = calculateHeightPercentages(data.price_counts , obje)

                $('.price-rage-chart').html('')
                $('.price-rage-chart').append('<div class="before-li"></div>');
                for (var i = 0; i < sadf.length; i++) {
                    $('.price-rage-chart').append('<li style="height: '+sadf[i].heightPercentage+'%;"></li>')
                };
                $('.price-rage-chart').append('<div class="after-li"></div>');
                default_price_range()

            },
            error: function (error) {
                got_price_data = false;
            }
        });


    });


    function calculateHeightPercentages(products, highestValuePair) {
        // Ensure highestValuePair is an object with one key-value pair
        if (typeof highestValuePair !== 'object' || highestValuePair === null || Object.keys(highestValuePair).length !== 1) {
            throw new Error("highestValuePair must be an object with exactly one key-value pair");
        }
    
        // Get the highest value from the highestValuePair object
        const highestValue = Object.values(highestValuePair)[0];
    
        // Initialize the array to store the percentages
        const heightPercentages = [];
    
        // Calculate the height percentage for each product
        for (const [key, value] of Object.entries(products)) {
            const heightPercentage = (value / highestValue) * 100;
            heightPercentages.push({ index: key, heightPercentage });
        }
    
        return heightPercentages;
    };




    


    // search with map code ==============================================================

    var markers = [];
    var markerIcon = "/static/media/icons/red-dot.png";
    var markerSelectedAreaIcon = "/static/media/icons/home-dot.png";

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


    var prams_list = {
        page_size : 5,
        search : place || ''
    }
    var next_property = 1;

    function map_building_list(){
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
                clearMarkers();

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
                        resetMarkerIcons();
                        marker.setIcon(markerSelectedAreaIcon);
                        next_property = 1;
                        building_id_for_map = item.id
                        prams_list.building__id = item.id
                        prams_list.default_images_number = window.innerWidth <= 768 ? 1 : 2
                        prams_list.platform = window.innerWidth >= 768 ? 'web' : ''

                        if( prams_list?.hasOwnProperty("search") ){
                            delete prams_list.search;
                        };
                        searching("filter"); // get property data under the building

                        $('.map-button-info button').show()
                    });
                })
            },
            error: function (error) {
            }
        });
    };

    if(page_view == "map-list"){
        map_building_list();
    };



    $('.reset-map').click(function(){
        resetMarkerIcons();
        next_property = 1;
        building_id_for_map = null;
        if( prams_list?.hasOwnProperty("building__id") ){
            delete prams_list.building__id;
        };
        prams_list.place = place;
        prams_list.default_images_number = window.innerWidth <= 768 ? 1 : 2
        prams_list.platform = window.innerWidth >= 768 ? 'web' : ''

        searching("filter");
        $(this).hide()
    });

    // Onclick event handler on map click
    // google.maps.event.addListener(search_page_map, "click", function(event) {
    //    console.log("==========")
    // });
    
});