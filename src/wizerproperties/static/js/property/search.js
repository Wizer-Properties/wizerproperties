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



    var countdownInterval = null;
    function countdown() {
        var c_list = $('[date-count]');        
        
        function updateCountdown(targetDate, index) {
            var [year, month, day] = targetDate.split('-').map(Number);
            var target = new Date(year, month - 1, day);
            var now = new Date();
            var difference = target - now;
            
            if (difference <= 0) {
                c_list[index].innerHTML = '00 : 00'
            } else {
                var days = Math.floor(difference / (1000 * 60 * 60 * 24));
                var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((difference % (1000 * 60)) / 1000);
                if(seconds < 10) seconds = '0'+seconds;
                c_list[index].innerHTML = (days && '<count>'+days+'</count> : ')+
                                            '<count>'+hours+'</count> : '+
                                            '<count>'+minutes+'</count> : '+
                                            '<count>'+seconds+'</count>';
            }
        };

        for (let i = 0; i < c_list.length; i++) {
            var targetDate = c_list[i].getAttribute('date-count')
            updateCountdown(targetDate, i);
        };
    };
    

    function property_list_tmp(data, link){
        var dateString = data?.created_at;
        var formattedDate = new Date(dateString).toLocaleDateString('en-GB');   // Output formattedDate, it should be "09/03/2024"

        if( ['agent', 'developer'].includes(user_type) ){
            $('.add-to-compare').remove();
            $('.add-to-favorite').remove();
        };

        var is_fav_effect = localStorage.getItem('favorite-effect');


        // property-type value seted newly-created, popular in css

        return  '<div class="col-12 mb-4 property-single-box" property-type="'+data?.tag+'" effect="'+is_fav_effect+'">'+
                    '<div class="search-result-box-wrapper">'+
                        '<div class="row m-0">'+

                            '<div class="col-lg-5 col-xl-4 p-0">'+
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
                                        '<div class="search-list-add-btns">'+
                                            '<button class="building-agency-action-btn add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'">'+
                                                '<i class="bi bi-arrow-left-right pe-2"></i>'+
                                                '<i class="bi bi-check-circle-fill pe-2"></i>'+
                                                    '<span> Add<added>ed</added> to Compare </span>'+
                                            '</button>'+

                                            '<button class="building-agency-action-btn add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'">'+
                                                '<i class="bi bi-heart-fill"></i>'+
                                                '<i class="bi bi-heart"></i>'+
                                            '</button>'+
                                        '</div>' : ''
                                    )+
                                    property_multiple_images(data?.images, data?.id) +
                                '</div>'+
                            '</div>'+

                            '<div class="col-lg-7 col-xl-8 p-0">'+
                                '<div class="search-result-box">'+
                                    '<div class="search-result-content">'+
                                        '<a href="/property/details/'+data?.id+'/" class="d-block w-100">'+
                                            '<div class="search-box-title">'+
                                                '<span> Only with us </span>'+
                                                '<line></line>'+
                                                ( data?.discount_period ? 
                                                    '<div date-count="'+data?.discount_period+'"></div>' : '') +
                                            '</div>'+
                                            '<div class="search-box-price">'+
                                                '฿ '+ 
                                                formatBalance(Math.floor(data?.price) || 0)+
                                            '</div>'+
                                            '<h1> '+data?.title+' </h1>'+                                       
                                            
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

                                            '<p class="details"> '+ data?.description +'</p>'+

                                            '<div class="property-faciluties-list mt-3">'+
                                                property_facility_tmp(data)+
                                            '</div>'+
                                        '</a>'+

                                        '<div class="property-card-modal-btns">'+
                                            ( 
                                                ![null, ''].includes(data?.interior_view) ?
                                            '<button class="link border-0 open-3D-model" data-src="'+data?.interior_view+'" > Interior View </button>' : ''
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
                                            '<p class="agent-company-name">'+ data?.developer_company_name +'</p>'+
                                            '<p class="agent-company-name"> Added: '+ formattedDate +' </p>'+
                                        '</div>'+
                                        '<div class="agency-contact-info">'+
                                            '<a href="tel:'+ data?.developer_phone_number +'" class="dev-phn-number">'+
                                                '<span>'+ data?.developer_phone_number +'</span>'+
                                            '</a>'+
                                            '<a href="/schedule/create_schedule/?type=property&id='+data?.id+'" class="dev-to-contact">'+
                                                '<i class="bi bi-envelope"></i>'+
                                                '<span class="_contact"> Contact </span>'+
                                            '</a>'+
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
        search : place || '',
        default_images_number : (window.innerWidth <= 768 ? 1 : 2),
        platform :  (window.innerWidth >= 768 ? 'web' : '') 
    }

    var active_free_scrolling = false;
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
                    pop_dispatch() // this is call from main.js file fow hide pop up
                }else{
                    $('#search-result-list').append(search_dom);
                };

                if(countdownInterval){
                    clearInterval(countdownInterval)
                };

                countdown(); // offer duration time
                countdownInterval = setInterval(countdown, 1000);
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
        console.log(typeof search_param.ordering)
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

            $('[label-value="price"]').html(min_val + ' - ' + max_val);

            if(min_val == 'Min' && max_val == 'Max'){
                $('[label-value="price"]').html("Price");
            }
        };

        // max and minmum radius dom >>>
        if(get_parent_label == 'radius'){
            $('[label-value="radius"]').html( prams_list.nearby && prams_list.nearby +' Km'  || "Radius")
        };

        // max and minmum bedroom dom >>>
        if(get_parent_label == 'beds'){
            var min_beds = prams_list.min_number_of_bedroom || 'Min'
            var max_beds = prams_list.max_number_of_bedroom || 'Max'
            $('[label-value="beds"]').html(min_beds +'-'+max_beds )

            if(min_beds == 'Min' && max_beds == 'Max'){
                $('[label-value="price"]').html("Bedrooms");
            }
        };


        // propety types dom >>>
        if(get_parent_label == 'property-type'){
            $('[label-value="property-type"]').html( prams_list.building__type || "Property type")
        };
    });
    


    $(document).on('click', '.filter-dropdown-buttons button', function(){
        var get_val =  $(this).val() == 'null' ? '' :  $(this).val();
        filter_close_dropdown();

        var render_btn_dom = get_val == '' ? '' : ' ('+get_val+') ';
        if(prams_list[$(this).attr('name')] == get_val){
            render_btn_dom = ''
        };
        var label_name = $(this).html();

        $(this).parents('.filter-categories-dropdown').find('.filter-dropdown-btn')
        .html( '<div class="d-flex flex-row gap-3">'+ label_name + ' <i class="bi bi-chevron-down"></i> </div>')

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

            $('[label-value="price"]').html('Price');
            $('[label-value="radius"]').html("Radius");
            $('[label-value="beds"]').html("Bedrooms");
            $('[label-value="property-type"]').html("Property type");

            $('.filter-dropdown-buttons button').attr('active', false);
            $('.filter-dropdown-buttons [value="null"]').attr('active', true);
            $('.filter-dropdown-mtl-buttons button').attr('active', false);
            $('select').val('null')
            $('[dual-select] option').prop("disabled", false);
        }

        $('body').attr('filter-modal-open', 'false')
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




    /*

    function get_popular_properties_list(){
        $.ajax({
            url: '/property/api/list/popular/',
            type: 'GET',
            data : {
                page_size : 5,
                towards : 'search'
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
                                        data_result?.number_of_bedroom +
                                        ' bedroom '+ data_result?.type +' for sale in '+
                                        data_result?.address +
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
                towards : 'search'
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
                                        data_result?.number_of_bedroom +
                                        ' bedroom '+ data_result?.type +' for sale in '+
                                        data_result?.address +
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
                towards : 'search'
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
                                        data_result?.number_of_bedroom +
                                        ' bedroom '+ data_result?.type +' for sale in '+
                                        data_result?.address +
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
                towards : 'search'
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

    */

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


    $("#price-slider").slider({
        range: true, // Enable range
        min: 0,
        max: 100,
        step: 1,
        values: [1, 100], // Initial range values
        stop: function(event, ui) {
            console.log(ui.values[0] + " - " + ui.values[1])
        }
    });


    $(document).on('click', '.add-to-favorite', function(){
        if(!user_type) return;
        localStorage.setItem("favorite-effect", true);
        $('.property-single-box').attr('effect', true)
    })

    $(document).on('click', '.add-to-compare', function(){
        if(!user_type) return;
        localStorage.setItem("favorite-effect", true);
        $('.property-single-box').attr('effect', true)
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

                for (var i = 0; i < sadf.length; i++) {
                    $('.price-rage-chart').append('<li style="height: '+sadf[i].heightPercentage+'%;"></li>')
                }
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


    $(document).on('change', '[dual-select] select', function() {
        var this_val = $(this).val();
        var this_status = $(this).attr('select-status')
        var shib_options = $(this).siblings('select').find('option');
               
        shib_options.prop("disabled", this_status == 'max');
    
        for (let i = 0; i < shib_options.length; i++) {
            if(this_status == 'min'){
                shib_options[i].disabled = true;
                if(shib_options[i].getAttribute('value') == this_val) break;
            };

            if(this_status == 'max'){
                if(shib_options[i].getAttribute('value') == this_val) break;
                shib_options[i].disabled = false;
            };
        };

        // how to apply (do not remove)
        /*
        parent attr is "dual-select"
        child attr "select-status" value (min / max)
        and make sure the option value not be repeated
        
        <div dual-select>
            <select select-status="min">
                <option value="any_value"> any_value</option>
                ... more
            </select>
            
            <select select-status="max">
                <option value="any_value">  any_value</option>
                ... more
            </select>
        </div>
        */ 
    });

    
    


});