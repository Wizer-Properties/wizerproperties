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
                console.log("==================>", data)
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    get_asset_details();
    
    
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