$(document).ready(function(){
    $(document).on('click', '.add-to-compare[added="false"]', function(){
        var this_btn = $(this)
        $.ajax({
            url: '/property/api/compare/create/',
            data : {
                property : $(this).attr('index')
            },
            type: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                this_btn.attr('added', 'true')
            },
            error: function (error) {
                console.log("error")
            }
        })
    });


    $(document).on('click', '.add-to-compare[added="true"]', function(){
        var this_btn = $(this)
        $.ajax({
            url: '/property/api/compare/delete/'+$(this).attr('index')+'/',
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                this_btn.attr('added', 'false')
            },
            error: function (error) {
                console.log("error")
            }
        })
    });



    $(document).on('click', '.add-to-favorite[added="false"]', function(){
        var this_btn = $(this)
        $.ajax({
            url: '/property/api/prospect-favorite/add/',
            data : {
                property : $(this).attr('index')
            },
            type: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                this_btn.attr('added', 'true')
            },
            error: function (error) {
                console.log("error")
            }
        })
    });


    $(document).on('click', '.add-to-favorite[added="true"]', function(){
        var this_btn = $(this)
        $.ajax({
            url: '/property/api/prospect-favorite/remove/'+$(this).attr('index')+'/',
            data : {
                property : $(this).attr('index')
            },
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success : function (data) {
                this_btn.attr('added', 'false')
            },
            error: function (error) {
                console.log("error")
            }
        })
    });

})