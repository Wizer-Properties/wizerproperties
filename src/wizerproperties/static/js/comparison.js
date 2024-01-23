$(document).ready(function(){
    var comparison_splide = new Splide( '.comparison-slider-area' , {
        perPage: 4,
        gap : '15px',
        pagination : false,
        breakpoints: {
            1400: {
                perPage: 3
            },
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

                    '</div>'+
                '</div>'
    };

    function comparison_tmp(data){
        return  '<div class="splide__slide comparison-slider-box">'+
                    '<button class="remove-from-comparison" index="'+data?.property_info?.id+'" >'+
                        '<i class="bi bi-x-lg"></i>'+
                    '</button>'+
                    '<div class="comparison-img-icon-box">'+
                        '<img src="'+data?.property_info?.default_image+'" alt="property img">'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li>฿ '+ formatBalance(data?.property_info?.price || 0) +' </li>'+
                        '<li>฿ '+ formatBalance(data?.property_info?.price_per_sqm || 0) +' </li>'+
                        '<li> <a href="/building/details/'+data?.property_info?.building_info?.id+'/">'+data?.property_info?.building_info?.title+'</a> </li>'+
                        '<li> '+data?.property_info?.building_info?.address+' </li>'+
                        '<li> <a href="/property/details/'+data?.property_info?.id+'/">'+data?.property_info?.unit_id+'</a> </li>'+
                        '<li> '+data?.property_info?.building_info?.construction_year+' </li>'+
                        '<li> <button class="link border-0 open-3D-model"> 3D View </button> </li>'+
                        '<li> <button class="link border-0 open-drone-view"> Open </button> </li>'+
                        '<li> '+data?.property_info?.number_of_bedroom+' </li>'+
                        '<li> '+data?.property_info?.number_of_bathroom+' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.have_bathtub) +' </li>'+
                        '<li> '+data?.property_info?.number_of_balcony+' </li>'+
                        '<li> '+data?.property_info?.number_of_car_parking+' </li>'+
                        '<li> '+data?.property_info?.unit_area+' </li>'+
                        '<li> '+data?.property_info?.floor_number+' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.have_duplex) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.have_vacant) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.have_tenant_occupied) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.have_owner_occupied) +' </li>'+

                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_river_view) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_sky_lounge) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_guard_house) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_sauna) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_grocery) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_fitness_area) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_freehold) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_leasehold) +' </li>'+
                        '<li> '+ data?.property_info?.building_info?.quota +' </li>'+
                        '<li> '+ data?.property_info?.building_info?.furnishing +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_access_to_BTS_or_MRT) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_access_to_ARL) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_pets_allowed) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_unblocked_view) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_city_view) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_sea_view) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_mountain_view) +' </li>'+



                        '<li> <a href="/property/details/'+data?.property_info?.id+'/" class="link">Details</a> </li>'+
                    '</div>'+
                '</div>'
    };


    var page_size = 4;
    if(window.innerWidth <= 1400)  page_size = 3;
    if(window.innerWidth <= 1040)  page_size = 2;
    if(window.innerWidth <= 860)  page_size = 1;
    var next_page;
    var max_forward_move = 0

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
                    comparison_splide.add(comparison_tmp(cmp_result[i]))
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


    $(document).on('click', '.open-3D-model', function(){
        var _iframe = '<iframe width="100%" height="100%" src="https://my.matterport.com/show/?m=tHeZn1V85YQ" frameborder="0" allowfullscreen=""></iframe>'
        $('#_3d_view_dialog ._3d_model_display').html(_iframe);
        $('#_3d_view_dialog').modal("show");
    });

    $(document).on('click', '.open-drone-view', function(){
        var _video = '<source src="/static/media/demo_img/3D_House.mp4" type="video/mp4" />';
        $('#_3d_drone_view ._3d_model_display video').append(_video);
        $('#_3d_drone_view').modal("show");
    });

    $(document).on('click', '.close_3d_view_dialog', function(){
        $('#_3d_view_dialog').modal("hide");
        $('#_3d_view_dialog ._3d_model_display').html('');
    });

    $(document).on('click', '.close_3d_drone_view', function(){
        $('#_3d_drone_view').modal("hide");

        $(this).parents('#_3d_drone_view').find('video')[0].pause()
        $(this).parents('#_3d_drone_view').find('video').html(
            '<p class="vjs-no-js">'+
                'To view this video please enable JavaScript, and consider upgrading to a web browser that'+
            '</p>'
        );
    });


});