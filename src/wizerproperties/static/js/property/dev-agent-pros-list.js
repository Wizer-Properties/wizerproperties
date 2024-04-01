$(document).ready(function(){

    var active_free_scrolling = false;

    function property_list_tmp(data){
        return  '<div class="col-xl-3 col-lg-4 col-sm-6 col-12 user-property-single-box mb-3">'+
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
                '</a>' +
            '</div>'
    };

        
    function loader_tmp(){
        return  '<div class="col-xl-3 col-lg-4 col-sm-6 col-12 user-property-single-box mb-3 list_loader">'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 180px; border-radius: 10px;"></span> </div>'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </div>'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </div>'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </div>'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 20px;"></span> </div>'+
                    '<div> <span class="skeleton-box" style="width: 100%; height: 75px;"></span> </div>'+
                '</div>'
    };


    var page_size = 8;
    var next_page = 1;

    if(window.innerWidth <= 1400) page_size = 6;
    if(window.innerWidth <= 991) page_size = 4;
    if(window.innerWidth <= 575) page_size = 3;


    function get_property_list(){
        $.ajax({
            url: '/property/api/user-properties/'+USER_ID+'/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                for (let i = 0; i < page_size; i++) {
                    $('#user-property-list').append(loader_tmp());
                };
            },
            success: function (data) {
                next_page = data?.next;
                var storing_tmp = '';

                for (let i = 0; i < data.results.length; i++) {
                    storing_tmp += property_list_tmp(data.results[i])
                };

                if(next_page){
                    for (let i = 0; i < page_size; i++) {
                        storing_tmp += loader_tmp()
                    }
                };

                $('#user-property-list').append(storing_tmp);

                
                $('[label-name="total"]').html(data?.count || 0)

                if(data?.count == 0){
                    $('#user-property-list').append('<p class="text-center mt-5"> No data available. </p>');
                };
            },
            error: function (error) {
                console.log("error")
            },
            complete: function(){
                active_free_scrolling = false;
                if($('.list_loader')){
                    $('.list_loader').remove()
                };
            }
        });
    };

    get_property_list();



    $(window).on('scroll', function() {
        var targetSection =  $('.user-property-single-box').last()[0];
        const elementRect = targetSection?.getBoundingClientRect();
        if(!elementRect) return;

        if(active_free_scrolling) return;
        if (
            elementRect.top >= 0 && 
            elementRect.bottom <= window.innerHeight &&
            next_page
        ){
            active_free_scrolling = true;
            get_property_list();
        }
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
    })
});