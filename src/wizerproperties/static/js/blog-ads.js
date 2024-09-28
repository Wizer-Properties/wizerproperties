$(function(){
    // ads //
    var data = [
        {
            property_id: 10,
            id: 9,
            property_image: "https://wizerproperties.com/media/property/images/Screenshot_from_2024-05-29_10-13-27.png"
        },
        {
            property_id: 4,
            id: 8,
            property_image: "https://wizerproperties.com/media/property/images/Screenshot_from_2024-03-04_10-19-21.png"
        }

    ];

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
    function ads_tmp(data) {
        return '<li class="splide__slide">' +
            '<div class="top-banner-img">' +
            '<a href="/property/details/' + data?.property_id + '/?ad_id=' + data?.id + '">' +
            '<img src="' + data?.property_image + '" alt="wip-ads">' +
            '</a>' +
            '</div>' +
            '</li>';
    }

    // Get the slider's track element
    var ads_slider_list = document.querySelector('.ads-banner-slider .splide__list');

    // Loop through the data and append each image to the slider
    data.forEach(function (item) {
        ads_slider_list.innerHTML += ads_tmp(item);
    });

    // Mount the slider after all images are added
    ads_banner_slider.mount();
})