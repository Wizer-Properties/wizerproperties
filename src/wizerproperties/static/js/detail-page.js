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
})