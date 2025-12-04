$(document).ready(function(){
    var ads_banner_slider = null;
    var ads_side_banner_slider = null;
    var ads_banner_mounted = false;
    var ads_side_banner_mounted = false;
    function ads_tmp(data){
        // Escape HTML to prevent XSS in attribute values
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, function(m) {
                return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
            });
        }
        var titleText = data?.target_title ? escapeHtml(data.target_title) : '';
        var altText = titleText ? 'Sponsored: ' + titleText : 'Sponsored property listing';
        var img = '<img src="'+(data?.banner_image || '')+'" alt="'+altText+'" aria-label="'+altText+'" loading="lazy">';
        if (data?.target_type && data?.object_id) {
            return  '<div class="top-banner-img">'+
                        '<a href="/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id+'" aria-label="View '+altText+'">'+
                            img +
                        '</a>'+
                    '</div>';
        }
        return '<div class="top-banner-img">'+ img +'</div>';
    };


    function side_ads_tmp(data){
        var altText = data?.target_title ? 'Sponsored: ' + data.target_title : 'Sponsored property listing';
        var img = '<img src="'+(data?.banner_image || '')+'" alt="'+altText+'" loading="lazy">';
        if (data?.target_type && data?.object_id) {
            return  '<div class="side-add-banner-img">'+
                        '<a href="/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id+'" aria-label="View '+altText+'">'+
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

    // Inline ad card template (matches property card style)
    function inline_ad_card_tmp(data){
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, function(m) {
                return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
            });
        }
        var titleText = data?.target_title ? escapeHtml(data.target_title) : '';
        var altText = titleText ? 'Sponsored: ' + titleText : 'Sponsored property listing';
        var img = '<img src="'+(data?.banner_image || '')+'" alt="'+altText+'" aria-label="'+altText+'" loading="lazy">';
        var link = '#';
        if (data?.target_type && data?.object_id) {
            link = '/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id;
        }
        
        return '<article class="inline-ad-card group relative" data-ad-card="'+data?.id+'">' +
            '<div class="ad-badge">Sponsored</div>' +
            '<a href="'+link+'" aria-label="View '+altText+'">' +
            img +
            '</a>' +
            '</article>';
    }

    // Square ad below map template
    function map_below_ad_tmp(data){
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, function(m) {
                return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
            });
        }
        var titleText = data?.target_title ? escapeHtml(data.target_title) : '';
        var altText = titleText ? 'Sponsored: ' + titleText : 'Sponsored property listing';
        var img = '<img src="'+(data?.banner_image || '')+'" alt="'+altText+'" aria-label="'+altText+'" loading="lazy">';
        var link = '#';
        if (data?.target_type && data?.object_id) {
            link = '/'+data.target_type+'/details/'+data.object_id+'/?ad_id='+data?.id;
        }
        
        return '<div class="map-below-ad group relative" data-ad-card="'+data?.id+'">' +
            '<div class="ad-badge">Sponsored</div>' +
            '<a href="'+link+'" aria-label="View '+altText+'">' +
            img +
            '</a>' +
            '</div>';
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
                if(['search', 'details_topbar'].includes(params)){
                    $('.ads-banner-slider .splide__list').append(loader_tmp());
                }
                if(['details_sidebar'].includes(params)){
                    $('.side-add-banner-slider .splide__list').append(loader_tmp());
                }
                if(params === 'map_below'){
                    $('#map-below-ad-container').html('<div class="skeleton-box" style="width: 100%; aspect-ratio: 1/1; max-width: 400px; margin: 0 auto; border-radius: 1rem;"></div>');
                }
            },
            success: function (data) {
                if(data.length === 0){
                    // Remove loaders
                    $('.top-banner-loader').remove();
                    $('.side-add-banner-loader').remove();
                    
                    // Destroy sliders if they exist
                    if(ads_banner_slider && ads_banner_slider.destroy) {
                        ads_banner_slider.destroy();
                        ads_banner_slider = null;
                        ads_banner_mounted = false;
                    }
                    if(ads_side_banner_slider && ads_side_banner_slider.destroy) {
                        ads_side_banner_slider.destroy();
                        ads_side_banner_slider = null;
                        ads_side_banner_mounted = false;
                    }
                    
                    // Hide ad containers (including parent sections with labels)
                    if(['search', 'details_topbar'].includes(params)){
                        $('.ads-banner-slider').closest('section').hide();
                    }
                    if(['details_sidebar'].includes(params)){
                        $('.side-add-banner-slider').closest('.space-y-3').hide();
                    }
                    if(params === 'map_below'){
                        $('#map-below-ad-container').hide();
                    }
                    if(params === 'search_inline'){
                        window.inlineAds = []; // Store empty array for search.js
                    }
                    return
                };

                // Handle inline ads - store for search.js to use
                if(params === 'search_inline'){
                    window.inlineAds = data; // Store ads globally for search.js
                    return;
                }
                
                // Handle map below ads
                if(params === 'map_below'){
                    $('#map-below-ad-container').html(map_below_ad_tmp(data[0])); // Show first ad
                    return;
                }

                // Remove loaders
                $('.top-banner-loader').remove();
                $('.side-add-banner-loader').remove();

                // Add slides directly to DOM
                for (let i = 0; i < data.length; i++) {
                    if(['search', 'details_topbar'].includes(params)){
                        $('.ads-banner-slider .splide__list').append('<li class="splide__slide">' + ads_tmp(data[i]) + '</li>');
                    }

                    if(['details_sidebar'].includes(params)){
                        $('.side-add-banner-slider .splide__list').append('<li class="splide__slide">' + side_ads_tmp(data[i]) + '</li>');
                    }
                }

                // Initialize and mount sliders after adding slides
                if(['search', 'details_topbar'].includes(params) && !ads_banner_mounted){
                    if($('.ads-banner-slider').length > 0 && $('.ads-banner-slider .splide__slide').length > 0){
                        ads_banner_slider = new Splide( '.ads-banner-slider', {
                            perPage: 1,
                            type: 'loop',
                            arrows: false,
                            pagination: true,
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