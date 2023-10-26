$(document).ready(function(){
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
            $(this).remove()
        }, 200);
    };

    $(document).on('click', '.filter-overlay', filter_close_dropdown);




    function property_list(data){
        return  '<div class="col-lg-6 mb-4">'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="row">'+
                            '<div class="col-sm-4">'+
                                '<div class="search-result-box-img">'+
                                    '<img src="https://www.ubm-development.com/magazin/wp-content/uploads/2020/03/kl-main-building-d-Kopie.jpg" alt="" loading="lazy">' +
                                '</div>'+
                            '</div>'+
                            '<div class="col-sm-8">'+
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
                                    'bedroom ' +
                                    data?.building_info?.type+
                                    'for sale at ' +
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
                                            '<span class="property-value"> '+ data?.unit_area+ 'SqM </span>'+
                                            '<span class="property-label">Size</span>'+
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
                                        '<span>Sauna</span>'+
                                        '<span>GYM</span>'+
                                        '<span>Sky lounge</span>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</a>'+
                '</div>'
    }


    function searching(){

        $.ajax({
            url: '/property/api/list/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                console.log(data)
                var new_data = data?.results
                var search_dom = ''
                for (let i = 0; i < new_data.length; i++) {
                    search_dom += property_list(new_data[i])
                };

                $('#search-result-list').html(search_dom)
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    searching()


});