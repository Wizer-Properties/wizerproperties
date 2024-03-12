$(document).ready(function(){
    var comparison_splide = new Splide( '.comparison-slider-area' , {
        perPage: 3,
        gap : '15px',
        pagination : false,
        breakpoints: {
            1040: {
                perPage: 2
            },
            860: {
                perPage: 1
            },
      }
    }).mount();

    function facilities_tmp(data){
        if(data){
            return '<span style="color: #4CAF50"> <i class="bi bi-check-circle-fill"></i> </span> Yes'
        }else{
            return '<span style="color: #DD3E3A"> <i class="bi bi-x-circle-fill"></i> </span> No'
        }
    }

    function loader_tmp(){
        return  '<div class="splide__slide comparison-slider-box comparison-loader">'+
                    '<div class="comparison-img-icon-box">'+
                        '<span class="skeleton-box" style="width: 100%; height: 180px; border-radius: 10px;"></span>'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 25px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 222px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 222px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 222px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 222px;"></span> </li>'+
                    '</div>'+
                '</div>'
    };

    function label_name(name = ''){
        return '<span class="comparison-label-name"> '+name+': &nbsp </span>'
    }

    function comparison_tmp(data, video_id){

        return  '<div class="splide__slide comparison-slider-box">'+
                    '<button class="remove-from-comparison" index="'+data?.property_info?.id+'" >'+
                        '<i class="bi bi-x-lg"></i>'+
                    '</button>'+
                    '<div class="comparison-img-icon-box">'+
                        '<img src="'+data?.property_info?.default_image+'" alt="property img">'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                    '<li> '+label_name('Project Name')+' <a href="/building/details/'+data?.property_info?.id+'/">'+data?.property_info?.title+'</a> </li>'+
                        '<li> '+label_name('Price')+' ฿ '+ formatBalance(data?.property_info?.price || 0) +' </li>'+
                        '<li> '+label_name('Price Per Sqm')+' ฿ '+ formatBalance(data?.property_info?.price_per_sqm || 0) +' </li>'+
                        // '<li> '+label_name('Built Up Area') + 'Built Up Area' +' </li>'+
                        '<li> '+label_name('Land Area') +data?.property_info?.unit_area+' </li>'+
                        '<li> '+label_name('Bedrooms') +data?.property_info?.number_of_bedroom+' </li>'+
                        '<li> '+label_name('Bathrooms') +data?.property_info?.number_of_bathroom+' </li>'+
                        '<li> '+label_name('Parking') +data?.property_info?.number_of_car_parking+' </li>'+
                        '<li> '+label_name('Freehold') + facilities_tmp(data?.property_info?.have_freehold) +' </li>'+
                        '<li> '+label_name('Leasehold') + facilities_tmp(data?.property_info?.have_leasehold) +' </li>'+
                        '<li> '+label_name('Completion Date') +data?.property_info?.construction_year+' </li>'+
                        '<li> '+label_name('Quota') + data?.property_info?.quota +' </li>'+
                        '<li> '+label_name('Access to BTS/MRT') + data?.property_info?.distance_from_location_to_BTS_or_MRT +' </li>'+
                        '<li> '+label_name('Access to ARL') + data?.property_info?.distance_from_location_to_ARL +' </li>'+
                        '<li> '+label_name('Furnished') + data?.property_info?.furnishing +' </li>'+
                        '<li> '+label_name('Tenant Occupied') + facilities_tmp(data?.property_info?.have_tenant_occupied) +' </li>'+
                        '<li> '+label_name('Owner Occupied') + facilities_tmp(data?.property_info?.have_owner_occupied) +' </li>'+
                        '<li> '+label_name('Duplex') + facilities_tmp(data?.property_info?.have_duplex) +' </li>'+
                        '<li> '+label_name('Pet Friendly') + facilities_tmp(data?.property_info?.have_pets_allowed) +' </li>'+
                        '<li> '+label_name('Balcony') + data?.property_info?.number_of_balcony +' </li>'+
                        '<li> '+label_name('Bathtubs') + facilities_tmp(data?.property_info?.have_bathtub) +' </li>'+
                        '<li> '+label_name('View') + data?.property_info?.view +' </li>'+
                        // '<li> '+label_name('Rooftop Pool') + 'Rooftop Pool' +' </li>'+
                        '<li> '+label_name('Infinity Pool') + facilities_tmp(data?.property_info?.have_infinity_pool) +' </li>'+
                        '<li> '+label_name('Gym') + facilities_tmp(data?.property_info?.have_fitness_area) +' </li>'+
                        '<li> '+label_name('Sky Lounge') + facilities_tmp(data?.property_info?.have_sky_lounge) +' </li>'+

                        '<li class="text-center"> <a href="/property/details/'+data?.property_info?.id+'/" class="link">Details</a> </li>'+

                        '<li style="height: 240px;"> '+
                            label_name('Interior View') +
                            (
                                data?.property_info?.interior_view ?
                                '<iframe width="100%" height="100%" src="'+data?.property_info?.interior_view+'" frameborder="0" allowfullscreen=""></iframe>' : 
                                '<span class="no-video-data"> No 3D view ! </span>'
                            ) +
                        '</li>' +

                        '<li style="height: 240px;"> '+
                            label_name('Facilities') +
                            (
                                data?.property_info?.facility_view ?
                                '<iframe width="100%" height="100%" src="'+data?.property_info?.facility_view+'" frameborder="0" allowfullscreen=""></iframe>' : 
                                '<span class="no-video-data"> No 3D view ! </span>'
                            ) +
                        '</li>' +

                        '<li style="height: 240px;"> '+
                            label_name('Location') +
                            (
                                data?.property_info?.location_view ?
                                '<iframe width="100%" height="100%" src="'+data?.property_info?.location_view+'" frameborder="0" allowfullscreen=""></iframe>' : 
                                '<span class="no-video-data"> No 3D view ! </span>'
                            ) +
                        '</li>' +

                        '<li style="height: 240px;">'+
                            label_name('Ariel View') +
                            (
                                data?.property_info?.ariel_view ?
                                '<video class="video-js comparison-videos" id="'+video_id+'" controls preload="auto" data-setup="{}">'+
                                    '<source src="'+data?.property_info?.ariel_view+'" type="video/mp4" />'+
                                    '<p class="vjs-no-js">'+
                                        'To view this video please enable JavaScript, and consider upgrading to a web browser that'+
                                    '</p>'+
                                '</video>' : 
                                '<span class="no-video-data"> No Ariel view ! </span>'
                            ) +
                        '</li>' +
                    '</div>'+
                '</div>'
    };


    var page_size = 3;
    if(window.innerWidth <= 1040)  page_size = 2;
    if(window.innerWidth <= 860)  page_size = 1;
    var next_page;
    var max_forward_move = 0;
    var comparison_video_id = 0;


    function get_comparison_list(){
        $.ajax({
            url: COMPARISON_API_URL,
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
                    comparison_splide.add(loader_tmp())
                };
            },
            success: function (data) {
                var cmp_result = data?.results;
                next_page = data?.next;

                for (let i = 0; i < cmp_result.length; i++) {
                    comparison_video_id++;
                    var video_id = 'comparison_videos_'+comparison_video_id;
                    comparison_splide.add(comparison_tmp(cmp_result[i], video_id))
                    videojs(video_id);
                }; 

                comparison_splide.remove('.comparison-loader');

                if(data?.next){
                    for (let i = 0; i < page_size; i++) {
                        comparison_splide.add(loader_tmp())
                    };
                };

                if(cmp_result.length == 0){
                    $('.comparison-slider-area').html('<p style="font-size: 20px;"><i class="bi bi-dropbox"></i> &nbsp;  No data available </p>')
                    $('.comparison-slider-area').css({
                        'display' : 'grid',
                        'place-items' : 'center'
                    })
                };

            },
            error: function (error) {
                $('.comparison-slider-area').html('<p style="font-size: 20px;"> <i class="bi bi-exclamation-diamond"></i>  &nbsp; Something is wrong </p>')
                $('.comparison-slider-area').css({
                    'display' : 'grid',
                    'place-items' : 'center'
                })
            }
        });
    };

    get_comparison_list();


    comparison_splide.on('moved', function (e){
        if( $('video').length > 0 ){
            for (let i = 0; i < $('video').length; i++) {
                $('video')[i]?.pause()
            };
        };

        if(max_forward_move >= e) return;
        max_forward_move = e;
        if(!next_page) return;
        get_comparison_list();
    })


    $(document).on('click', '.remove-from-comparison', function(){
        var get_id = $(this).attr('index')
        $.ajax({
            url: COMPARISON_REMOVE_API_URL,
            data : {
                property : get_id,
            },
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                comparison_splide.remove('.comparison-slider-box');
                next_page = undefined;
                max_forward_move = 0;
                get_comparison_list()
            },
            error: function (error) {
                console.log("error")
            }
        });
    });





});