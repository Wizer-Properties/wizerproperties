$(document).ready(function(){

    function property_list_tmp(data){
        var is_fav_effect = localStorage.getItem('favorite-effect');

        return  '<div class="property-single-box">'+
                    '<div class="compare-favorite-btn-area">'+
                        (
                            !['agent', 'developer'].includes(user_type) ?
                            '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                '<i class="bi bi-heart-fill"></i>'+
                                '<span> Favorite </span>'+
                            '</button>' +
                            '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                '<i class="bi bi-arrow-left-right"></i>'+
                                '<i class="bi bi-check2"></i>'+
                                '<span> Compare </span>'+
                            '</button>': ''
                        ) +
                    '</div>'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<h1 class="card-title">'+data?.building_title+'</h1>'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.building_title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            '<div class="price-tag">'+
                                '<span> ฿ '+formatBalance(Math.floor(data?.price) || 0)+ '</span>'+
                                (
                                    data?.building_status ?
                                    '<span class="building-tag">'+ data?.building_status + '</span>' : ''
                                )+
                            '</div>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i>'+
                                    data?.address+
                                '</div>'+
                            '</div>'+

                            '<div class="property-contains">'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/bed.svg" alt="bed-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.number_of_bedroom+' </span>'+
                                    '<span class="property-label">Beds</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/bath.svg" alt="bath-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.number_of_bathroom +' </span>'+
                                    '<span class="property-label">Baths</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/plan-size.svg" alt="plan-size-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.unit_area+ '</span>'+
                                    '<span class="property-label"> sqm </span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.floor_number+' </span>'+
                                    '<span class="property-label">Floor</span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</a>'+
                '</div>'
    };

    function discount_property_list_tmp(data){
        var is_fav_effect = localStorage.getItem('favorite-effect');

        return  '<div class="property-single-box discount_period">'+
                    '<div class="compare-favorite-btn-area">'+
                        (
                            !['agent', 'developer'].includes(user_type) ?
                            '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                '<i class="bi bi-heart-fill"></i>'+
                                '<span> Favorite </span>'+
                            '</button>' +
                            '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'" effect="'+is_fav_effect+'">'+
                                '<i class="bi bi-arrow-left-right"></i>'+
                                '<i class="bi bi-check2"></i>'+
                                '<span> Compare </span>'+
                            '</button>': ''
                        ) +
                    '</div>'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="discount-card-header">'+
                            '<h1 class="card-title">'+data?.building_title+'</h1>'+
                            ( data?.discount_period ? '<div class="exclusive-deals-time" date-count="'+data?.discount_period+'"></div>' : '')+
                        '</div>'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.building_title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            '<div class="price-tag">'+
                                '<span> ฿ '+formatBalance(Math.floor(data?.price) || 0)+ '</span>'+
                                (
                                    data?.building_status ?
                                    '<span class="building-tag">'+ data?.building_status + '</span>' : ''
                                )+
                            '</div>'+
                            // '<h1> '+data?.building_title+' </h1>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i>'+
                                    data?.address+
                                '</div>'+
                            '</div>'+

                            '<div class="property-contains">'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+bed_icon+'</div>'+ // bed_icon call from icons.js file
                                    '<span class="property-value"> '+ data?.number_of_bedroom+' </span>'+
                                    '<span class="property-label">Beds</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+bath_icon+'</div>'+ // bed_icon call from icons.js file
                                    '<span class="property-value"> '+ data?.number_of_bathroom +' </span>'+
                                    '<span class="property-label">Baths</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+plan_icon+'</div>'+ // bed_icon call from icons.js file
                                    '<span class="property-value"> '+ data?.unit_area+ '</span>'+
                                    '<span class="property-label"> sqm </span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+stairs_icon+'</div>'+ // bed_icon call from icons.js file
                                    '<span class="property-value"> '+ data?.floor_number+' </span>'+
                                    '<span class="property-label">Floor</span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</a>'+
                '</div>'
    };


    function building_list_tmp(data){
        return  '<div class="property-single-box">'+
                    '<a href="/building/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.building_title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            // '<h1> '+data?.building_title+' </h1>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i> '+
                                    data?.address+
                                '</div>'+
                            '</div>'+
                            '<p class="sub-title">'+
                            data?.total_units_for_sale +
                            ' units for sale at this building' +
                            '</p>'+
                            // '<p class="details"> '+ data?.description+' </p>'+

                            '<div class="property-contains">'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/building.svg" alt="building-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.type+' </span>'+
                                    '<span class="property-label">Building</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/unit.svg" alt="unit-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.total_units_for_sale +' </span>'+
                                    '<span class="property-label">Units</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/plan-size.svg" alt="plan-size-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.project_total_area+ '</span>'+
                                    '<span class="property-label"> Project Area </span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.total_floors+' </span>'+
                                    '<span class="property-label">Floor</span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+

                    '</a>'+
                '</div>'
    };


    
    function loader_tmp(){
        return  '<div class="splide__slide comparison-slider-box list_loader">'+
                    '<div class="comparison-img-icon-box">'+
                        '<span class="skeleton-box" style="width: 100%; height: 180px; border-radius: 10px;"></span>'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 70px;"></span> </li>'+
                    '</div>'+
                '</div>'
    };


    // ======================== new-properties-slider


    var new_properties_slider = new Splide( '.new-properties-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();


    var newly_properties_next;
    var calling_next_properties;

    function get_newly_properties_list(next_page){
        if(calling_next_properties) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/property/api/list/newly-created/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    new_properties_slider.add(loader_tmp())
                };

                calling_next_properties = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#new-properties').remove()
                    return
                }
                calling_next_properties = false;
                
                for (let i = 0; i < data?.results.length; i++) {
                    new_properties_slider.add(property_list_tmp(data?.results[i]))
                };

                new_properties_slider.remove('.new-properties-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        new_properties_slider.add(loader_tmp())
                    };
                };

                newly_properties_next = data?.next
            },
            error: function (error) {
                calling_next_properties = false;
            }
        });
    };

    get_newly_properties_list();

    new_properties_slider.on( 'moved', (e) => {
        if(newly_properties_next == null) return;
        get_newly_properties_list(newly_properties_next);
    });



    // ======================== popular-properties-slider



    var popular_properties_slider = new Splide( '.popular-properties-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();

    var popular_properties_next;
    var calling_popular_properties;

    function get_popular_properties_list(next_page){
        if(calling_popular_properties) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/property/api/list/popular/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    popular_properties_slider.add(loader_tmp())
                };

                calling_popular_properties = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#popular-properties').remove()
                    return
                }
                calling_popular_properties = false;
                
                for (let i = 0; i < data?.results.length; i++) {
                    popular_properties_slider.add(property_list_tmp(data?.results[i]))
                };

                popular_properties_slider.remove('.popular-properties-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        popular_properties_slider.add(loader_tmp())
                    };
                };

                popular_properties_next = data?.next
            },
            error: function (error) {
                calling_popular_properties = false;
            }
        });
    };

    get_popular_properties_list();

    popular_properties_slider.on( 'moved', (e) => {
        if(popular_properties_next == null) return;
        get_popular_properties_list(popular_properties_next);
    });




    // ======================== popular-buildings-slider


    /*

    var popular_building_slider = new Splide( '.popular-buildings-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();

    var popular_building_next;
    var calling_popular_building;

    function get_popular_building_list(next_page){
        if(calling_popular_building) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/building/api/list/popular/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    popular_building_slider.add(loader_tmp())
                };

                calling_popular_building = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#popular-buildings').remove()
                    return
                }
                calling_popular_building = false;
                
                for (let i = 0; i < data?.results.length; i++) {
                    popular_building_slider.add(building_list_tmp(data?.results[i]))
                };

                popular_building_slider.remove('.popular-buildings-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        popular_building_slider.add(loader_tmp())
                    };
                };

                popular_building_next = data?.next
            },
            error: function (error) {
                calling_popular_building = false;
            }
        });
    };

    get_popular_building_list();

    popular_building_slider.on( 'moved', (e) => {
        if(popular_building_next == null) return;
        get_popular_building_list(popular_building_next);
    });

    */



    // ======================== discount-properties-slider



    var discount_properties_slider = new Splide( '.discount-properties-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();

    var discount_properties_next;
    var calling_discount_properties;

    function get_discount_properties_list(next_page){
        if(calling_discount_properties) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/property/api/list/discount/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    discount_properties_slider.add(loader_tmp())
                };

                calling_discount_properties = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#discount-properties').remove()
                    return
                }
                calling_discount_properties = false;
                
                for (let i = 0; i < data?.results.length; i++) {
                    discount_properties_slider.add(discount_property_list_tmp(data?.results[i]))
                };

                discount_properties_slider.remove('.discount-properties-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        discount_properties_slider.add(loader_tmp())
                    };
                };

                discount_properties_next = data?.next;
                var timer = new Countdown({
                    template : "dd|hh|mm",
                    labels : "Days|Hours|Minutes"
                }) // for time countdown
                timer.start()
            },
            error: function (error) {
                calling_discount_properties = false;
            }
        });
    };

    get_discount_properties_list();

    discount_properties_slider.on( 'moved', (e) => {
        if(discount_properties_next == null) return;
        get_discount_properties_list(discount_properties_next);
    });


      

    // setInterval(() => {
    //     var property_discount_el = $('.property-discount');

    //     for (let i = 0; i < property_discount_el.length; i++) {
    //         property_discount_el[i].innerHTML = countdown(property_discount_el[i].getAttribute('discount-time'))
    //     }
        
    // }, 1000);


    // ======================== recommended-properties-slider

    var recommended_search_slider = new Splide( '.recommended-search-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();


    var recommended_properties_next;
    var calling_recommended_properties;

    function get_recommended_properties_list(next_page){
        if(calling_recommended_properties) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/property/api/list/suggested-properties/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    recommended_search_slider.add(loader_tmp())
                };

                calling_recommended_properties = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#recommended-search').remove()
                    return
                }
                calling_recommended_properties = false;
                
                for (let i = 0; i < data?.results.length; i++) {
                    recommended_search_slider.add(property_list_tmp(data?.results[i]))
                };

                recommended_search_slider.remove('.recommended-search-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        recommended_search_slider.add(loader_tmp())
                    };
                };

                recommended_properties_next = data?.next
            },
            error: function (error) {
                calling_recommended_properties = false;
            }
        });
    };

    get_recommended_properties_list();

    recommended_search_slider.on( 'moved', (e) => {
        if(recommended_properties_next == null) return;
        get_recommended_properties_list(recommended_properties_next);
    });

    // Start ======================== Hot Properties For Sale- Near You! (prospect's nearest properties)

    var hot_properties_slider = new Splide( '.hot-properties-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            780: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();


    var calling_hot_properties;

    function get_hot_properties_list(){
        if(calling_hot_properties) return;

        $.ajax({
            url: '/property/api/nearest/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                hot_properties_slider.add(loader_tmp())
                calling_hot_properties = true;
            },
            success: function (data) {
                if(data?.count == 0){
                    $('#hot-properties').remove()
                    return
                }
                calling_hot_properties = false;
                
                for (let i = 0; i < data?.length; i++) {
                    hot_properties_slider.add(property_list_tmp(data[i]))
                };

                hot_properties_slider.remove('.hot-properties-slider .list_loader');
            },
            error: function (error) {
                // console.log(error.responseJSON)
                calling_hot_properties = false;
                $('#hot-properties').remove();
            }
        });
    };

    get_hot_properties_list();
  
    // End ========================


    function reels_iframe_tmp(data){
        if(data?.social_media == 'youtube'){
            var parts = data.url.split('/');
            var videoId = parts[parts.length - 1];
            var embedUrl = `https://youtube.com/embed/${videoId}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == "titTok"){
            var parts = data.url.split('/video/');
            var embedUrl = `https://www.tiktok.com/embed/v2/${parts[1]}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == 'instagram'){
            var parts = data.url.split('/');
            return '<iframe height="520" src="https://www.instagram.com/p/'+parts[4]+'/embed/" frameborder="0"></iframe>';
        };

        return data?.url;
    };

    function reels_tmp (data){
        var company_data;
        if(data?.user?.agent){
            company_data = data?.user?.agent;
        }else{
            company_data = data?.user?.developer;
        };

        return( '<div class="reels-box-wrapper">'+
                    '<div class="reels-iframe-and-data">'+
                        reels_iframe_tmp(data)+
                    '</div>'+
                    '<div class="reels-developer-info mt-2">'+
                        '<div class="reels-title">'+ data?.property_title+'</div>'+
                        '<div class="reels-developer-logo">'+
                            '<div class="dev-logo">'+
                                '<img src="'+company_data?.company_logo+'" alt="logo">'+
                            '</div>'+
                            '<h1 class="m-0">'+company_data?.company_name+'</h1>'+
                        '</div>'+
        
                        '<div class="reels-visit-btn mt-3">'+
                            '<a href="/property/details/'+data?.property+'/"> Visit </a>'+
                        '</div>'+
                    '</div>'+
                '</div>'
        )
    }


    var reels_slider = new Splide( '.reels-slider', {
        perPage: 4,
        gap : 10,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            1080: {
                perPage: 2,
            },
            768: {
                perPage: 1,
            }
        }
    }).mount();


    var reels_next;
    var calling_reels;
    var category;
    var is_category_btn_call;
    var first_time_reel_api_call = true;

    function get_reels_list(next_page){
        if(calling_reels) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/advertise/api/reel/active/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page,
                category : category
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                if(is_category_btn_call){
                    reels_slider.remove('.reels-slider .reels-box-wrapper');
                };

                for (let i = 0; i < page_size; i++) {
                    reels_slider.add(loader_tmp())
                };

                calling_reels = true;
            },
            success: function (data) {
                calling_reels = false;

                if(
                    first_time_reel_api_call &&
                    data?.count == 0
                ){
                    $('#engaging-reels').remove();
                    return;
                };

                first_time_reel_api_call = false;
                
                if(data?.count == 0){
                    $('.no-reels').html('<p class="my-5 py-5 text-center"> No reels available </p>')
                }else{
                    $('.no-reels').html('')
                };
                
                for (let i = 0; i < data?.results.length; i++) {
                    reels_slider.add(reels_tmp(data?.results[i]))
                };
                reel_detail()

                reels_slider.remove('.reels-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        reels_slider.add(loader_tmp())
                    };
                };

                reels_next = data?.next;
                is_category_btn_call = false;
            },
            error: function (error) {
                calling_reels = false;
                is_category_btn_call = false;
            },
        });
    };

    get_reels_list();

    reels_slider.on( 'moved', (e) => {
        if(reels_next == null) return;
        get_reels_list(reels_next);
    });


    function reel_detail(){
        var all_reel_details = $('.reel-details');
        for (let i = 0; i < all_reel_details.length; i++) {
            if( all_reel_details[i].offsetHeight > 25){
                all_reel_details[i].parentNode.setAttribute("view-type", "less");
            }else{
                all_reel_details[i].parentNode?.querySelector('.reel-see-more-see-less')?.remove();
            };
        };
    };


    $(document).on('click', '.reels-filter-btns button', function(){
        is_category_btn_call = true;
        
        if($(this).hasClass('activate')){
            $('.reels-filter-btns button').removeClass('activate');
            category = null;
        }else{
            $('.reels-filter-btns button').removeClass('activate');
            $(this).addClass('activate');
            category = $(this).val();
        };
        
        get_reels_list()
    });
    


    $(document).on('click', '.reel-see-more-see-less', function(){
        var get_view_type = $(this).parents('p[view-type]').attr('view-type');
        if(get_view_type == 'less'){
            $(this).parents('p[view-type]').attr('view-type', 'more')
            $(this).text('See less')
        }else if(get_view_type == 'more'){
            $(this).parents('p[view-type]').attr('view-type', 'less')
            $(this).text('See more')
        };
    });



});
