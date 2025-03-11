$(document).ready(function(){
    $('.menu-box').click(function(){
        $('.header-side-nav').slideToggle(100)

        var is_menu_open = $('body').attr('is-menu-open');
        if(is_menu_open == 'true'){
            $('body').attr('is-menu-open', 'false');
        }else{
            $('body').attr('is-menu-open', 'true');
        }
    });

    

    $(document).on('click', function(e){
        if(
            !$(e.target).closest('.header-side-nav').length &&
            !$(e.target).closest('.menu-box').length
        ){
            $('.header-side-nav').slideUp(100)
        }
    });
})