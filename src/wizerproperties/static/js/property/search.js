$(document).ready(function(){
    // Create a URL object
    var url = new URL(window.location.href);
    var place = url.searchParams.get("place");
    $('#gm-search-input').val(place || '');
    $('.search-area').html(place || '');
    

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
        return '<div class="col-lg-12 mb-4 searching-loader">'+
                    '<div class="search-result-box-wrapper">'+
                        '<div class="row">'+
                            '<div class="col-lg-5 col-xl-7">'+
                                '<div class="search-result-box-img">'+
                                    '<span class="skeleton-box" style="width: 100%; height: 240px;"></span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="col-lg-7 col-xl-5">'+
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

        if(data?.building_info?.have_freehold){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Freehold</span>'
        };

        if(data?.building_info?.have_leasehold){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Leasehold</span>'
        };
        
        if(data?.building_info?.construction_year){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  Year Built '+data?.building_info?.construction_year+'</span>'
        };

        if(data?.building_info?.quota){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  '+data?.building_info?.quota+' Quota </span>'
        };

        if(data?.building_info?.distance_from_location_to_BTS_or_MRT){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  BTS Or MRT : '+data?.building_info?.distance_from_location_to_BTS_or_MRT+'</span>'
        };

        if(data?.building_info?.distance_from_location_to_ARL){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  ART : '+data?.building_info?.distance_from_location_to_ARL+'</span>'
        };

        if(data?.building_info?.have_pets_allowed){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i>  Pet Friendly </span>'
        };
        
        if(data?.building_info?.view){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> '+data?.building_info?.view+'</span>'
        };

        if(data?.building_info?.have_infinity_pool){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Infinity Pool</span>'
        };

        if(data?.building_info?.have_fitness_area){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Gym</span>'
        };

        if(data?.building_info?.have_sky_lounge){
            facility_tmp += '<span> <i class="bi bi-geo-alt"></i> Sky Lounge</span>'
        };

        return facility_tmp;
    };


    function property_image_tmp(data){
        var image_tmp = '';
        for (let i = 0; i < data?.length; i++) {
            image_tmp += '<div class="splide__slide search-result-box-img">'+
                            '<img src="'+data[i]+'" alt="image" loading="lazy">'+
                         '</div>'
        };

        return image_tmp;
    };


    function property_list_tmp(data){
        if( ['agent', 'developer'].includes(user_type) ){
            $('.add-to-compare').remove();
            $('.add-to-favorite').remove();
        };

        var aerial_drone_video = _.find(data.building_info.all_media_files, { 'type': 'aerial_drone_video' });

        return  '<div class="col-12 mb-4 property-single-box">'+
                    '<div class="search-result-box-wrapper p-0">'+
                        '<div class="row m-0">'+
                            '<div class="col-lg-5 col-xl-7 p-0">'+
                                '<div class="splide search-result-box-img-splid">'+
                                    '<div class="splide__track">'+
                                        '<div class="splide__list">'+
                                            property_image_tmp(data?.all_media_files)+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="search-box-price">'+
                                    '฿ '+ 
                                    formatBalance(Math.floor(data?.price) || 0)+
                                '</div>'+
                            '</div>'+
                            '<div class="col-lg-7 col-xl-5 p-0">'+
                                '<div class="search-result-box p-3">'+
                                    '<div>'+
                                        '<a href="/property/details/'+data?.id+'/" class="d-block">'+
                                            '<h1> '+data?.title+' </h1>'+
                                            
                                            '<div class="property-contains">'+
                                            ' <div class="property-short-info-box">'+
                                                    '<div class="property-short-info-icon">'+
                                                        '<img src="/static/media/icons/bed.svg" alt="bed-icon">'+
                                                    '</div>'+
                                                    '<span class="property-value"> '+ data?.number_of_bedroom +' </span>'+
                                                '</div>'+
                                                '<div class="property-short-info-box">'+
                                                    '<div class="property-short-info-icon">'+
                                                        '<img src="/static/media/icons/bath.svg" alt="bath-icon">'+
                                                    '</div>'+
                                                    '<span class="property-value">'+ data?.number_of_bathroom +'</span>'+
                                                '</div>'+
                                                '<div class="property-short-info-box">'+
                                                    '<div class="property-short-info-icon">'+
                                                        '<img src="/static/media/icons/plan-size.svg" alt="plan-size-icon">'+
                                                    '</div>'+
                                                    '<span class="property-value">'+ data?.unit_area +' sqm </span>'+
                                                '</div>'+
                                                '<div class="property-short-info-box">'+
                                                    '<div class="property-short-info-icon">'+
                                                        '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                                                    '</div>'+
                                                    '<span class="property-value">'+ data?.floor_number +'</span>'+
                                                '</div>'+
                                            '</div>'+

                                            '<p class="details"> '+ data?.description +'</p>'+

                                            '<div class="property-faciluties-list mt-3">'+
                                                property_facility_tmp(data)+
                                            '</div>'+
                                        '</a>'+
                                    '</div>'+

                                    '<div class="property-card-down-area">'+
                                        '<div class="property-card-modal-btns">'+
                                            ( 
                                                ![null, ''].includes(data?.interior_view) ?
                                               '<button class="link border-0 open-3D-model" data-src="'+data?.interior_view+'" > Interior View </button>' : ''
                                            )+
                                            (
                                                aerial_drone_video?.file ?
                                               '<button class="link border-0 open-drone-view" data-src="'+aerial_drone_video?.file+'" > Ariel View </button>' : ''
                                            )+
                                        '</div>'+

                                    '<div class="property-card-footer">'+
                                            '<div class="d-flex justify-content-between align-items-center">'+
                                            '<div class="buillding-agency-info me-4">'+
                                                '<div class="buillding-agency-logo">'+
                                                    '<img src="'+ data?.building_info?.created_by?.company_logo +'" alt="company logo">'+
                                                '</div>'+
                                                '<div class="buillding-agency-tel">'+
                                                    '<a href="tel:'+ data?.building_info?.created_by?.phone_number +'">'+
                                                            '<i class="bi bi-telephone"></i>'+
                                                        '<span>'+ data?.building_info?.created_by?.phone_number +'</span>'+
                                                    '</a>'+
                                                        '<span>Local Call rate</span>'+
                                                    '</div>'+
                                                '</div>'+

                                                '<a href="/schedule/create_schedule/?type=property&id='+data?.id+'" class="building-agency-action-btn me-4">'+
                                                    '<i class="bi bi-envelope pe-2"></i>'+
                                                    '<span class="_contact"> Contact </span>'+
                                                '</a>'+
                                            '</div>'+

                                            (
                                                !['agent', 'developer'].includes(user_type) ?
                                                '<div class="d-flex justify-content-between align-items-center gap-2">'+
                                                    '<button class="building-agency-action-btn me-2 add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'">'+
                                                    '<i class="bi bi-heart-fill pe-2"></i>'+
                                                    '<i class="bi bi-heart pe-2"></i>'+
                                                        '<span> Favorite </span>'+
                                                    '</button>'+
        
                                                    '<button class="building-agency-action-btn add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'">'+
                                                    '<i class="bi bi-arrow-left-right pe-2"></i>'+
                                                    '<i class="bi bi-check-circle-fill pe-2"></i>'+
                                                        '<span> Compare </span>'+
                                                    '</button>'+
                                                '</div>' : ''
                                            )+

                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
    }

    var prams_list = {
        page_size : 5,
        search : place || ''
    }

    var active_free_scrolling = false;
    var last_property_box; 
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
            url: '/property/api/list/',
            type: 'GET',
            data : search_param,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
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
                }else{
                    $('#search-result-list').append(search_dom);
                };
                
                installing_splide();

                active_free_scrolling = false;
                last_property_box = $('.property-single-box').last();
                $('.searching-loader').remove();
            },
            error: function (error) {
                active_free_scrolling = false;
                $('.searching-loader').remove();
                console.log("error")
            }
        });
    };

    searching("search");

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
        filter_close_dropdown();
        prams_list[$(this).attr('name')] = $(this).val() == 'null' ? '' : $(this).val();
        next_property = 1;
        searching("filter");

        var get_parent_label = $(this).parents('[label]')?.attr('label');
        var button_dom = $(this).parents('[label]')?.find('button');

        // max and minmum price dom >>>
        if(get_parent_label == 'price'){
            var min_val = formatNumber(prams_list?.min_price || 'Min')
            var max_val = formatNumber(prams_list?.max_price || 'Max')

            if(min_val == "Min" && max_val == "Max" ){
                button_dom.html('Any Price  <i class="bi bi-chevron-down"></i>')
                return;
            }else{
                min_val = '฿ ' + min_val;
                max_val = '฿ ' + max_val;
            };

            button_dom.html(min_val+' - '+max_val+' <i class="bi bi-chevron-down"></i>')
        };

        // max and minmum unit area dom >>>
        if(get_parent_label == 'unit_area'){
            var min_val = formatNumber(prams_list?.min_unit_area || 'Min')
            var max_val = formatNumber(prams_list?.max_unit_area || 'Max')

            if(min_val == "Min" && max_val == "Max" ){
                button_dom.html('Unit Area  <i class="bi bi-chevron-down"></i>')
                return;
            }else{
                min_val = min_val + ' SqM';
                max_val = max_val + ' SqM';
            };
            button_dom.html(min_val+' - '+max_val+' <i class="bi bi-chevron-down"></i>')
        };
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


    function installing_splide(){
        var elms = $('.search-result-box-img-splid');

        for ( var i = 0; i < elms.length; i++ ) {
            new Splide( elms[ i ], {
                gap: 5,
                perPage: 2,
                pagination : false,
                breakpoints: {
                    768: {
                        perPage: 1,
                    },
                }
            }).mount();
        };
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





    function get_popular_properties_list(){
        $.ajax({
            url: '/property/api/list/popular/',
            type: 'GET',
            data : {
                page_size : 5,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var gatheing_dom = '';
                if(data?.results.length === 0){
                    $('[sugested-type="popular-properties"]').remove();
                    return;
                }

                $('[sugested-type="popular-properties"] .skeleton-box').remove();
                for (let i = 0; i < data?.results.length; i++) {
                    var data_result = data?.results[i];
                    gatheing_dom += '<li> <a href="/property/details/'+data_result?.id+'/"> '+
                                        data_result?.number_of_bathroom +
                                        ' bedroom houses for sale in '+
                                        data_result?.building_address +
                                    '</li>';
                };
                $('[sugested-type="popular-properties"]').append(gatheing_dom);
            },
            error : function () {
                $('[sugested-type="popular-properties"]').remove();
            }
        });
    };

    function get_discount_properties_list(){
        $.ajax({
            url: '/property/api/list/discount/',
            type: 'GET',
            data : {
                page_size : 5,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var gatheing_dom = '';
                if(data?.results.length == 0){
                    $('[sugested-type="discount-properties"]').remove();
                };

                $('[sugested-type="discount-properties"] .skeleton-box').remove();
                for (let i = 0; i < data?.results.length; i++) {
                    var data_result = data?.results[i];
                    gatheing_dom += '<li> <a href="/property/details/'+data_result?.id+'/"> '+
                                        data_result?.number_of_bathroom +
                                        ' bedroom houses for sale in '+
                                        data_result?.building_address +
                                    '</li>';
                };
                $('[sugested-type="discount-properties"]').append(gatheing_dom);
            },
            error : function () {
                $('[sugested-type="discount-properties"]').remove();
            }
        });
    };


    function get_newly_properties_list(){
        $.ajax({
            url: '/property/api/list/newly-created/',
            type: 'GET',
            data : {
                page_size : 5,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var gatheing_dom = '';
                if(data?.results.length == 0){
                    $('[sugested-type="new-properties"]').remove();
                }
                $('[sugested-type="new-properties"] .skeleton-box').remove();
                for (let i = 0; i < data?.results.length; i++) {
                    var data_result = data?.results[i];
                    gatheing_dom += '<li> <a href="/property/details/'+data_result?.id+'/"> '+
                                        data_result?.number_of_bathroom +
                                        ' bedroom houses for sale in '+
                                        data_result?.building_address +
                                    '</li>';
                };
                $('[sugested-type="new-properties"]').append(gatheing_dom);
            },
            error : function () {
                $('[sugested-type="new-properties"]').remove();
            }
        });
    };


    function get_popular_building_list(){
        $.ajax({
            url: '/building/api/list/popular/',
            type: 'GET',
            data : {
                page_size : 5,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var gatheing_dom = '';
                if(data?.results.length == 0){
                    $('[sugested-type="popular-buildings"]').remove();
                }
                $('[sugested-type="popular-buildings"] .skeleton-box').remove();
                for (let i = 0; i < data?.results.length; i++) {
                    var data_result = data?.results[i];
                    gatheing_dom += '<li> <a href="/building/details/'+data_result?.id+'/"> '+
                                        data_result?.total_units_for_sale +
                                        ' units for sale at this building in '+
                                        data_result?.address +
                                    '</li>';
                };
                $('[sugested-type="popular-buildings"]').append(gatheing_dom);
            },
            error : function () {
                $('[sugested-type="popular-buildings"]').remove();
            }
        });
    };


    if(window.innerWidth >= 991){
        get_popular_properties_list()
        get_discount_properties_list()
        get_newly_properties_list()
        get_popular_building_list()
    };



});