window.onload = function () {
    document.querySelector('body').setAttribute("loaded", 'true');
    document.querySelector('.preloader').remove();
};


$(document).ready(function(){


    var brower_info = navigator.userAgent;

    if(brower_info.search('Firefox') >= 0){
        $('[browser-fact="true"]').attr('browser-name', 'firefox')
    };


    $('body').css({
        'width' : window.innerWidth,
        'max-width' : window.innerWidth
    });
    
    $(window).resize(function () {
        $('body').css({
            'width' : window.innerWidth,
            'max-width' : window.innerWidth
        });
    });

});