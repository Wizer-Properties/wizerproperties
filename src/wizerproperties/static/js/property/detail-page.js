$(document).ready(function(){
    function iframe_void(data){
        if(data){
            return '<iframe width="100%" height="100%" src="'+data+'" frameborder="0" allowfullscreen=""></iframe>'
        }else{
            return '<span class="no-video-data"> No 3D view ! </span>'
        }
    };

    function append_data(data_list){
        var gallery_dom = '';
        
        for (let i = 0; i < data_list?.length; i++) {
            gallery_dom += '<div class="details-gallery-img-box" type="'+data_list[i]?.type+'" index='+(i+1)+' >'+
                                '<img src='+data_list[i]?.file+' alt="bg">'+
                            '</div>'
            if(i == 4) break;
        };

        return gallery_dom;
    };


    function get_asset_details(){
        $.ajax({
            url: ASSET_API_URL,
            type: 'GET',
            data : {
                default_images_number : 5,
                reviewed_by : USER_ID
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                $('[label-name="media-files-image"] .details-gallery').html(append_data(data?.default_images));
                
                // property info
                $('.add-to-compare').attr('added', data?.is_compared);
                $('.add-to-favorite').attr('added', data?.is_favorited);
                $('.add-to-compare').attr('index', data?.id);
                $('.add-to-favorite').attr('index', data?.id);

                if( ['agent', 'developer'].includes(user_type)){
                    $('.add-to-compare').remove();
                    $('.add-to-favorite').remove();
                };

                $('[label-name="title"]').html(data?.title)
                $('[label-name="unit_id"]').html(data?.unit_id)
                $('[label-name="price"]').html('฿ '+ formatBalance(Math.floor(data?.price) || 0))
                $('[label-name="number_of_bedroom"]').html(data?.number_of_bedroom)
                $('[label-name="number_of_bathroom"]').html(data?.number_of_bathroom)
                $('[label-name="unit_area"]').html(data?.unit_area + ' SqM')
                $('[label-name="floor_number"]').html(data?.floor_number)
                $('[label-name="description"]').html(data?.description)
                $('[label-name="price_per_sqm"]').html('฿ '+ data?.price_per_sqm)
                $('[label-name="address"]').html(data?.address)
                $('[label-name="construction_year"]').html(data?.construction_year)
                $('[label-name="interior-view"] .details-gallery-3D-view').html( iframe_void(data?.interior_view))
                $('[label-name="facilities-view"] .details-gallery-3D-view').html( iframe_void(data?.facility_view))
                $('[label-name="location-video"] .details-gallery-3D-view').html( iframe_void(data?.location_view))

                $('.review-writing-area').html(review_tmp(data?.reviews))
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    function review_tmp(data){
        return  '<div class="show-rating">'+
                    '<span> 5 out of '+(data?.average_rating || 0)+' </span>'+
                    '<span label-name="rating">'+
                        rating_generator(data?.average_rating || 0)+
                    '</span>'+
                    '<p>Based on <b>'+data?.total_rating+' Review</b></p>'+
                '</div>'+
                (
                    (!data?.has_reviewed && user_type == 'prospect') ?
                    ('<div class="review-submit-area">'+
                        '<div class="give-rating">'+
                            '<i index="1" class="bi bi-star"></i>'+
                            '<i index="2" class="bi bi-star"></i>'+
                            '<i index="3" class="bi bi-star"></i>'+
                            '<i index="4" class="bi bi-star"></i>'+
                            '<i index="5" class="bi bi-star"></i>'+
                        '</div>'+
                        '<textarea placeholder="Type here ..." class="give-review" rows="7"></textarea>'+
                        '<div class="d-flex justify-content-center">'+
                            '<button class="link review-submit-btn"> Submit </button>'+
                        '</div>'+
                        '<div class="review-warrning-text"></div>'+
                    '</div>') : ''
                )
    };


    get_asset_details();

    function facilities_info_tmp(label, icon){
        return '<div class="col-6 col-md-6 col-lg-4 mb-3">'+
                    '<div class="facilities-box">'+
                        '<div class="facilities-box-icon">'+
                            icon +
                        '</div>'+
                        '<span class="facilities-box-label">'+label+'</span>'+
                    '</div>'+
                '</div>'
    };



    var got_media_file_type = ['image', 'interior-view'];
    var got_media_file_data = [];


    function gallery_expand_tmp(img){
        return  '<div class="splide__slide">'+
                    '<div class="img-gallery-dialog-img">'+
                        '<img src="'+img+'" alt="bg">'+
                    '</div>'+
                '</div>'
    }


    function gallery_expand_loader(position){
        return  '<div class="splide__slide '+position+'">'+
                    '<div class="img-gallery-dialog-loader">'+
                        '<img src="/static/media/loader.svg" alt="loader">'+
                    '</div>'+
                '</div>'
    }


    function get_gallery_img(type_name , page_size){
        if(got_media_file_type.includes(type_name)) return;

        $.ajax({
            url: GELLERY_API_URL,
            type: 'GET',
            data : {
                media_type : type_name,
                page_size : page_size || 5
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                got_media_file_type.push(type_name);
                got_media_file_data.push(data?.results);

                if(type_name == 'image'){
                    $('[label-name="media-files-image"] .details-gallery')
                    .html(append_data(data?.results));
                }else if(type_name == 'unit_floor_plan'){
                    $('[label-name="media-files-unit-floor-plan"] .details-gallery')
                    .html(append_data(data?.results));
                }else if(type_name == 'master_plan'){
                    $('[label-name="media-files-master-plan"] .details-gallery')
                    .html(append_data(data?.results));
                }else if(type_name == 'video'){
                    var video_file = data?.results[0].file;
                    if(video_file.includes('.webm')){
                        $('[label-name="media-files-video"] video')
                        .append('<source src='+data?.results[0]?.file+' type="video/webm" />')
                    }else{
                        $('[label-name="media-files-video"] video')
                        .append('<source src='+data?.results[0]?.file+' type="video/mp4" />')
                    }
                }else if(type_name == 'aerial_drone_video'){
                    if(data?.results[0]?.file.includes('.webm')){
                        $('[label-name="areal-view"] video')
                        .append('<source src='+data?.results[0]?.file+' type="video/webm" />')
                    }else if(data?.results[0]?.file.includes('.mp4')){
                        $('[label-name="areal-view"] video')
                        .append('<source src='+data?.results[0]?.file+' type="video/mp4" />')
                    }
                }
            },
            error: function (error) {
                console.log("error")
            }
        });
    };


    var expanded_slider = new Splide( '.img-gallery-dialog-slider', {
                            pagination: false
                        }).mount();

    var expand_slider_next = undefined;
    var expand_slider_previous = undefined;
    var expanded_splide_type = ''
    var default_img = 5;
    if(window.innerWidth < 768) default_img = 1;


    function expand_gallery_img( page, call_type ){
        $.ajax({
            url: GELLERY_API_URL,
            type: 'GET',
            data : {
                media_type : expanded_splide_type,
                page_size : 1,
                page : page
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                if(expand_slider_next < data?.next || data?.next == null ){
                    expand_slider_next = data?.next;
                };
                
                if(expand_slider_previous > data?.previous){
                    expand_slider_previous = data?.previous;
                };

                if([undefined].includes(expand_slider_next)){
                    expand_slider_next = data?.next;
                }

                if( [undefined].includes(expand_slider_previous)){
                    expand_slider_previous = data?.previous;
                };

                if(call_type == 'next'){
                    expanded_slider.add(gallery_expand_tmp(data?.results[0]?.file));
                };
                
                expanded_slider.remove('.pre_splide');

                if(expand_slider_previous){
                    expanded_slider.add(gallery_expand_loader('pre_splide'), 0)
                }

                if(call_type == 'previous'){
                    var gl_positon = 0
                    if(data?.previous) gl_positon = 1;
                    expanded_slider.add(gallery_expand_tmp(data?.results[0]?.file), gl_positon);
                    if(gl_positon == 1) expanded_slider.go(1);
                };

                if(call_type == 'first_call'){
                    expanded_slider.add(gallery_expand_tmp(data?.results[0]?.file));
                    if(data?.previous) expanded_slider.go(2);
                };

                expanded_slider.remove('.next_splide')

                if(expand_slider_next){
                    expanded_slider.add(gallery_expand_loader('next_splide'))
                }
            },
            error: function (error) {
                console.log("error")
            }
        });
    };


    expanded_slider.on('moved', function (e) {
        if(e == 0 && expand_slider_previous){
            expand_gallery_img(expand_slider_previous, 'previous')
        };

        if(expand_slider_next && expanded_slider.length == e+1){
            expand_gallery_img(expand_slider_next, 'next')
        };
    });

    
    $('.gallery-btn button').click(function(){
        if(!$(this).attr('type')) return;
        get_gallery_img($(this).attr('type'));
    })
    
    
    var is_gallery_open = false;
    $(document).on('click', '.details-gallery-img-box', function(){
        is_gallery_open = !is_gallery_open;
        $('body').attr('img-gallery-open', is_gallery_open);
        var index_number = $(this).attr('index');
        expanded_splide_type = $(this).attr('type');
        expand_gallery_img(index_number, 'first_call')
    });


    $(document).on('click', '.dialog-dismiss', function(){
        is_gallery_open = false;
        $('body').attr('img-gallery-open', is_gallery_open);
        expand_slider_next = undefined;
        expand_slider_previous = undefined;
        expanded_slider.remove('.splide__slide')
        expanded_slider.add(gallery_expand_loader('pre_splide'))
    });



    // =============================================
    // =============================================
    // available unit
    // =============================================
    // =============================================

    var available_units_splide = new Splide( '.available-unitssplide-splide', {
        perPage: 4,
        gap : 10,
        pagination: false,
        // perMove: 1,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            740: {
                perPage: 2,
            },
            460: {
                perPage: 1,
            }
        }
    }).mount();


    function available_units_tmp(data){
        return  '<div class="splide__slide">'+
                    '<div class="property-card">'+
                        '<div class="property-card-img">'+
                            '<img src="'+data?.default_image+'" alt="property image" loading="lazy">'+
                        '</div>'+

                        '<div class="p-2">'+
                            '<div class="property-price-info">'+
                                '<span>฿ '+ formatBalance(data?.price || 0)+'</span>'+
                                '<span>฿ '+ formatBalance(data?.price_per_sqm || 0) +'/sqm</span>'+
                            '</div>'+
                            '<div class="property-contains">'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/bed.svg" alt="bed-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+data?.number_of_bedroom+' </span>'+
                                    '<span class="property-label">Beds</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/bath.svg" alt="bath-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+data?.number_of_bathroom+' </span>'+
                                    '<span class="property-label">Baths</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/plan-size.svg" alt="plan-size-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+data?.unit_area+' </span>'+
                                    '<span class="property-label">Size</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+data?.floor_number+' </span>'+
                                    '<span class="property-label">Floor</span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="property-expand-btn">'+
                                '<a href="/property/details/'+data?.id+'/" class="nav-link" >More Details</a>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
    }


    function available_units_loader(){
        return  '<div class="splide__slide property-card-loader">'+
                    '<div class="property-card">'+
                        '<div class="property-card-img">'+
                            '<span class="skeleton-box" style="width: 100%; height: 180px;"></span>'+
                        '</div>'+
                        '<div class="p-2">'+
                            '<div class="property-price-info">'+
                                '<span class="skeleton-box" style="width: 100%; height: 27px;"></span>'+
                            '</div>'+                
                            '<div class="property-contains">'+
                                '<span class="skeleton-box" style="width: 100%; height: 60px;"></span>'+
                                '<span class="skeleton-box" style="width: 100%; height: 60px;"></span>'+
                                '<span class="skeleton-box" style="width: 100%; height: 60px;"></span>'+
                                '<span class="skeleton-box" style="width: 100%; height: 60px;"></span>'+
                            '</div>'+                
                            '<div class="property-expand-btn">'+
                                '<span class="skeleton-box" style="width: 100%; height: 27px;"></span>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
    };


    var next_page_number = 2;
    var got_available_units = false;
    var active_filter = 'all';
    var max_forward_move = 0

    function getting_available(parm){
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;
        
        $.ajax({
            url: AVAILABLE_API_URL,
            type: 'GET',
            data: { 
                page_size : page_size,
                page : parm?.page,
                bed : parm?.bed
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                next_page_number = data?.next
                
                for (let i = 0; i < data?.results.length; i++) {
                    available_units_splide.add(available_units_tmp(data?.results[i]))
                };
                
                available_units_splide.remove('.property-card-loader');
                
                if(data?.next){
                    for (let i = 0; i < page_size; i++) {                        
                        available_units_splide.add(available_units_loader())
                    }
                };
            },
            error: function (error) {
                console.log("error")
            }
        })
    };


    $('.filter-available-units span').click(function(){
        var filter_value = $(this).attr('label');
        if(active_filter == filter_value) return;
        active_filter = filter_value;
        $('.filter-available-units li').removeClass('active');
        $(this).parent().addClass('active');

        available_units_splide.remove('.available-unitssplide-splide .splide__slide');
        available_units_splide.add(available_units_loader())
        max_forward_move = 0;

        getting_available({
            bed : active_filter == 'all' ? null : active_filter
        });
    });


    available_units_splide.on( 'moved', (e) => {
        if(max_forward_move >= e) return;
        max_forward_move = e;
        if(!next_page_number) return;
        
        getting_available({
            page : next_page_number,
            bed : active_filter == 'all' ? null : active_filter
        })
    });


    new Waypoint({
        element: document.querySelector('.available-unitssplide-splide'),
        handler: function() {
            if(got_available_units) return;

            getting_available();
            got_available_units = true;
        },
        offset: '140%'
    })


    var rating_num = 0;
    var rating_next = 1;

    function rating_generator(rated){
        var results = '';

        for (let i = 0; i < rated; i++) {
            rating_num = i + 1;
            results += '<i index="'+rating_num+'" class="bi bi-star-fill"></i>';
        };

        for (let i = 0; i < (5-rated); i++) {
            var index_num = rating_num + i + 1 ;
            results += '<i index="'+index_num+'" class="bi bi-star"></i>';
        };
        return results;
    };
    

    $(document).on('mouseenter mouseleave touchstart', '.give-rating [index]', function(){
        var rateing_index = parseInt($(this).attr('index'));
        $('.give-rating').html(rating_generator(rateing_index))
    });






    var sending_review = false;
    $(document).on('click', '.review-submit-btn', function(){
        if(sending_review) return;
        $('.review-warrning-text').html('');
        var review_text = $('.give-review').val();
        var _this = $(this);
        var get_html = $(this).html();

        if(rating_num == 0){
            $('.review-warrning-text').append('<p> Give rating </p>');
            return;
        };

        if(review_text.trim() == ''){
            $('.review-warrning-text').append('<p> Review text is empty </p>');
            return;
        };

        sending_review = true;

        $.ajax({
            url: '/building/api/review/create/',
            type: 'POST',
            data: { 
                building : RELATED_BUILDING_ID,
                review_text : review_text,
                rating : rating_num
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend : function (){
                var loader_file = '<img src="/static/media/loader.svg" alt="loading...">';
                _this.html(loader_file);
            },
            success : function (data) {                
                $('.review-submit-area').remove();
                $('.view-the-reviews').prepend(show_review_tmp(data));
            },
            error: function (error) {
                console.log("error")
                _this.html(get_html)
            }
        });
    });


    function show_review_tmp(data){
        var created_at = new Date(data?.created_at)
        var created_date = dayjs(created_at).format('h:mm A, DD MMM (YYYY)');

        return  '<div class="view-the-reviews-box">'+
                    '<div class="d-flex align-items-center mb-1">'+
                        '<span class="given-reviews-rate">'+
                            rating_generator(data?.rating) +
                        '</span>'+
                        '<span class="given-reviews-person"> '+
                            '<b>'+data?.reviewer_details?.fullname+'</b>, '+
                            created_date +
                        '</span>'+
                    '</div>'+
                    '<p class="reviews-content">'+
                        data?.review_text +
                    '</p>'+
                '</div>'
    };


    // building details start =====================

    var is_building_details_get = false;

    function get_building_details(){
        is_building_details_get = true;
        $.ajax({
            url: '/property/api/details/'+PROPERTY_ID+'/building-info/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                $('[label-name="building_name"]')
                .html('<img src="'+data?.default_image+'" alt="building img" loading="lazy"/>');

                $('[label-name="project_name"]').html(data?.title)
                $('[label-name="project_total_area"]').html(data?.project_total_area)
                $('[label-name="building_type"]').html(data?.type)
                $('[label-name="construction_year"]').html(data?.construction_year)
                $('[label-name="total_units_for_sale"]').html(data?.total_units_for_sale)
                $('[label-name="total_floors"]').html(data?.total_floors);

                $('[label-name="building_details_button"]')
                .html('<a href="/building/details/'+data?.id+'/" class="link"> View Development </a>')
            },
        })
    };

    new Waypoint({
        element: document.querySelector('.building-details'),
        handler: function() {
            if(is_building_details_get) return;
            get_building_details()
        },
        offset: '110%'
    });

    // building details end =====================



    // facilities details end =====================

    var is_facilities_get = false;

    function facilities_void(data){
        var facilities_dom = '';
        var building_info = data?.building;
        var _icon = '<i class="bi bi-geo-alt"></i>'

        if(building_info?.have_fitness_area){
            facilities_dom += facilities_info_tmp('Fitness Area', _icon)
        };

        if(building_info?.have_guard_house){
            facilities_dom += facilities_info_tmp('Guard House', _icon)
        };

        if(building_info?.have_river_view){
            facilities_dom += facilities_info_tmp('River View', _icon)
        };

        if(building_info?.have_sauna){
            facilities_dom += facilities_info_tmp('Sauna', _icon)
        };

        if(building_info?.have_sky_lounge){
            facilities_dom += facilities_info_tmp('Sky Lounge', _icon)
        };

        if(building_info?.have_grocery){
            facilities_dom += facilities_info_tmp('Grocery', _icon)
        };

        if(
            building_info?.view &&
            building_info?.view !== ''
        ){
            facilities_dom += facilities_info_tmp(building_info?.view , _icon)
        };

        if(building_info?.have_freehold){
            facilities_dom += facilities_info_tmp('Freehold Land', _icon)
        };

        if(building_info?.have_infinity_pool){
            facilities_dom += facilities_info_tmp('Infinity Pool', _icon)
        };

        if(building_info?.have_leasehold){
            facilities_dom += facilities_info_tmp('Leasehold Land', _icon)
        };

        if(building_info?.have_pets_allowed){
            facilities_dom += facilities_info_tmp('Pet Friendly', _icon)
        };

        if(
            building_info?.distance_from_location_to_BTS_or_MRT &&
            building_info?.distance_from_location_to_BTS_or_MRT != ''
        ){
            var __text = "BTS or MRT "+ building_info?.distance_from_location_to_BTS_or_MRT + " KM";
            facilities_dom += facilities_info_tmp( __text, _icon)
        };

        if(
            building_info?.distance_from_location_to_ARL &&
            building_info?.distance_from_location_to_ARL != ''
        ){
            var __text = "ARL "+ building_info?.distance_from_location_to_BTS_or_MRT + " KM";
            facilities_dom += facilities_info_tmp(__text, _icon)
        };

        if(facilities_dom == ''){
            facilities_dom += '<p class="no-facilities"> No Facilities added </p>'
        }

        $('[label-name="facilities"]').html(facilities_dom)
    };

    function get_facilities_details(){
        is_facilities_get = true;
        $.ajax({
            url: '/property/api/details/'+PROPERTY_ID+'/available-facilities/',
            type: 'GET',
            // data : {
            //     default_images_number : 5
            // },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                facilities_void(data)
            },
        })
    };

    new Waypoint({
        element: document.querySelector('.facilities-area'),
        handler: function() {
            if(is_facilities_get) return;
            get_facilities_details()
        },
        offset: '110%'
    });

    // facilities details end =====================



    // developer details start =====================
    var is_developer_details_get = false;

    function get_developer_details(){
        is_developer_details_get = true;
        $.ajax({
            url: '/property/api/details/'+PROPERTY_ID+'/developer-info/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                $('[label-name="company_logo"]')
                .html('<img src="'+data?.company_logo+'" alt="building img" loading="lazy"/>')
                $('[label-name="company_name"').html(data?.company_name)
                $('[label-name="address"').html(data?.address)
                $('[label-name="phone_number"]').html('<a href="tel:'+data?.phone_number+'">'+data?.phone_number+'</a>')
                $('[label-name="email"]').html('<a href="mailto:'+data?.email+'">'+data?.email+'</a>')

                 // Phone number link
                 if(!['', null, undefined].includes(data?.phone_number)) {
                    $('[social-contact="contact_phone_number"').find('a').attr('href', "tel:" + data.phone_number)
                    $('[label-name="contact_phone_number"]').html("Contact")
                } else {
                    $('[social-contact="contact_phone_number"').remove()
                }

                // Email link
                if(!['', null, undefined].includes(data?.email)) {
                    $('[social-contact="contact_email"').find('a').attr('href', "mailto:" + data.email)
                    $('[label-name="contact_email"]').html("Email")
                } else {
                    $('[social-contact="contact_email"').remove()
                }
            },
        })
    };

    new Waypoint({
        element: document.querySelector('.developer-info'),
        handler: function() {
            if(is_developer_details_get) return;
            get_developer_details()
        },
        offset: '110%'
    });
    // developer details end =====================





    // get review list start =====================

    var is_review_list_get = false;

    function get_review_list(){
        is_review_list_get = true;
        $.ajax({
            url: '/building/api/review/list/',
            type: 'GET',
            data : {
                building_id : RELATED_BUILDING_ID,
                page_size : 5,
                page : rating_next
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                rating_next = data?.next;
                var review_dom = '';
                for (let i = 0; i < data?.results.length; i++) {
                    review_dom += show_review_tmp(data?.results[i])
                };

                $('.view-the-reviews').append(review_dom);
                if(!data?.next){
                    $('.load-more-reviews').remove();
                }else{
                    $('.load-more-reviews').html('<button class="link"> Load More </button>')
                };
            },
            error: function (error) {
                console.log("error")
            }
        })
    };


    new Waypoint({
        element: document.querySelector('#review'),
        handler: function() {
            if(is_review_list_get) return;
            get_review_list()
        },
        offset: '110%'
    });

    // get review list end =====================

});