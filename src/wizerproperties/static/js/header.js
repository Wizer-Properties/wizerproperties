$(document).ready(function(){
    
    var is_html_append = false;

    function toggole_menu(){
        var get_attr =  $('body').attr('menu')

        if(get_attr == 'open'){
            $('body').attr('menu', 'close')
            $('.profile-dropdown-area').slideDown(100)
        }else{
            $('.profile-dropdown-area').slideUp(100)
            $('body').attr('menu', 'open')
        };

        if(!is_html_append){
            var profile_dropdown_dom = $('.navigation-right-side').html();
            var navigations_dom = $('.navigations').html();
            $('.side-nav').html(profile_dropdown_dom+navigations_dom)
        };

        is_html_append = true;
    };

    $('.mobile-menu').click(toggole_menu);
    $('.side-nav-overflow').click(toggole_menu);

    $(document).on('click', '.profile-dropdown', function(){
        $('.profile-dropdown-area').slideToggle(300)
        $('body').prepend('<div class="profile-dropdown-overlay"></div>')
    });

    $(document).on('click', '.profile-dropdown-overlay', function(){
        $('.profile-dropdown-area').slideUp(300)
        $(this).remove()
    })
})