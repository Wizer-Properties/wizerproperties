$(document).ready(function(){
    new Splide( '.available-unitssplide-splide', {
        perPage: 4,
        gap : 10,
        pagination: false,
        perMove: 1,
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




    function get_asset_details(){
        $.ajax({
            url: asset_api_url,
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var data = data;
                if(!data?.building_info){
                    data = {
                        building_info : data
                    }
                }
                // property info
                $('[label-name="title"]').html(data?.title)
                $('[label-name="unit_id"]').html(data?.unit_id)
                $('[label-name="price"]').html('฿ '+ Math.floor(data?.price))
                $('[label-name="number_of_bedroom"]').html(data?.number_of_bedroom)
                $('[label-name="number_of_bathroom"]').html(data?.number_of_bathroom)
                $('[label-name="unit_area"]').html(data?.unit_area + ' SqM')
                $('[label-name="floor_number"]').html(data?.floor_number)
                $('[label-name="description"]').html(data?.description)


                $('[label-name="building-description"]').html(data?.building_info?.description);
                $('[label-name="build-title"]').html(data?.building_info?.title)
                $('[label-name="build-price"]').html('฿ '+ Math.floor(data?.building_info?.price))
                $('[label-name="address"]').html(data?.building_info?.address)
                $('[label-name="total_floors"]').html(data?.building_info?.total_floors)
                $('[label-name="number_of_balcony"]').html(data?.number_of_balcony)
                $('[label-name="number_of_car_parking"]').html(data?.number_of_car_parking)
                $('[label-name="building_type"]').html(data?.building_info?.type)
                $('[label-name="construction_year"]').html(data?.building_info?.construction_year)
                $('[label-name="project_name"]').html(data?.building_info?.title)
                $('[label-name="project_total_area"]').html(data?.building_info?.project_total_area)
                $('[label-name="total_units_for_sale"]').html(data?.building_info?.total_units_for_sale);


                // Facilities ==============
                facilities_void(data?.building_info)
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    get_asset_details();


    function facilities_void(building_info){
        var facilities_dom = '';

        if(building_info?.have_fitness_area){
            facilities_dom += ' <div class="col-6 col-md-6 col-lg-4 mb-3">'+
                                    '<div class="facilities-box">'+
                                        '<div class="facilities-box-icon">'+
                                            '<i class="material-symbols-outlined"> exercise </i>'+
                                        '</div>'+
                                        '<span class="facilities-box-label">Fitness Area</span>'+
                                    '</div>'+
                                '</div>'
        };

        if(building_info?.have_guard_house){
            facilities_dom += ' <div class="col-6 col-md-6 col-lg-4 mb-3">'+
                                    '<div class="facilities-box">'+
                                        '<div class="facilities-box-icon">'+
                                            '<i class="material-symbols-outlined"> security </i>'+
                                        '</div>'+
                                        '<span class="facilities-box-label">Guard House</span>'+
                                    '</div>'+
                                '</div>'
        };

        if(building_info?.have_lake_or_river_view){
            facilities_dom += ' <div class="col-6 col-md-6 col-lg-4 mb-3">'+
                                    '<div class="facilities-box">'+
                                        '<div class="facilities-box-icon">'+
                                            '<i class="material-symbols-outlined"> legend_toggle </i>'+
                                        '</div>'+
                                        '<span class="facilities-box-label">River View</span>'+
                                    '</div>'+
                                '</div>'
        };

        if(building_info?.have_sauna){
            facilities_dom += ' <div class="col-6 col-md-6 col-lg-4 mb-3">'+
                                    '<div class="facilities-box">'+
                                        '<div class="facilities-box-icon">'+
                                            '<i class="material-symbols-outlined"> sauna </i>'+
                                        '</div>'+
                                        '<span class="facilities-box-label">Sauna</span>'+
                                    '</div>'+
                                '</div>'
        };

        if(building_info?.have_sky_lounge){
            facilities_dom += ' <div class="col-6 col-md-6 col-lg-4 mb-3">'+
                                    '<div class="facilities-box">'+
                                        '<div class="facilities-box-icon">'+
                                            '<i class="material-symbols-outlined"> filter_drama </i>'+
                                        '</div>'+
                                        '<span class="facilities-box-label">Sky Lounge</span>'+
                                    '</div>'+
                                '</div>'
        };

        if(facilities_dom == ''){
            console.log("hel0o")
            facilities_dom += '<p class="no-facilities"> No Facilities added </p>'
        }

        $('[label-name="facilities"]').html(facilities_dom)
    };


    var got_media_file_type = [];
    var got_media_file_data = [];

    function append_data(data_list){
        var gallery_dom = ''
        
        for (let i = 0; i < data_list.length; i++) {
            gallery_dom += '<div class="details-gallery-img-box" index='+i+' >'+
                                '<img src='+data_list[i]?.file+' alt="bg">'+
                            '</div>'
            if(i == 4) break;
        };

        return gallery_dom;
    };

    function get_gallery_img(type_name){
        if(got_media_file_type.includes(type_name)) return;

        $.ajax({
            url: gallery_api_url+'?type='+type_name,
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                got_media_file_type.push(type_name);
                got_media_file_data.push(data);

                if(type_name == 'image'){
                    $('[label-name="media-files-image"] .details-gallery')
                    .html(append_data(data));
                    $('.details-banner-bg').html('<img src='+data[0]?.file+' alt="bg">')
                }else if(type_name == 'floor_plan'){
                    $('[label-name="media-files-floor-plan"] .details-gallery')
                    .html(append_data(data));
                }else if(type_name == 'unit_floor_plan'){
                    $('[label-name="media-files-unit-floor-plan"] .details-gallery')
                    .html(append_data(data));
                }else if(type_name == 'master_plan'){
                    $('[label-name="media-files-master-plan"] .details-gallery')
                    .html(append_data(data));
                }else if(type_name == 'video'){
                    var video_file = data[0].file;

                    if(video_file.includes('.webm')){
                        $('.details-gallery-video video')
                        .append('<source src='+data[0].file+' type="video/webm" />')
                    }else{
                        $('.details-gallery-video video')
                        .append('<source src='+data[0].file+' type="video/mp4" />')
                    }
                }
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    get_gallery_img('image');
    
    $('.gallery-btn button').click(function(){
        get_gallery_img($(this).attr('type'));
    })
    
    
    var is_gallery_open = false;
    $(document).on('click', '.details-gallery-img-box', function(){
        is_gallery_open = !is_gallery_open;
        $('body').attr('img-gallery-open', is_gallery_open);

        if(!is_gallery_open) return;

        new Splide( '.img-gallery-dialog-slider', {
            pagination: false
        }).mount();
    });


    $(document).on('click', '.dialog-dismiss', function(){
        is_gallery_open = false;
        $('body').attr('img-gallery-open', is_gallery_open);
    });




});