$(function(){

     // ===================== Like button click event ===================== 
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

    // ===================== Unlike button click event =====================
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

    //  ===================== Update the icons based on the state of like-done and unlike-done =====================
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

    // ===================== Fetch related posts =====================
    function fetchRelatedPosts(){
        var relatedBlogsContainer = $('.related-blogs');

        // Get read posts id and post categories name from local storage
        var read_posts_id = localStorage.getItem('read_posts_id') || [];
        var post_categories_name = localStorage.getItem('post_categories_name') || [];
        var current_postId = relatedBlogsContainer.attr('post-id');

        $.ajax({
            url: `/blogs/api/posts/related-posts/`,
            type: 'GET',
            data: {
                current_post_id: current_postId,
                read_posts_id: read_posts_id,
                post_categories_name: post_categories_name
            },
            success: function (response) {
                renderRelatedPosts(response);
            },
            error: function (error) {}
        });
    }

    // Initial load
    fetchRelatedPosts()

    // ===================== Render related posts =====================
    function renderRelatedPosts(posts) {

        // Render blog categories
        function blogCategories(post){
            var categories = '';
            post.categories.forEach(category => {
                categories += `<span class="blog-category">${category}</span>`;
            });
            return categories;
        }

        var relatedBlogsContainer = $('.related-blogs');
        var relatedBlogsList = relatedBlogsContainer.find('.related-blog-list');
        var relatedBlogsListHtml = '';

        posts.forEach(post => {
            relatedBlogsListHtml += `<a href="/blogs/${post.slug}/">
                        <div class="row pt-3">
                        <div class="col-md-4">
                            <div class="realted-blog-card-img">
                                <img src="${post.banner_image}" alt="${post.title}">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="related-blog-card-info">
                                <div class="blog-categories">
                                    ${blogCategories(post)}
                                </div>
                                <h5 class="blog-title">${post.title}</h5>

                                <div class="blog-info mt-3">
                                    <span class="blog-likes">${post.total_likes} likes</span>
                                    <span class="blog-views">${post.total_read_count} views</span>
                                    <span class="blog-read-time">${post.estimated_read_time} Mins Read</span>
                                    <span class="blog-create-date">${post.created_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`
        });

        relatedBlogsList.html(relatedBlogsListHtml);
    }

    // ===================== Store read post id and categories name in local storage =====================  
    function storeReadPostsIdAndCategoriesName(post_id, post_categories) {
        // Retrieve read_posts_id and post_categories_name from localStorage, or use empty arrays if not found
        var read_posts_id = JSON.parse(localStorage.getItem('read_posts_id')) || [];
        var post_categories_name = JSON.parse(localStorage.getItem('post_categories_name')) || [];

        // Check if post_id is already in read_posts_id
        if (!read_posts_id.includes(post_id)) {
            read_posts_id.push(post_id);
        }

        // Check if post_categories is an array and if categories are already in post_categories_name
        post_categories.forEach(function(category) {
            if (!post_categories_name.includes(category)) {
                post_categories_name.push(category);
            }
        });

        // Only store latest 10 posts id and categories name
        if (read_posts_id.length > 10) {
            read_posts_id.shift();
        }
        if (post_categories_name.length > 10) {
            post_categories_name.shift();
        }

        // Store updated arrays back in localStorage (convert arrays to JSON strings)
        localStorage.setItem('read_posts_id', JSON.stringify(read_posts_id));
        localStorage.setItem('post_categories_name', JSON.stringify(post_categories_name));
    }

    storeReadPostsIdAndCategoriesName(post_id, post_categories);

    // ===================== Calculate total read time of users =====================
    let startTime = new Date().getTime();

    // Function to calculate time spent on the page
    function calculateTimeSpent() {
        let endTime = new Date().getTime();
        let timeSpent = Math.round((endTime - startTime) / 1000); // in seconds
        return timeSpent;
    }

    // Event when user leaves the page or closes the tab
    window.addEventListener("beforeunload", function () {
        let timeSpent = calculateTimeSpent();

        $.ajax({
            url: `/blogs/api/posts/save-read-time/`,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            data: {
                time_spent: timeSpent,
                post_id: post_id
            },
            success: function (response) {},
            error: function (error) {}
        });
    });

})