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


        
        
        
        
    // Like button click event
    $('.blog-like-btn').click(function () {
        var likeDone = $(this).attr('like-done') === 'true';

        // Toggle like-done attribute
        $(this).attr('like-done', likeDone ? 'false' : 'true');

        // Set unlike-done to false when like-done is true
        if (!likeDone) {
            $('.blog-unlike-btn').attr('unlike-done', 'false');
        }

        // Save state to localStorage
        localStorage.setItem('like-done', $(this).attr('like-done'));
        localStorage.setItem('unlike-done', $('.blog-unlike-btn').attr('unlike-done'));

        // Update the icons
        updateIcons();
    });

    // Unlike button click event
    $('.blog-unlike-btn').click(function () {
        var unlikeDone = $(this).attr('unlike-done') === 'true';

        // Toggle unlike-done attribute
        $(this).attr('unlike-done', unlikeDone ? 'false' : 'true');

        // Set like-done to false when unlike-done is true
        if (!unlikeDone) {
            $('.blog-like-btn').attr('like-done', 'false');
        }

        // Save state to localStorage
        localStorage.setItem('like-done', $('.blog-like-btn').attr('like-done'));
        localStorage.setItem('unlike-done', $(this).attr('unlike-done'));

        // Update the icons
        updateIcons();
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

    // Function to load the state from localStorage on page load
    function loadStateFromLocalStorage() {
        var likeDone = localStorage.getItem('like-done') || 'false';
        var unlikeDone = localStorage.getItem('unlike-done') || 'false';

        // Set the attributes based on localStorage
        $('.blog-like-btn').attr('like-done', likeDone);
        $('.blog-unlike-btn').attr('unlike-done', unlikeDone);

        // Update the icons based on the loaded state
        updateIcons();
    }

    // Load the state from localStorage when the page loads
    $(document).ready(function () {
        loadStateFromLocalStorage();
    });





    // ads //
    var data = [
        {
            property_id: 10,
            id: 9,
            property_image: "https://wizerproperties.com/media/property/images/Screenshot_from_2024-05-29_10-13-27.png"
        },
        {
            property_id: 4,
            id: 8,
            property_image: "https://wizerproperties.com/media/property/images/Screenshot_from_2024-03-04_10-19-21.png"
        }

    ];

    // Initialize the Splide slider
    var ads_banner_slider = new Splide('.ads-banner-slider', {
        perPage: 1,
        type: 'loop',
        arrows: false,
        pagination: false,
        autoplay: 'playing',
        interval: 3000
    });

    // Function to generate the ad banner HTML
    function ads_tmp(data) {
        return '<li class="splide__slide">' +
            '<div class="top-banner-img">' +
            '<a href="/property/details/' + data?.property_id + '/?ad_id=' + data?.id + '">' +
            '<img src="' + data?.property_image + '" alt="wip-ads">' +
            '</a>' +
            '</div>' +
            '</li>';
    }

    // Get the slider's track element
    var ads_slider_list = document.querySelector('.ads-banner-slider .splide__list');

    // Loop through the data and append each image to the slider
    data.forEach(function (item) {
        ads_slider_list.innerHTML += ads_tmp(item);
    });

    // Mount the slider after all images are added
    ads_banner_slider.mount();

});
