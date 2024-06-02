$(document).ready(function(){


    function loader_tmp(){
        return '<div class="col-sm-6 col-lg-4 col-xl-3 mb-4 searching-loader">'+
                    '<div class="search-result-box-wrapper">'+
                        '<div class="search-result-box-img mb-2">'+
                            '<span class="skeleton-box" style="width: 100%; height: 200px;"></span>'+
                        '</div>'+
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
                '</div>'
    };
    
    

    function property_facility_tmp(data){
        console.log("=========== data", data)
        var facility_tmp = '';

        if(data?.have_freehold){
            facility_tmp += '<span>Freehold</span>'
        };

        if(data?.have_leasehold){
            facility_tmp += '<span>Leasehold</span>'
        };
        
        if(data?.construction_year){
            facility_tmp += '<span> Year Built '+data?.construction_year+'</span>'
        };

        if(data?.quota){
            facility_tmp += '<span> '+data?.quota+' Quota </span>'
        };

        if(data?.distance_from_location_to_BTS_or_MRT){
            facility_tmp += '<span> BTS Or MRT : '+data?.distance_from_location_to_BTS_or_MRT+'</span>'
        };

        if(data?.distance_from_location_to_ARL){
            facility_tmp += '<span> ART : '+data?.distance_from_location_to_ARL+'</span>'
        };

        if(data?.have_pets_allowed){
            facility_tmp += '<span> Pet Friendly </span>'
        };
        
        if(data?.view){
            facility_tmp += '<span>'+data?.view+'</span>'
        };

        if(data?.have_infinity_pool){
            facility_tmp += '<span>Infinity Pool</span>'
        };

        if(data?.have_fitness_area){
            facility_tmp += '<span>Gym</span>'
        };

        if(data?.have_sky_lounge){
            facility_tmp += '<span>Sky Lounge</span>'
        };

        return facility_tmp;
    };


    function property_list_tmp(value){
        var data = value?.property_info;

        return  '<div class="col-sm-6 col-lg-4 col-xl-3 mb-4 property-single-box">'+
                    '<div class="compare-favorite-btn-area">'+
                    '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+data?.id+'">'+
                        '<i class="bi bi-heart-fill"></i>'+
                        '<span> Favorite </span>'+
                    '</button>' +
                    '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+data?.id+'">'+
                        '<i class="bi bi-arrow-left-right"></i>'+
                        '<i class="bi bi-check2"></i>'+
                        '<span> Compare </span>'+
                    '</button>'+
                    '</div>'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="search-result-box-img">'+
                            '<img src="'+data?.default_image+'" alt="'+data?.title+'" loading="lazy">' +
                        '</div>'+
                        '<div class="search-result-box mt-2">'+
                            '<h1> '+data?.title+' </h1>'+
                            '<div class="location">'+
                                '<div class="icon">'+
                                    '<i class="bi bi-geo-alt"></i>'+
                                    data?.address+
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
                                    '<span class="property-label"> sqm</span>'+
                                '</div>'+
                                '<div class="property-short-info-box">'+
                                    '<div class="property-short-info-icon">'+
                                        '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                                    '</div>'+
                                    '<span class="property-value"> '+ data?.floor_number+' </span>'+
                                    '<span class="property-label">Floor</span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="property-faciluty">'+
                                property_facility_tmp(data) +
                            '</div>'+
                        '</div>'+

                    '</a>'+
                '</div>'
    }
    

    var prams_list = {
        page_size : 10,
    }

    var next_property = 1;

    function searching(search_type){ 
        var search_param = prams_list;

        if(next_property) search_param.page = next_property;
        if([null].includes(next_property)) return;

        $.ajax({
            url: '/property/api/prospect-favorite/list/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                $('#favorite-list').append(
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
                    $('#favorite-list').html(search_dom);
                }else{
                    $('#favorite-list').append(search_dom);
                };

                active_free_scrolling = false;
                last_property_box = $('.property-single-box').last();

                $('.searching-loader').remove();

                if(new_data?.length == 0){
                    $('#favorite-list').html('<p style="font-size: 20px; text-align:center;"><i class="bi bi-dropbox"></i> &nbsp;  No data available </p>')
                    $('#favorite-list').css({
                        'display' : 'grid',
                        'place-items' : 'center',
                        'min-height' : '400px'
                    })
                };
            },
            error: function (error) {
                active_free_scrolling = false;
                $('.searching-loader').remove();
                $('#favorite-list').html('<p style="font-size: 20px; text-align:center;"> <i class="bi bi-exclamation-diamond"></i>  &nbsp; Something is wrong </p>')
                $('#favorite-list').css({
                    'display' : 'grid',
                    'place-items' : 'center',
                    'min-height' : '400px'
                })
            }
        });
    };

    searching("search");
});