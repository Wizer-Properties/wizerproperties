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
        var facility_tmp = '';

        if(data?.building_info?.have_fitness_area){
            facility_tmp += '<span>GYM</span>'
        };

        if(data?.building_info?.have_grocery){
            facility_tmp += '<span>Grocery</span>'
        };

        if(data?.building_info?.have_guard_house){
            facility_tmp += '<span>Security</span>'
        };

        if(data?.building_info?.have_lake_or_river_view){
            facility_tmp += '<span>River View</span>'
        };

        if(data?.building_info?.have_sauna){
            facility_tmp += '<span>Sauna</span>'
        };

        if(data?.building_info?.have_sky_lounge){
            facility_tmp += '<span>Sky Lounge</span>'
        };
        
        return facility_tmp;
    };


    function property_list_tmp(value){
        var data = value?.property_info;

        return  '<div class="col-sm-6 col-lg-4 col-xl-3 mb-4 property-single-box">'+
                    '<div class="banner-action-button">'+
                        '<button class="add-to-compare" added="'+data?.is_compared+'" index="'+value?.property_info?.id+'">'+
                            '<i class="bi bi-arrow-left-right"></i>'+
                            '<i class="bi bi-check-circle-fill"></i>'+
                            ' Compare'+
                        '</button>'+

                        '<button class="add-to-favorite" added="'+data?.is_favorited+'" index="'+value?.property_info?.id+'">'+
                            '<i class="bi bi-heart-fill"></i>'+
                            '<i class="bi bi-heart"></i>'+
                            ' Favorite'+
                        '</button>'+
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
                                    data?.building_info?.address+
                                '</div>'+
                            '</div>'+
                            '<p class="sub-title">'+
                            data?.number_of_bedroom+
                            ' bedroom ' +
                            data?.building_info?.type+
                            ' for sale at ' +
                            data?.building_info?.title+
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
                                    '<span class="property-label"> SqM</span>'+
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
    var active_free_scrolling = false;
    var last_property_box; 
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