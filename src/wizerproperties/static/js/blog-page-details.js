$(function(){

     // Like button click event
     $('.blog-like-btn').click(function () {
        var likeDone = $(this).attr('like-done') === 'true';
        var postId = $(this).attr('post-id');

        // Toggle like-done attribute
        $(this).attr('like-done', likeDone ? 'false' : 'true');

        // Set unlike-done to false when like-done is true
        if (!likeDone) {
            $('.blog-unlike-btn').attr('unlike-done', 'false');
        }

        // Update the icons
        updateIcons();

        // Send like request to server
        $.ajax({
            url: `/blogs/api/posts/post-like-dislike/`,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            data: { interaction_type: likeDone ? 'undo' : 'like', post_id: postId },
            success: function (response) {},
            error: function (error) {}
        });
    });

    // Unlike button click event
    $('.blog-unlike-btn').click(function () {
        var unlikeDone = $(this).attr('unlike-done') === 'true';
        var postId = $(this).attr('post-id');

        // Toggle unlike-done attribute
        $(this).attr('unlike-done', unlikeDone ? 'false' : 'true');

        // Set like-done to false when unlike-done is true
        if (!unlikeDone) {
            $('.blog-like-btn').attr('like-done', 'false');
        }

        // Update the icons
        updateIcons();

        // Send unlike request to server
        $.ajax({
            url: `/blogs/api/posts/post-like-dislike/`,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            data: { interaction_type: unlikeDone ? 'undo' : 'dislike', post_id: postId },
            success: function (response) {},
            error: function (error) {}
        });
    });

    // Function to update the icons based on the state of like-done and unlike-done
    function updateIcons() {
        // Handle like button icons
        if ($('.blog-like-btn').attr('like-done') === 'true') {
            $('.blog-like-btn i:first-child').hide();
            $('.blog-like-btn i:last-child').show();
        } else {
            $('.blog-like-btn i:first-child').show();
            $('.blog-like-btn i:last-child').hide();
        }

        // Handle unlike button icons
        if ($('.blog-unlike-btn').attr('unlike-done') === 'true') {
            $('.blog-unlike-btn i:first-child').hide();
            $('.blog-unlike-btn i:last-child').show();
        } else {
            $('.blog-unlike-btn i:first-child').show();
            $('.blog-unlike-btn i:last-child').hide();
        }
    }


})