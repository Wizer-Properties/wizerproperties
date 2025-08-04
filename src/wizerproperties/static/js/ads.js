$(document).ready(function(){
    var ads_banner_slider = null;
    var ads_side_banner_slider = null;

    if($('.ads-banner-slider').length > 0){
        ads_banner_slider = new Splide( '.ads-banner-slider', {
            perPage: 1,
            type: 'loop',
            arrows: false,
            pagination: false,
            autoplay: 'playing',
            interval: 3000
        }).mount();
    };

    if($('.side-add-banner-slider').length > 0){
        ads_side_banner_slider = new Splide( '.side-add-banner-slider', {
            perPage: 1,
            type: 'loop',
            arrows: false,
            pagination: false,
            autoplay: 'playing',
            interval: 3000
        }).mount();
    };


    function ads_tmp(data){
        return  '<div class="top-banner-img">'+
                    '<a href="/property/details/'+data?.property_id+'/?ad_id='+data?.id+'">'+
                        '<img src="'+data?.banner_image+'" alt="wip-ads">'+
                    '</a>'+
                '</div>'
    };


    function side_ads_tmp(data){
        return  '<div class="side-add-banner-img">'+
                    '<a href="/property/details/'+data?.property_id+'/?ad_id='+data?.id+'">'+
                        '<img src="'+data?.banner_image+'" alt="wip-ads">'+
                    '</a>'+
                '</div>'
    };


    function loader_tmp(){
        return '<div class="top-banner-img top-banner-loader">'+
                    '<span class="skeleton-box" style="width: 100%; height: 100%;"></span>'+
                '</div>'
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
                ads_banner_slider.add(loader_tmp())
            },
            success: function (data) {
                if(data.length === 0){
                    ads_banner_slider && ads_banner_slider.destroy();
                    ads_side_banner_slider && ads_side_banner_slider.destroy();
                    $('.top-banner').length > 0 && $('.top-banner').remove()
                    $('.side-banner').length > 0 && $('.side-banner').remove()
                    return
                };

                ads_banner_slider && ads_banner_slider.remove('.top-banner-loader')
                ads_side_banner_slider && ads_side_banner_slider.remove('.side-add-banner-loader')

                for (let i = 0; i < data.length; i++) {
                    if(['home', 'search', 'details_topbar'].includes(params)){
                        ads_banner_slider && ads_banner_slider.add(ads_tmp(data[i]))
                    };

                    if(['details_sidebar'].includes(params)){
                        ads_side_banner_slider && ads_side_banner_slider.add(side_ads_tmp(data[i]))
                    };
                };
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