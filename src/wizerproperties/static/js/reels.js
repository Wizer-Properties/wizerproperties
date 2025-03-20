$(document).ready(function(){
    function loader_tmp(){
        return  '<div class="splide__slide comparison-slider-box list_loader">'+
                    '<div class="comparison-img-icon-box">'+
                        '<span class="skeleton-box" style="width: 100%; height: 180px; border-radius: 10px;"></span>'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 70px;"></span> </li>'+
                    '</div>'+
                '</div>'
    };
    
    function reels_iframe_tmp(data){
        if(data?.social_media == 'youtube'){
            var parts = data.url.split('/');
            var videoId = parts[parts.length - 1];
            var embedUrl = `https://youtube.com/embed/${videoId}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == "titTok"){
            var parts = data.url.split('/video/');
            var embedUrl = `https://www.tiktok.com/embed/v2/${parts[1]}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == 'instagram'){
            var parts = data.url.split('/');
            return '<iframe height="520" src="https://www.instagram.com/p/'+parts[4]+'/embed/" frameborder="0"></iframe>';
        };

        return data?.url;
    };

    function reels_tmp (data){
        var company_data;
        if(data?.user?.agent){
            company_data = data?.user?.agent;
        }else{
            company_data = data?.user?.developer;
        };

        return( '<div class="reels-box-wrapper secion-space">'+
                    '<div class="reels-iframe-and-data">'+
                        reels_iframe_tmp(data)+
                    '</div>'+
                    '<div class="reels-developer-info mt-2 p-4">'+
                        '<div class="reels-title">'+ data?.property_title+'</div>'+
                        '<div class="reels-developer-logo d-flex flex-column justify-content-start w-100">'+
                            '<p class="mb-0 pb-0 manged-by-text">Managed by</p>'+
                            '<h1 class="m-0">'+company_data?.company_name+'</h1>'+
                        '</div>'+
        
                        '<div class="reels-visit-btn mt-3">' +
                            '<a href="/property/details/' + data?.property + '/" class="custom-button">' +
                            'Visit Property ' +
                            '<i class="bi bi-box-arrow-up-right arrow-icon"></i>' +
                            '</a>' +
                        '</div>'+
                    '</div>'+
                '</div>'
        )
    }


    var reels_slider = new Splide( '.reels-slider', {
        perPage: 4,
        gap : 20,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            1080: {
                perPage: 2,
            },
            768: {
                perPage: 1,
            }
        }
    }).mount();


    var reels_next;
    var calling_reels;
    var category;
    var is_category_btn_call;
    var first_time_reel_api_call = true;

    function get_reels_list(next_page){
        if(calling_reels) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/advertise/api/reel/suggested/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page,
                category : category
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                if(is_category_btn_call){
                    reels_slider.remove('.reels-slider .reels-box-wrapper');
                };

                for (let i = 0; i < page_size; i++) {
                    reels_slider.add(loader_tmp())
                };

                calling_reels = true;
            },
            success: function (data) {
                calling_reels = false;

                if(
                    first_time_reel_api_call &&
                    data?.count == 0
                ){
                    $('#engaging-reels').remove();
                    return;
                };

                first_time_reel_api_call = false;
                
                if(data?.count == 0){
                    $('.no-reels').html('<p class="my-5 py-5 text-center"> No reels available </p>')
                }else{
                    $('.no-reels').html('')
                };
                
                for (let i = 0; i < data?.results.length; i++) {
                    reels_slider.add(reels_tmp(data?.results[i]))
                };
                reel_detail()

                reels_slider.remove('.reels-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        reels_slider.add(loader_tmp())
                    };
                };

                reels_next = data?.next;
                is_category_btn_call = false;
            },
            error: function (error) {
                calling_reels = false;
                is_category_btn_call = false;
            },
        });
    };

    get_reels_list();

    reels_slider.on( 'moved', (e) => {
        if(reels_next == null) return;
        get_reels_list(reels_next);
    });


    function reel_detail(){
        var all_reel_details = $('.reel-details');
        for (let i = 0; i < all_reel_details.length; i++) {
            if( all_reel_details[i].offsetHeight > 25){
                all_reel_details[i].parentNode.setAttribute("view-type", "less");
            }else{
                all_reel_details[i].parentNode?.querySelector('.reel-see-more-see-less')?.remove();
            };
        };
    };


    $(document).on('click', '.reels-filter-btns button', function(){
        is_category_btn_call = true;
        
        if($(this).hasClass('activate')){
            $('.reels-filter-btns button').removeClass('activate');
            category = null;
        }else{
            $('.reels-filter-btns button').removeClass('activate');
            $(this).addClass('activate');
            category = $(this).val();
        };
        
        get_reels_list()
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
    });


});