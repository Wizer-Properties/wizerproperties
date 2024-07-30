$(document).ready(function(){
    var ads_banner_slider = new Splide( '.ads-banner-slider', {
        perPage: 1,
        type: 'loop',
        arrows: false,
        pagination: false,
        autoplay: 'playing',
        interval: 3000
    }).mount();


    function ads_tmp(data){
        return  '<div class="top-banner-img">'+
                    '<a href="/property/details/'+data?.property_id+'/?ad_id='+data?.id+'">'+
                        '<img src="'+data?.property_image+'" alt="wip-ads">'+
                    '</a>'+
                '</div>'
    };


    function loader_tmp(){
        return '<div class="top-banner-img top-banner-loader">'+
                    '<span class="skeleton-box" style="width: 100%; height: 100%;"></span>'+
                '</div>'
    }


    function get_ads_list(){
        $.ajax({
            url: ADS_SUGGEST_URL,
            type: 'GET',
            data : {
                'ad-location' : ADS_LOCATION_PARAM
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                ads_banner_slider.add(loader_tmp())
            },
            success: function (data) {
                if(data.length === 0){
                    ads_banner_slider.destroy();
                    $('.top-banner').remove()
                    return
                };

                ads_banner_slider.remove('.top-banner-loader')
                for (let i = 0; i < data.length; i++) {                    
                    ads_banner_slider.add(ads_tmp(data[i]))
                };
            },
            error: function (error) {
                console.log(error)
            }
        });
    };

    get_ads_list()

});