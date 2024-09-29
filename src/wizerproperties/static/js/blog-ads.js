$(function(){
    // Get the slider's track element
    var ads_slider_list = document.querySelector('.ads-banner-slider .splide__list');

    // Fetch ads from the API
    function fetchAds() {
        $.ajax({
            url: '/blogs/api/advertisement/',
            type: 'GET',
            success: function(data) {
                // Loop through the data and append each image to the slider
                data.forEach(function (item) {
                    ads_slider_list.innerHTML += ads_tmp(item);
                });

                // Mount the slider after all images are added
                ads_banner_slider.mount();
            },
            error: function(err) {}
        });
    }

    fetchAds();

    // Initialize the Splide slider
    var ads_banner_slider = new Splide('.ads-banner-slider', {
        perPage: 1,
        type: 'loop',
        arrows: false,
        pagination: false,
        autoplay: 'playing',
        interval: 3000
    });

    // Function to generate the ad banner HTML
    function ads_tmp(item) {
        return '<li class="splide__slide">' +
            '<div class="top-banner-img">' +
            '<a href="/property/details/' + item?.property_id + '/?ad_id=' + item?.id + '">' +
            '<img src="' + item?.property_image + '" alt="wip-ads">' +
            '</a>' +
            '</div>' +
            '</li>';
    }
})
