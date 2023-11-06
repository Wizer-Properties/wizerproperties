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
                    '</div>'+
                '</div>'
    };

    function comparison_tmp(data){
        return  '<div class="splide__slide comparison-slider-box">'+
                    '<button class="remove-from-comparison" index="'+data?.id+'" >'+
                        '<i class="bi bi-x-lg"></i>'+
                    '</button>'+
                    '<div class="comparison-img-icon-box">'+
                        '<img src="'+data?.property_info?.default_image+'" alt="property img">'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li> '+data?.property_info?.title+' </li>'+
                        '<li>฿ '+data?.property_info?.price+' </li>'+
                        '<li> <a href="/building/details/'+data?.property_info?.building_info?.id+'/">'+data?.property_info?.building_info?.title+'</a> </li>'+
                        '<li> '+data?.property_info?.building_info?.address+' </li>'+
                        '<li> <a href="/property/details/'+data?.property_info?.id+'/">'+data?.property_info?.unit_id+'</a> </li>'+
                        '<li> '+data?.property_info?.building_info?.construction_year+' </li>'+
                        '<li> '+data?.property_info?.number_of_bedroom+' </li>'+
                        '<li> '+data?.property_info?.number_of_bathroom+' </li>'+
                        '<li> '+data?.property_info?.number_of_balcony+' </li>'+
                        '<li> '+data?.property_info?.number_of_car_parking+' </li>'+
                        '<li> '+data?.property_info?.unit_area+' </li>'+
                        '<li> '+data?.property_info?.floor_number+' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_lake_or_river_view) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_sky_lounge) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_guard_house) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_sauna) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_grocery) +' </li>'+
                        '<li> '+ facilities_tmp(data?.property_info?.building_info?.have_fitness_area) +' </li>'+
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
                console.log(data)
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
                }
            },
            error: function (error) {
                console.log("error")
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
            url: COMPARISON_REMOVE_API_URL+get_id+'/',
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
    })


});