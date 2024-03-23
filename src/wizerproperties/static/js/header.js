$(document).ready(function(){
    
    var is_html_append = false;
    var globalWindowWidth = $(window).width();

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
            $('.side-nav').append($('.profile-dropdown-area').html());
        };

        is_html_append = true;
    };

    $('.mobile-menu').click(toggole_menu);
    $('.side-nav-overflow').click(toggole_menu);

    $(document).on('click', '.profile-dropdown', function(){
        if(globalWindowWidth <= 1180) return;
        $('.profile-dropdown-area').slideToggle(300)
        $('body').prepend('<div class="profile-dropdown-overlay"></div>')
    });

    $(document).on('click', '.profile-dropdown-overlay', function(){
        $('.profile-dropdown-area').slideUp(300)
        $(this).remove()
    });


    var incert_nav = false;

    function headerResponsive() {
        
        var windowWidth = $(window).width();
        globalWindowWidth = windowWidth;
        var nav_links = $('.navigations a.nav-link');
        
        if(windowWidth >= 1180 ){
            $('.side-nav').html('');
            is_html_append = false;
        };

        if(windowWidth < 1440 ){
            if(incert_nav) return;

            for (let i = 0; i < nav_links.length; i++) {
                $('.profile-dropdown-area').prepend(nav_links[nav_links.length - (i+1)])
                if(i == 3) break;
            };
            incert_nav = true
        };

        var dropdown_nav_links = $('.profile-dropdown-area a.nav-link')
        if(windowWidth >= 1440 ){
            if(!incert_nav) return;
            for (let i = 0; i < dropdown_nav_links.length; i++) {
                $('.navigations').append(dropdown_nav_links[i]);
                if(i == (dropdown_nav_links.length - 3)) break;
            };
            incert_nav = false;
        };


    }

    headerResponsive();
    $(window).resize(headerResponsive);
})