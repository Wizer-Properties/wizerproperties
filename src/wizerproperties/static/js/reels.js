$(function () {
  function loaderTemplate() {
    return (
      '<div class="splide__slide reel-slide loader-slide">' +
      '<article class="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">' +
      '<div class="aspect-[9/16] w-full animate-pulse bg-muted"></div>' +
      '<div class="flex flex-1 flex-col gap-3 p-4">' +
      '<div class="space-y-2">' +
      '<span class="block h-4 w-3/4 rounded bg-muted"></span>' +
      '<span class="block h-3 w-1/2 rounded bg-muted/80"></span>' +
      "</div>" +
      '<span class="block h-3 w-1/3 rounded bg-muted/70"></span>' +
      "</div>" +
      "</article>" +
      "</div>"
    );
  }

  function embedTemplate(data) {
    if (!data || !data.social_media || !data.url) return "";
    if (data.social_media === "youtube") {
      var parts = data.url.split("/");
      var videoId = parts[parts.length - 1];
      var embedUrl = "https://youtube.com/embed/" + videoId;
      return '<iframe class="h-full w-full" src="' + embedUrl + '" title="YouTube video" frameborder="0" allowfullscreen></iframe>';
    }
    if (data.social_media === "titTok") {
      var tiktokParts = data.url.split("/video/");
      var tiktokId = tiktokParts[1];
      var tiktokEmbed = "https://www.tiktok.com/embed/v2/" + tiktokId;
      return '<iframe class="h-full w-full" src="' + tiktokEmbed + '" title="TikTok video" frameborder="0" allowfullscreen></iframe>';
    }
    if (data.social_media === "instagram") {
      var instaParts = data.url.split("/");
      var code = instaParts[4];
      var instaEmbed = "https://www.instagram.com/p/" + code + "/embed/";
      return '<iframe class="h-full w-full" src="' + instaEmbed + '" title="Instagram video" frameborder="0" allowfullscreen></iframe>';
    }
    return '<iframe class="h-full w-full" src="' + data.url + '" title="Video" frameborder="0" allowfullscreen></iframe>';
  }

  function reelTemplate(data) {
    var agent = data && data.user ? data.user.agent : null;
    var developer = data && data.user ? data.user.developer : null;
    var manager = agent || developer;
    var managerName = manager && manager.company_name ? manager.company_name : "Wizerproperties partner";
    var categoryLabel = data && data.category ? data.category : "Reel";

    return (
      '<div class="splide__slide reel-slide">' +
      '<article class="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg">' +
      '<div class="relative aspect-[9/16] w-full overflow-hidden bg-muted">' +
      embedTemplate(data) +
      "</div>" +
      '<div class="flex flex-1 flex-col gap-4 p-4">' +
      '<div class="space-y-1">' +
      '<p class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">' +
      categoryLabel +
      "</p>" +
      '<h3 class="text-base font-semibold text-foreground">' +
      (data && data.property_title ? data.property_title : "Property reel") +
      "</h3>" +
      '<p class="text-xs text-muted-foreground">Managed by ' +
      managerName +
      "</p>" +
      "</div>" +
      '<div class="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">' +
      '<span class="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">' +
      '<span class="size-2.5 rounded-full bg-primary"></span>' +
      (data && data.social_media ? data.social_media.charAt(0).toUpperCase() + data.social_media.slice(1) : "Platform") +
      "</span>" +
      '<a href="/property/details/' +
      (data && data.property ? data.property : "") +
      '/" class="btn-secondary min-w-[140px] justify-center text-xs">View listing</a>' +
      "</div>" +
      "</div>" +
      "</article>" +
      "</div>"
    );
  }

  var reelsSlider = new Splide(".reels-slider", {
    perPage: 4,
    gap: 20,
    pagination: false,
    breakpoints: {
      1200: { perPage: 3 },
      992: { perPage: 2 },
      640: { perPage: 1 },
    },
  }).mount();

  var reelsNext;
  var isLoadingReels = false;
  var selectedCategory = "";
  var categoryTriggered = false;
  var firstLoad = true;

  function resetFilterStyles() {
    $(".reels-filter-btns button")
      .removeClass("activate")
      .removeClass("bg-primary text-primary-foreground border-primary shadow")
      .addClass("border-border bg-card text-foreground");
  }

  function setFilterActive($button) {
    resetFilterStyles();
    $button.addClass("activate bg-primary text-primary-foreground border-primary shadow");
  }

  function clearSlides() {
    reelsSlider.remove(".reel-slide");
  }

  function appendLoaderSlides(count) {
    for (var i = 0; i < count; i++) {
      reelsSlider.add(loaderTemplate());
    }
  }

  function removeLoaderSlides() {
    reelsSlider.remove(".loader-slide");
  }

  function updateEmptyState(hasResults) {
    if (hasResults) {
      $(".no-reels").html("");
    } else {
      $(".no-reels").html('<p class="py-12 text-sm text-muted-foreground">No reels available for this category yet.</p>');
    }
  }

  function fetchReels(nextPage) {
    if (isLoadingReels) return;

    var pageSize = 4;
    if (window.innerWidth <= 1200) pageSize = 3;
    if (window.innerWidth <= 768) pageSize = 2;
    if (window.innerWidth <= 480) pageSize = 1;

    isLoadingReels = true;

    $.ajax({
      url: "/advertise/api/reel/suggested/",
      type: "GET",
      data: {
        page_size: pageSize,
        page: nextPage,
        category: selectedCategory || undefined,
      },
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        if (categoryTriggered) {
          clearSlides();
        }
        appendLoaderSlides(pageSize);
      },
      success: function (response) {
        isLoadingReels = false;
        var results = response && response.results ? response.results : [];

        if (firstLoad && (!response || response.count === 0)) {
          updateEmptyState(false);
          clearSlides();
          removeLoaderSlides();
          reelsNext = null;
          return;
        }

        firstLoad = false;
        updateEmptyState(results.length > 0);

        results.forEach(function (reel) {
          reelsSlider.add(reelTemplate(reel));
        });

        removeLoaderSlides();

        if (response && response.next) {
          appendLoaderSlides(pageSize);
        }

        reelsNext = response ? response.next : null;
        categoryTriggered = false;
      },
      error: function (error) {
        console.error(error);
        isLoadingReels = false;
        categoryTriggered = false;
        removeLoaderSlides();
      },
    });
  }

  fetchReels();

  reelsSlider.on("moved", function (newIndex) {
    if (!reelsNext) return;
    var totalSlides = reelsSlider.length;
    if (newIndex >= totalSlides - reelsSlider.options.perPage - 1) {
      fetchReels(reelsNext);
    }
  });

  $(document).on("click", ".reels-filter-btns button", function () {
    var $button = $(this);
    var alreadyActive = $button.hasClass("bg-primary");

    if (alreadyActive && selectedCategory === $button.val()) {
      selectedCategory = "";
      setFilterActive($(".reels-filter-btns button[value='']"));
    } else {
      selectedCategory = $button.val();
      setFilterActive($button);
    }

    categoryTriggered = true;
    firstLoad = true;
    reelsNext = null;
    fetchReels();
  });
});
$(document).ready(function(){
    function loader_tmp(){
        return  '<div class="splide__slide comparison-slider-box list_loader">'+
                    '<div class="comparison-img-icon-box">'+
                        '<span class="skeleton-box" style="width: 100%; height: 180px; border-radius: 10px;"></span>'+
                    '</div>'+
                    '<div class="comparison-list-label">'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 12px;"></span> </li>'+
                        '<li> <span class="skeleton-box" style="width: 100%; height: 70px;"></span> </li>'+
                    '</div>'+
                '</div>'
    };
    
    function reels_iframe_tmp(data){
        if(data?.social_media == 'youtube'){
            var parts = data.url.split('/');
            var videoId = parts[parts.length - 1];
            var embedUrl = `https://youtube.com/embed/${videoId}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == "titTok"){
            var parts = data.url.split('/video/');
            var embedUrl = `https://www.tiktok.com/embed/v2/${parts[1]}`;
            return '<iframe height="520" src="'+embedUrl+'" frameborder="0"></iframe>';
        };

        if(data?.social_media == 'instagram'){
            var parts = data.url.split('/');
            return '<iframe height="520" src="https://www.instagram.com/p/'+parts[4]+'/embed/" frameborder="0"></iframe>';
        };

        return data?.url;
    };

    function reels_tmp (data){
        var company_data;
        if(data?.user?.agent){
            company_data = data?.user?.agent;
        }else{
            company_data = data?.user?.developer;
        };

        return( '<div class="reels-box-wrapper secion-space">'+
                    '<div class="reels-iframe-and-data">'+
                        reels_iframe_tmp(data)+
                    '</div>'+
                    '<div class="reels-developer-info mt-2 p-4">'+
                        '<div class="reels-title">'+ data?.property_title+'</div>'+
                        '<div class="reels-developer-logo d-flex flex-column justify-content-start w-100">'+
                            '<p class="mb-0 pb-0 manged-by-text">Managed by</p>'+
                            '<h1 class="m-0">'+company_data?.company_name+'</h1>'+
                        '</div>'+
        
                        '<div class="reels-visit-btn mt-3">' +
                            '<a href="/property/details/' + data?.property + '/" class="custom-button">' +
                            'Visit Property ' +
                            '<i class="bi bi-box-arrow-up-right arrow-icon"></i>' +
                            '</a>' +
                        '</div>'+
                    '</div>'+
                '</div>'
        )
    }


    var reels_slider = new Splide( '.reels-slider', {
        perPage: 4,
        gap : 20,
        pagination: false,
        breakpoints: {
            1200: {
                perPage: 3,
            },
            1080: {
                perPage: 2,
            },
            768: {
                perPage: 1,
            }
        }
    }).mount();


    var reels_next;
    var calling_reels;
    var category;
    var is_category_btn_call;
    var first_time_reel_api_call = true;

    function get_reels_list(next_page){
        if(calling_reels) return;
        var page_size = 4;
        if(window.innerWidth <= 1200) page_size = 3;
        if(window.innerWidth <= 740) page_size = 2;
        if(window.innerWidth <= 460) page_size = 1;

        $.ajax({
            url: '/advertise/api/reel/suggested/',
            type: 'GET',
            data : {
                page_size : page_size,
                page : next_page,
                category : category
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                if(is_category_btn_call){
                    reels_slider.remove('.reels-slider .reels-box-wrapper');
                };

                for (let i = 0; i < page_size; i++) {
                    reels_slider.add(loader_tmp())
                };

                calling_reels = true;
            },
            success: function (data) {
                calling_reels = false;

                if(
                    first_time_reel_api_call &&
                    data?.count == 0
                ){
                    $('#engaging-reels').remove();
                    return;
                };

                first_time_reel_api_call = false;
                
                if(data?.count == 0){
                    $('.no-reels').html('<p class="my-5 py-5 text-center"> No reels available </p>')
                }else{
                    $('.no-reels').html('')
                };
                
                for (let i = 0; i < data?.results.length; i++) {
                    reels_slider.add(reels_tmp(data?.results[i]))
                };
                reel_detail()

                reels_slider.remove('.reels-slider .list_loader');

                if(data?.next != null){
                    for (let i = 0; i < page_size; i++) {
                        reels_slider.add(loader_tmp())
                    };
                };

                reels_next = data?.next;
                is_category_btn_call = false;
            },
            error: function (error) {
                calling_reels = false;
                is_category_btn_call = false;
            },
        });
    };

    get_reels_list();

    reels_slider.on( 'moved', (e) => {
        if(reels_next == null) return;
        get_reels_list(reels_next);
    });


    function reel_detail(){
        var all_reel_details = $('.reel-details');
        for (let i = 0; i < all_reel_details.length; i++) {
            if( all_reel_details[i].offsetHeight > 25){
                all_reel_details[i].parentNode.setAttribute("view-type", "less");
            }else{
                all_reel_details[i].parentNode?.querySelector('.reel-see-more-see-less')?.remove();
            };
        };
    };


    $(document).on('click', '.reels-filter-btns button', function(){
        is_category_btn_call = true;
        
        if($(this).hasClass('activate')){
            $('.reels-filter-btns button').removeClass('activate');
            category = null;
        }else{
            $('.reels-filter-btns button').removeClass('activate');
            $(this).addClass('activate');
            category = $(this).val();
        };
        
        get_reels_list()
    });
    


    $(document).on('click', '.reel-see-more-see-less', function(){
        var get_view_type = $(this).parents('p[view-type]').attr('view-type');
        if(get_view_type == 'less'){
            $(this).parents('p[view-type]').attr('view-type', 'more')
            $(this).text('See less')
        }else if(get_view_type == 'more'){
            $(this).parents('p[view-type]').attr('view-type', 'less')
            $(this).text('See more')
        };
    });


});