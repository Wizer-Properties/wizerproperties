$(document).ready(function(){
    
    function countdown(endDate, id) {
        var flipper_dom = '<div'+ 
                            ' class="flipper _'+id+'" '+
                            ' data-datetime="'+endDate+' 23:59:59" '+
                            ' data-template="ddd|HH|ii|ss"'+
                            ' data-labels="Days|Hours|Minutes|Seconds" '+
                            ' data-reverse="true">'+
                          '</div>';
        return flipper_dom;
    };
    

    function property_list_tmp(data){
        return  '<div class="property-single-box">'+
                    '<div class="banner-action-button">'+
                        (
                            !['agent', 'developer'].includes(user_type) ?
                            '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'">'+
                                '<i class="bi bi-arrow-left-right"></i>'+
                                '<i class="bi bi-check-circle-fill"></i>'+
                                ' Compare'+
                            '</button>'+
    
                            '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'">'+
                                '<i class="bi bi-heart-fill"></i>'+
                                '<i class="bi bi-heart"></i>'+
                                ' Favorite'+
                            '</button>' : ''
                        ) +
                    '</div>'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            '<h1> '+data?.title+' </h1>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i>'+
                                    data?.building_address+
                                '</div>'+
                            '</div>'+
                            '<p class="sub-title">'+
                            data?.number_of_bedroom+
                            ' bedroom ' +
                            data?.building_type+
                            ' for sale at ' +
                            data?.title+
                            '</p>'+
                            '<p class="details"> '+ data?.description+' </p>'+

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
        return  '<div class="property-single-box discount_period">'+
                    '<div class="banner-action-button">'+
                        (
                            !['agent', 'developer'].includes(user_type) ?
                            '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'">'+
                                '<i class="bi bi-arrow-left-right"></i>'+
                                '<i class="bi bi-check-circle-fill"></i>'+
                                ' Compare'+
                            '</button>'+
    
                            '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'">'+
                                '<i class="bi bi-heart-fill"></i>'+
                                '<i class="bi bi-heart"></i>'+
                                ' Favorite'+
                            '</button>' : ''
                        ) +
                    '</div>'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="property-discount link">'+countdown(data?.discount_period, data?.id)+'</div>'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            '<h1> '+data?.title+' </h1>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i>'+
                                    data?.building_address+
                                '</div>'+
                            '</div>'+
                            '<p class="sub-title">'+
                            data?.number_of_bedroom+
                            ' bedroom ' +
                            data?.building_type+
                            ' for sale at ' +
                            data?.title+
                            '</p>'+
                            '<p class="details"> '+ data?.description+' </p>'+

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


    function building_list_tmp(data){
        return  '<div class="property-single-box">'+
                    '<a href="/building/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box">'+
                            '<h1> '+data?.title+' </h1>'+
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
                            '<p class="details"> '+ data?.description+' </p>'+

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

                    jQuery(function ($) {
                        $('.flipper'+'._'+data?.results[i]?.id).flipper('init');
                    });
                };

                discount_properties_slider.remove('.discount-properties-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        discount_properties_slider.add(loader_tmp())
                    };
                };

                discount_properties_next = data?.next
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
      
})
