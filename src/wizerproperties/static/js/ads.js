$(document).ready(function(){
    var ads_banner_slider = null;
    var ads_side_banner_slider = null;
    var ads_banner_mounted = false;
    var ads_side_banner_mounted = false;
    function ads_tmp(data){
        var img = '<img src="'+(data?.banner_image || '')+'" alt="wip-ads">';
        if (data?.target_type && data?.object_id) {
            return  '<div class="top-banner-img">'+
                        '<a href="/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id+'">'+
                            img +
                        '</a>'+
                    '</div>';
        }
        return '<div class="top-banner-img">'+ img +'</div>';
    };


    function side_ads_tmp(data){
        var img = '<img src="'+(data?.banner_image || '')+'" alt="wip-ads">';
        if (data?.target_type && data?.object_id) {
            return  '<div class="side-add-banner-img">'+
                        '<a href="/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id+'">'+
                            img +
                        '</a>'+
                    '</div>';
        }
        return '<div class="side-add-banner-img">'+ img +'</div>';
    };

    function loader_tmp(){
        return '<li class="splide__slide top-banner-loader">'+
                    '<div class="top-banner-img">'+
                        '<span class="skeleton-box" style="width: 100%; height: 100%;"></span>'+
                    '</div>'+
                '</li>'
    }


    function get_ads_list(params){
        $.ajax({
            url: ADS_SUGGEST_URL,
            type: 'GET',
            data : {
                'ad-location' : params
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                // Add loader directly to DOM instead of using slider API
                if(['home', 'search', 'details_topbar'].includes(params)){
                    $('.ads-banner-slider .splide__list').append(loader_tmp());
                }
                if(['details_sidebar'].includes(params)){
                    $('.side-add-banner-slider .splide__list').append(loader_tmp());
                }
            },
            success: function (data) {
                if(data.length === 0){
                    ads_banner_slider && ads_banner_slider.destroy && ads_banner_slider.destroy();
                    ads_side_banner_slider && ads_side_banner_slider.destroy && ads_side_banner_slider.destroy();
                    $('.top-banner').length > 0 && $('.top-banner').remove()
                    $('.side-banner').length > 0 && $('.side-banner').remove()
                    return
                };

                // Remove loaders
                $('.top-banner-loader').remove();
                $('.side-add-banner-loader').remove();

                // Add slides directly to DOM
                for (let i = 0; i < data.length; i++) {
                    if(['home', 'search', 'details_topbar'].includes(params)){
                        $('.ads-banner-slider .splide__list').append('<li class="splide__slide">' + ads_tmp(data[i]) + '</li>');
                    }

                    if(['details_sidebar'].includes(params)){
                        $('.side-add-banner-slider .splide__list').append('<li class="splide__slide">' + side_ads_tmp(data[i]) + '</li>');
                    }
                }

                // Initialize and mount sliders after adding slides
                if(['home', 'search', 'details_topbar'].includes(params) && !ads_banner_mounted){
                    if($('.ads-banner-slider').length > 0 && $('.ads-banner-slider .splide__slide').length > 0){
                        ads_banner_slider = new Splide( '.ads-banner-slider', {
                            perPage: 1,
                            type: 'loop',
                            arrows: false,
                            pagination: false,
                            autoplay: 'playing',
                            interval: 3000
                        }).mount();
                        ads_banner_mounted = true;
                    }
                }

                if(['details_sidebar'].includes(params) && !ads_side_banner_mounted){
                    if($('.side-add-banner-slider').length > 0 && $('.side-add-banner-slider .splide__slide').length > 0){
                        ads_side_banner_slider = new Splide( '.side-add-banner-slider', {
                            perPage: 1,
                            type: 'loop',
                            arrows: false,
                            pagination: false,
                            autoplay: 'playing',
                            interval: 3000
                        }).mount();
                        ads_side_banner_mounted = true;
                    }
                }
            },
            error: function (error) {
                console.log(error)
            }
        });
    };

    for (let i = 0; i < ADS_LOCATION_PARAM.length; i++) {
        get_ads_list(ADS_LOCATION_PARAM[i])
    };

});