// filter icon //
$(document).ready(function () {


    var blogContainer = $('.blog-content-container');
    var loader = $('.blog-list-loader img');
    var currentPage = 1;
    var isLoading = false;

    // Filter click event
    $('  .most-read-filter, .most-liked-filter, .most-recent-filter, .blog-category-select-filter').click(function () { 
        // Remove active class from all filter    
        var isActive = $(this).attr('active-filter') === 'true';
        $(this).attr('active-filter', isActive ? 'false' : 'true');

        // Filter data
        var filterData = {}

        // Get category filter value
        if ($(".blog-category-select-filter").attr('filter-name') === 'category') {
            filterData.category = $(".blog-category-select-filter").val();
        }

        // Get most read filter value
        if ($(".most-read-filter").attr('filter-name') === 'most-read') {
            filterData.most_read = $(".most-read-filter").attr('active-filter') === 'true' ? true : false;
        }

        // Get most liked filter value
        if ($(".most-liked-filter").attr('filter-name') === 'most-liked') {
            filterData.most_liked = $(".most-liked-filter").attr('active-filter') === 'true' ? true : false;
        }

        // Get most recent filter value
        if ($(".most-recent-filter").attr('filter-name') === 'most-recent') {
            filterData.most_recent = $(".most-recent-filter").attr('active-filter') === 'true' ? true : false;
        }

        filterData.page = 1

        // Fetch blog posts
        fetchBlogPosts(filterData);
    });


    function fetchBlogPosts(params = {}) {
        if (isLoading) return;
        isLoading = true;

        // Start loader
        loader.show();

        // Render blog cards
        $.ajax({
            url: '/blogs/api/posts/',
            type: 'GET',
            data: { page: currentPage, ...params },
            success: function (response) {
                var blogCards = '';

                response.results.forEach(post => {
                    blogCards += renderBlogCards(post);
                });
                
                if (currentPage === 1 || params.page === 1) {
                    blogContainer.html(blogCards);
                } else {
                    blogContainer.append(blogCards);
                }

                currentPage++;
                
                // Check if there are more pages to load
                if (!response.links.next) {
                    $('.no-more-blogs').removeClass('d-none');
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
                <a href="/blogs/${post.slug}">
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
