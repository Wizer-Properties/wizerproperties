// filter icon //
$(document).ready(function () {
    $('.most-readed-filter, .most-liked-filter, .most-recent-filter').click(function () {
        var isActive = $(this).attr('active-filter') === 'true';
        $(this).attr('active-filter', isActive ? 'false' : 'true');
    });

    var blogContainer = $('.blog-content-container');
    var loader = $('.blog-list-loader img');
    var currentPage = 1;
    var isLoading = false;

    function fetchBlogPosts(params = {}) {
        if (isLoading) return;
        isLoading = true;

        // Start loader
        loader.show();

        // Render blog cards
        $.ajax({
            url: '/blogs/api/posts/',
            type: 'GET',
            data: { ...params, page: currentPage },
            success: function (response) {
                var blogCards = '';

                response.results.forEach(post => {
                    blogCards += renderBlogCards(post);
                });
                
                if (currentPage === 1) {
                    blogContainer.html(blogCards);
                } else {
                    blogContainer.append(blogCards);
                }

                currentPage++;
                
                // Check if there are more pages to load
                if (!response.links.next) {
                    console.log("No more pages to load");
                    $(window).off('scroll', scrollHandler);
                }
            },
            error: function (error) {
                console.log('Error fetching blog posts:', error);
            },
            complete: function () {
                // Stop loader
                loader.hide();
                isLoading = false;
            }
        });
    }

    function renderBlogCards(post) {

        // Render blog categories
        function blogCategories(post){
            var categories = '';
            post.categories.forEach(category => {
                categories += `<span class="blog-category">${category}</span>`;
            });
            return categories;
        }

        // Render blog card
        return `
            <div class="col-md-6 col-lg-4">
                <a href="${post.url}">
                    <div class="blog-card mb-5">
                        <div class="blog-img">
                            <img loading="lazy" src="${post.banner_image}" alt="${post.title}"/>
                        </div>
                        <div class="blog-content">
                            ${blogCategories(post)}
                            <h5 class="blog-title">${post.title}</h5>
                            <p class="blog-excerpt mt-3">${post.subtitle}</p>
                            <div class="blog-info mt-4">
                                <span class="blog-likes">${post.total_likes} likes</span>
                                <span class="blog-views">${post.total_read_count} views</span>
                                <span class="blog-read-time">${post.estimated_read_time} Mins Read</span>
                                <span class="blog-create-date">${post.created_at}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `
    }

    function scrollHandler() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            fetchBlogPosts();
        }
    }

    // Initial load
    fetchBlogPosts();

    // Attach scroll event handler
    $(window).on('scroll', scrollHandler);
});
