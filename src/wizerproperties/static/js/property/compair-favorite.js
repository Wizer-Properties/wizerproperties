$(document).ready(function(){

    function loader(dom){
        var loader_file = '<img src="/static/media/loader.svg" alt="loading...">';
        dom.html(loader_file)
    };

    var compare_req = false;

    $(document).on('click', '.add-to-compare[added="false"]', function(){
        if(compare_req) return;
        var this_btn = $(this);
        var get_html = $(this).html();
        compare_req = true;

        $.ajax({
            url: '/property/api/compare/create/',
            data : {
                property : $(this).attr('index')
            },
            type: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                loader(this_btn);
            },
            success : function (data) {
                this_btn.attr('added', 'true');
                this_btn.html(get_html);
                compare_req = false;
            },
            error: function (error) {
                console.log("error");
                this_btn.html(get_html);
                compare_req = false;
            }
        })
    });


    $(document).on('click', '.add-to-compare[added="true"]', function(){
        if(compare_req) return;
        var this_btn = $(this);
        var get_html = $(this).html();
        compare_req = true;

        $.ajax({
            url: '/property/api/compare/delete/',
            data: {
                property : this_btn.attr('index')
            },
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                loader(this_btn);
            },
            success : function (data) {
                this_btn.attr('added', 'false');
                this_btn.html(get_html);
                compare_req = false;
            },
            error: function (error) {
                console.log("error");
                this_btn.html(get_html);
                compare_req = false;
            }
        })
    });



    var favorite_req = false;

    $(document).on('click', '.add-to-favorite[added="false"]', function(){
        if(favorite_req) return;
        var this_btn = $(this);
        var get_html = $(this).html();
        favorite_req = true;

        $.ajax({
            url: '/property/api/prospect-favorite/add/',
            data : {
                property : $(this).attr('index')
            },
            type: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                loader(this_btn);
            },
            success : function (data) {
                this_btn.attr('added', 'true');
                this_btn.html(get_html);
                favorite_req = false;
            },
            error: function (error) {
                console.log("error");
                this_btn.html(get_html);
                favorite_req = false;
            }
        })
    });


    $(document).on('click', '.add-to-favorite[added="true"]', function(){
        if(favorite_req) return;
        var this_btn = $(this);
        var get_html = $(this).html();
        favorite_req = true;

        $.ajax({
            url: '/property/api/prospect-favorite/remove/',
            data : {
                property : $(this).attr('index')
            },
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                loader(this_btn);
            },
            success : function (data) {
                this_btn.attr('added', 'false');
                this_btn.html(get_html);
                favorite_req = false;

                if(favorite_removable){
                    this_btn.parents('.property-single-box').remove();
                };
            },
            error: function (error) {
                console.log("error")
                this_btn.html(get_html);
                favorite_req = false;
            }
        })
    });


    $(document).on('click', '.add-to-favorite , .add-to-compare', function(){
        if( [undefined, null, 'null', 'undefined'].includes( $(this).attr('added')) ){
            window.location.href = '/';
        };
    });

})