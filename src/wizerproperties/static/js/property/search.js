$(document).ready(function(){
    // Create a URL object
    var url = new URL(window.location.href);
    var place = url.searchParams.get("place");
    $('#gm-search-input').val(place || '');
    $('.search-area').html(place || '');
    
    console.log("===============", place);


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
            $('.filter-overlay').remove()
        }, 200);
    };

    $(document).on('click', '.filter-overlay', filter_close_dropdown);


    function property_list(data){
        return  '<div class="col-lg-6 mb-4">'+
                    '<a href="/property/details/'+data?.id+'/" class="search-result-box-wrapper">'+
                        '<div class="row">'+
                            '<div class="col-sm-4">'+
                                '<div class="search-result-box-img">'+
                                    '<img src="'+data?.default_image+'" alt="'+data?.title+'" loading="lazy">' +
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

    var prams_list = {
        page_size : 12,
        search : place || ''
    }

    function searching(){
        $.ajax({
            url: '/property/api/list/',
            type: 'GET',
            data : prams_list,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                console.log(data)
                $('[label="available-properties"]').html(data?.count)
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

    searching();


    $(document).on('change', 'select', function(){
        filter_close_dropdown();
        prams_list[$(this).attr('name')] = $(this).val() == 'null' ? '' : $(this).val();
        searching();

        var get_parent_label = $(this).parents('[label]')?.attr('label');
        var button_dom = $(this).parents('[label]')?.find('button');

        // max and minmum price dom >>>
        if(get_parent_label == 'price'){
            var min_val = formatNumber(prams_list?.min_price || 'Min')
            var max_val = formatNumber(prams_list?.max_price || 'Max')

            if(min_val == "Min" && max_val == "Max" ){
                button_dom.html('Any Price  <i class="bi bi-chevron-down"></i>')
                return;
            }else{
                min_val = '฿ ' + min_val;
                max_val = '฿ ' + max_val;
            };

            button_dom.html(min_val+' - '+max_val+' <i class="bi bi-chevron-down"></i>')
        };

        // max and minmum unit area dom >>>
        if(get_parent_label == 'unit_area'){
            var min_val = formatNumber(prams_list?.min_unit_area || 'Min')
            var max_val = formatNumber(prams_list?.max_unit_area || 'Max')

            if(min_val == "Min" && max_val == "Max" ){
                button_dom.html('Unit Area  <i class="bi bi-chevron-down"></i>')
                return;
            }else{
                min_val = min_val + ' SqM';
                max_val = max_val + ' SqM';
            };
            button_dom.html(min_val+' - '+max_val+' <i class="bi bi-chevron-down"></i>')
        };
    });



    $(document).on('click', '.filter-dropdown-buttons button', function(){
        var get_val =  $(this).val() == 'null' ? '' :  $(this).val();
        filter_close_dropdown();

        var render_btn_dom = get_val == '' ? '' : ' ('+get_val+') ';
        if(prams_list[$(this).attr('name')] == get_val){
            render_btn_dom = ''
        };
        var label_name = $(this).parents('.filter-categories-dropdown').attr('label');

        $(this).parents('.filter-categories-dropdown').find('.filter-dropdown-btn')
        .html(label_name + render_btn_dom + ' <i class="bi bi-chevron-down"></i>')

        if(prams_list[$(this).attr('name')] == get_val){
            $(this).parents('.filter-dropdown-buttons').find('button').attr('active', false);
            prams_list[$(this).attr('name')] = '';
            $(this).parents('.filter-dropdown-buttons').find('button[value="null"]').attr('active', true);
            if(get_val != '') searching();
            return;
        };

        prams_list[$(this).attr('name')] =  get_val;
        searching();

        $(this).parents('.filter-dropdown-buttons').find('button').attr('active', false);
        $(this).attr('active', true);
    });


    $(document).on('click', '[name="features"] button', function(){
        filter_close_dropdown();
        prams_list[$(this).val()] = !prams_list[$(this).val()];
        $(this).attr('active', prams_list[$(this).val()]);

        if(!prams_list[$(this).val()]){
            delete prams_list[$(this).val()];
        };

        searching();
    });


    $(document).on('click', '[name="property-type"] button', function(){
        filter_close_dropdown();
        $(this).parents('.filter-dropdown-mtl-buttons').find('button').attr('active', false);

        if(prams_list[$(this).attr('name')] == $(this).val()){
            prams_list[$(this).attr('name')] = '';
            searching();
            return
        };

        prams_list[$(this).attr('name')] =  $(this).val();
        searching();
        $(this).attr('active', true);
    });


    $('.reset-btn').click(function(){
        if( Object.keys(prams_list).length > 1 ){
            prams_list = {
                search : place || ''
            };

            searching()

            $('[label="price"] button.filter-dropdown-btn').html('Any Price <i class="bi bi-chevron-down"></i>');
            $('[label="unit_area"] button.filter-dropdown-btn').html('Any Price <i class="bi bi-chevron-down"></i>');
            $('[label="Beds"] button.filter-dropdown-btn').html('Beds <i class="bi bi-chevron-down"></i>');
            $('[label="Baths"] button.filter-dropdown-btn').html('Baths <i class="bi bi-chevron-down"></i>');
            $('.filter-dropdown-buttons button').attr('active', false);
            $('.filter-dropdown-buttons [value="null"]').attr('active', true);
            $('.filter-dropdown-mtl-buttons button').attr('active', false);
            $('select').val('null')
        }
    });


    function formatNumber(number) {
        if(
            Number(number) == NaN ||
            [null, undefined, ''].includes(number)
        ){
            return number
        }

        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(1) + ' B';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + ' M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + ' k';
        } else {
            return number.toString();
        }
    }

});