"use strict";

(function () {
  // Detect if we're on map view page and use appropriate template
  const isMapView = window.location.pathname.includes("search-with-map") || window.page_view === "map-list";
  const templateId = isMapView ? "property-card-map-view-template" : "property-card-template";
  const template = document.getElementById(templateId);
  if (!template || !template.content || !template.content.firstElementChild) {
    window.PropertyCardFactory = null;
    return;
  }

  const defaultAvatar = "/static/media/default-avatar.jpg";
  const defaultPropertyImage = "/static/media/background/home-page-bg.webp";

  const withImageFallback = (img, fallback) => {
    if (!img) return;
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied === "true") return;
      img.dataset.fallbackApplied = "true";
      img.src = fallback;
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "฿ 0";
    if (typeof window.formatBalance === "function") {
      return `฿ ${window.formatBalance(Math.floor(Number(value)))}`;
    }
    return `฿ ${Math.floor(Number(value)).toLocaleString()}`;
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatRelativeDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffDays === 0) {
      return "today";
    } else if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffWeeks === 1) {
      return "1 week ago";
    } else if (diffWeeks < 4) {
      return `${diffWeeks} weeks ago`;
    } else if (diffMonths === 1) {
      return "1 month ago";
    } else if (diffMonths < 12) {
      return `${diffMonths} months ago`;
    } else {
      // Fallback to formatted date if older than a year
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  const formatPropertyType = (buildingType, buildingSubType) => {
    if (!buildingType) return null;
    const typeMap = {
      'residence': 'Residential',
      'commercial': 'Commercial',
      'mixed': 'Mixed Use',
    };
    const type = typeMap[buildingType] || buildingType.charAt(0).toUpperCase() + buildingType.slice(1);
    return buildingSubType ? `${type} - ${buildingSubType}` : type;
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const buildBadges = (property, container) => {
    container.innerHTML = "";
    if (!property) {
      container.classList.add("hidden");
      return;
    }
    const fragments = document.createDocumentFragment();

    // Enhanced badges with Rightmove-inspired styling
    if (property.tag === "spotlight") {
      const badge = document.createElement("span");
      badge.className = "rounded-full border-2 border-discounted bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
      badge.textContent = "Flash Sale";
      fragments.appendChild(badge);
    }
    if (property.tag === "feature") {
      const badge = document.createElement("span");
      badge.className = "rounded-full border-2 border-featured bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
      badge.textContent = "Featured Listing";
      fragments.appendChild(badge);
    }
    if (property.tag === "newly_created") {
      const badge = document.createElement("span");
      badge.className = "rounded-full border-2 border-primary bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
      badge.textContent = "New Home";
      fragments.appendChild(badge);
    }
    if (property.discount_period) {
      const countdown = document.createElement("div");
      countdown.className = "rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur";
      countdown.dataset.dateCount = property.discount_period;
      fragments.appendChild(countdown);
    }

    if (!fragments.childNodes.length) {
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");
    container.appendChild(fragments);
  };

  const buildFeatures = (property, container) => {
    container.innerHTML = "";
    if (!property) return;
    const features = [];
    if (property.have_freehold) features.push({text: "Freehold", icon: "bi-shield-check"});
    if (property.have_leasehold) features.push({text: "Leasehold", icon: "bi-calendar"});
    if (property.construction_year) features.push({text: `Built ${property.construction_year}`, icon: "bi-calendar3"});
    if (property.quota) features.push({text: `${property.quota} Quota`, icon: "bi-ticket-perforated"});
    if (property.distance_from_location_to_BTS_or_MRT) features.push({text: `BTS/MRT ${property.distance_from_location_to_BTS_or_MRT}km`, icon: "bi-train-front"});
    if (property.distance_from_location_to_ARL) features.push({text: `ARL ${property.distance_from_location_to_ARL}km`, icon: "bi-train-front"});
    if (property.have_pets_allowed) features.push({text: "Pet Friendly", icon: "bi-heart"});
    if (property.view) features.push({text: property.view, icon: "bi-eye"});
    if (property.have_infinity_pool) features.push({text: "Infinity Pool", icon: "bi-water"});
    if (property.have_fitness_area) features.push({text: "Gym", icon: "bi-dumbbell"});
    if (property.have_sky_lounge) features.push({text: "Sky Lounge", icon: "bi-building"});

    if (!features.length) return;
    const fragment = document.createDocumentFragment();
    features.forEach((feature) => {
      const chip = document.createElement("span");
      chip.className = "inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-primary";
      const icon = document.createElement("i");
      icon.className = `bi ${feature.icon} text-xs`;
      chip.appendChild(icon);
      const text = document.createTextNode(feature.text);
      chip.appendChild(text);
      fragment.appendChild(chip);
    });
    container.appendChild(fragment);
  };

  const loaderSlide = () => {
    const li = document.createElement("li");
    li.className = "splide__slide search-result-box-img-loader";
    li.innerHTML = '<div class="flex h-full items-center justify-center bg-muted"><div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>';
    return li;
  };

  const emptySlide = () => {
    const li = document.createElement("li");
    li.className = "splide__slide";
    li.innerHTML = '<div class="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">No images available</div>';
    return li;
  };

  const createImageSlide = (src, alt = "Property image") => {
    const li = document.createElement("li");
    li.className = "splide__slide";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.className = "h-full w-full object-cover";
    withImageFallback(img, defaultPropertyImage);
    li.appendChild(img);
    return li;
  };

  const resolveImages = (property) => {
    if (!property) return [];
    const list = Array.isArray(property.default_images) ? property.default_images.slice() : [];
    if (!list.length && property.default_image) {
      list.push({ file: property.default_image });
    }
    return list;
  };

  const createThumbnail = (src, alt = "Property thumbnail", index = 0) => {
    const div = document.createElement("div");
    div.className = "h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-white/80 bg-muted shadow-sm transition hover:border-white hover:scale-105 cursor-pointer";
    div.dataset.thumbnailIndex = index + 1; // +1 because first image is main
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.className = "h-full w-full object-cover";
    withImageFallback(img, defaultPropertyImage);
    div.appendChild(img);
    return div;
  };

  const populateThumbnails = (container, property) => {
    if (!container) return;
    container.innerHTML = "";
    // Use images field for featured/discounted properties, otherwise use default_images
    const allImages = resolveImages(property);
    const images = property.images && property.images.length > 0 
      ? property.images.slice(0, 3)
      : allImages.slice(1, 4); // Skip first image (main image)
    
    if (images.length === 0) {
      container.classList.add("hidden");
      return;
    }
    
    container.classList.remove("hidden");
    const fragment = document.createDocumentFragment();
    images.forEach((image, index) => {
      const imgSrc = typeof image === 'string' ? image : (image.file || image);
      fragment.appendChild(createThumbnail(imgSrc, `Property view ${index + 1}`, index));
    });
    container.appendChild(fragment);
  };

  const populateGallery = (listElement, property, loaderThreshold) => {
    if (!listElement) return;
    listElement.innerHTML = "";
    const images = resolveImages(property);
    listElement.dataset.propertyId = property?.id || "";
    if (!images.length) {
      listElement.dataset.imagesNextPage = "";
      listElement.appendChild(emptySlide());
      return;
    }
    const fragment = document.createDocumentFragment();
    images.forEach((image) => fragment.appendChild(createImageSlide(image.file, property?.title || "Property image")));
    listElement.appendChild(fragment);
    if (loaderThreshold && images.length >= loaderThreshold) {
      listElement.dataset.imagesNextPage = "2";
      listElement.appendChild(loaderSlide());
    } else {
      listElement.dataset.imagesNextPage = "";
    }
    
    // Update image count indicator
    const card = listElement.closest("[data-property-card]");
    if (card) {
      const imageCountElement = card.querySelector("[data-card-image-count]");
      const imageCountText = card.querySelector("[data-image-count-text]");
      if (imageCountElement && imageCountText && images.length > 1) {
        imageCountText.textContent = images.length;
        imageCountElement.classList.remove("hidden");
      } else if (imageCountElement) {
        imageCountElement.classList.add("hidden");
      }
    }
  };

  const defaultOptions = () => ({
    userType: window.user_type || null,
    favoriteEffect: localStorage.getItem("favorite-effect") || "pulse",
    loaderThreshold: window.innerWidth <= 768 ? 1 : 2,
    showActions: !window.user_type || window.user_type === "prospect",
    showSchedule: true,
    showContact: true,
    scheduleUrl: (property) => `/schedule/create_schedule/?type=property&id=${property?.id ?? ""}`,
    contactEmail: (property) => property?.developer_email || null,
  });

  const createCard = (property = {}, options = {}) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const config = Object.assign(defaultOptions(), options);

    card.dataset.propertyId = property.id || "";
    if (property.tag) card.dataset.propertyTag = property.tag;
    // Apply styling to the entire card based on tag
    if (property.tag === "spotlight") {
      card.classList.add("property-spotlight");
    } else if (property.tag === "feature") {
      card.classList.add("property-featured");
      // Show brand color accent bar for featured properties
      const featuredAccent = card.querySelector("[data-card-featured-accent]");
      if (featuredAccent) {
        featuredAccent.classList.remove("hidden");
      }
    }
    // Apply darker card style when property is in comparison
    if (property.is_compared) {
      card.classList.add("property-compared");
    }

    const cardActions = card.querySelector("[data-card-actions]");
    const favoriteButton = cardActions?.querySelector("[data-card-favorite]");
    const compareButton = cardActions?.querySelector("[data-card-compare]");
    if (!config.showActions || !favoriteButton || !compareButton) {
      cardActions?.classList.add("hidden");
    } else {
      cardActions.classList.remove("hidden");
      favoriteButton.setAttribute("index", property.id || "");
      favoriteButton.setAttribute("effect", config.favoriteEffect || "pulse");
      favoriteButton.setAttribute("added", property.is_favorited ? "true" : "false");
      favoriteButton.innerHTML = `<i class="bi bi-${property.is_favorited ? "heart-fill" : "heart"}"></i><span class="sr-only">Favorite</span>`;
      compareButton.setAttribute("index", property.id || "");
      compareButton.setAttribute("effect", config.favoriteEffect || "pulse");
      compareButton.setAttribute("added", property.is_compared ? "true" : "false");
      compareButton.innerHTML = `<i class="bi bi-${property.is_compared ? "check2" : "arrow-left-right"}"></i><span class="sr-only">Compare</span>`;
    }

    const badgeContainer = card.querySelector("[data-card-badges]");
    if (badgeContainer) buildBadges(property, badgeContainer);

    const splideElement = card.querySelector("[data-card-splide]");
    const galleryList = card.querySelector("[data-card-gallery]");
    const thumbnailsContainer = card.querySelector("[data-card-thumbnails]");
    if (splideElement) {
      splideElement.dataset.splideId = property.id || "";
    }
    populateGallery(galleryList, property, config.loaderThreshold);
    // Populate thumbnails for featured/discounted properties (will be connected to splide after mount)
    if (thumbnailsContainer && (property.tag === "feature" || property.tag === "spotlight")) {
      populateThumbnails(thumbnailsContainer, property);
      // Store property data for later splide connection
      thumbnailsContainer.dataset.propertyId = property.id || "";
    } else if (thumbnailsContainer) {
      thumbnailsContainer.classList.add("hidden");
    }

    // Price Display (Enhanced) - Handle both regular and map-view templates
    const priceElement = card.querySelector("[data-card-price]");
    const priceSqmElement = card.querySelector("[data-card-price-sqm]");
    const originalPriceElement = card.querySelector("[data-card-original-price]");
    const discountAmountElement = card.querySelector("[data-card-discount-amount]");
    const priceContainer = card.querySelector("[data-card-price-container]");
    
    if (priceElement) priceElement.textContent = formatCurrency(property.price);
    if (priceSqmElement) priceSqmElement.textContent = property.price_per_sqm ? `${formatCurrency(property.price_per_sqm)} / sqm` : "—";
    
    // Show original price and discount if discounted
    if (property.original_price && property.original_price > property.price) {
      const discount = property.original_price - property.price;
      const discountPercent = Math.round((discount / property.original_price) * 100);
      
      if (originalPriceElement) {
        originalPriceElement.textContent = formatCurrency(property.original_price);
        originalPriceElement.classList.remove("hidden");
      }
      if (discountAmountElement) {
        discountAmountElement.textContent = `Save ${formatCurrency(discount)} (${discountPercent}% off)`;
        discountAmountElement.classList.remove("hidden");
      }
      if (priceContainer) {
        priceContainer.classList.add("border-brand-teal/50");
      }
    } else {
      if (originalPriceElement) originalPriceElement.classList.add("hidden");
      if (discountAmountElement) discountAmountElement.classList.add("hidden");
    }
    
    // Map-view specific: Tag display in section 3
    const tagDisplay = card.querySelector("[data-card-tag-display]");
    if (tagDisplay) {
      if (property.tag === "spotlight") {
        tagDisplay.textContent = "Spotlight";
        tagDisplay.classList.remove("hidden");
      } else if (property.tag === "feature") {
        tagDisplay.textContent = "Featured";
        tagDisplay.classList.remove("hidden");
      } else if (property.tag === "newly_created") {
        tagDisplay.textContent = "New";
        tagDisplay.classList.remove("hidden");
      }
    }
    
    // Map-view specific: Completion date wrapper
    const completionWrapper = card.querySelector("[data-card-completion-wrapper]");
    if (completionWrapper && property.construction_year) {
      completionWrapper.classList.remove("hidden");
    }

    // Make entire card clickable (except buttons)
    let detailUrl = `/property/details/${property.id ?? ""}/`;
    if (property.tag === "spotlight") detailUrl += "?discounted=True";
    else if (property.tag === "feature") detailUrl += "?featured=True";
    
    // Set link href for title/location link
    const link = card.querySelector("[data-card-link]");
    if (link) {
      link.href = detailUrl;
    }
    
    // Make card clickable - click anywhere on card goes to detail page
    card.addEventListener("click", (e) => {
      // Don't navigate if clicking on buttons, links, or interactive elements
      const isInteractive = e.target.closest("button, a, [data-card-compare], [data-card-favorite], [data-card-contact-btn], [data-card-3d], [data-card-drone], [data-card-schedule], [data-card-media-buttons] a");
      if (!isInteractive && detailUrl) {
        window.location.href = detailUrl;
      }
    });
    
    // Prevent card click when clicking on buttons
    const allButtons = card.querySelectorAll("button, a[data-card-schedule], a[data-card-media-buttons]");
    allButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });

    const title = card.querySelector("[data-card-title]");
    if (title) title.textContent = property.building_title || property.title || "Untitled property";

    // Property Type Badge (handled above in the new location)

    const address = card.querySelector("[data-card-address]");
    if (address) address.textContent = property.address || "N/A";

    // Property Description (will be shown/hidden by responsive CSS)
    const description = card.querySelector("[data-card-description]");
    if (description) {
      if (property.description) {
        description.textContent = truncateText(property.description, 120);
        // Don't force show/hide here - let responsive CSS handle it
      } else {
        description.classList.add("hidden");
      }
    }

    // Stats section (map-view) - handle all stats elements
    const beds = card.querySelector("[data-card-beds]");
    if (beds) beds.textContent = property.number_of_bedroom || "—";

    const baths = card.querySelector("[data-card-baths]");
    if (baths) baths.textContent = property.number_of_bathroom || "—";

    // Size for overlay (if exists) - just number
    const size = card.querySelector("[data-card-size]");
    if (size) {
      const area = property.unit_area ? property.unit_area.toString() : "—";
      size.textContent = area;
    }

    // Size display for stats section
    const sizeDisplay = card.querySelector("[data-card-size-display]");
    if (sizeDisplay) {
      const area = property.unit_area ? `${property.unit_area}` : "—";
      sizeDisplay.textContent = area;
    }
    
    // Floor number (for map-view stats section)
    const floorWrapper = card.querySelector("[data-card-floor-wrapper]");
    const floorNumber = card.querySelector("[data-card-floor-number]");
    if (floorWrapper && floorNumber) {
      if (property.floor_number) {
        floorNumber.textContent = property.floor_number;
        floorWrapper.classList.remove("hidden");
      } else {
        floorWrapper.classList.add("hidden");
      }
    }
    
    // Parking (for map-view stats section)
    const parkingWrapper = card.querySelector("[data-card-parking-wrapper]");
    const parking = card.querySelector("[data-card-parking]");
    if (parkingWrapper && parking) {
      if (property.number_of_car_parking && property.number_of_car_parking > 0) {
        parking.textContent = property.number_of_car_parking;
        parkingWrapper.classList.remove("hidden");
      } else {
        parkingWrapper.classList.add("hidden");
      }
    }
    
    // Property type (for map-view stats section)
    const propertyTypeWrapper = card.querySelector("[data-card-property-type-wrapper]");
    const propertyTypeStats = card.querySelector("[data-card-property-type-stats]");
    if (propertyTypeWrapper && propertyTypeStats) {
      const typeText = formatPropertyType(property.building_type, property.building_sub_type);
      if (typeText) {
        propertyTypeStats.textContent = typeText;
        propertyTypeWrapper.classList.remove("hidden");
      } else {
        propertyTypeWrapper.classList.add("hidden");
      }
    }

    const floor = card.querySelector("[data-card-floor]");
    if (floor) {
      floor.textContent = property.floor_number ? `Floor ${property.floor_number}` : "Floor —";
    }

    // Property Type Display - Clean inline
    const propertyType = card.querySelector("[data-card-property-type]");
    if (propertyType) {
      const typeText = formatPropertyType(property.building_type, property.building_sub_type);
      if (typeText) {
        propertyType.textContent = typeText;
      } else {
        propertyType.textContent = "—";
      }
    }

    // Completion Year
    const completion = card.querySelector("[data-card-completion]");
    const completionSeparator = card.querySelector("[data-card-completion-separator]");
    if (completion && property.construction_year) {
      completion.textContent = property.construction_year;
      if (completionSeparator) completionSeparator.classList.remove("hidden");
      completion.parentElement.classList.remove("hidden");
    } else if (completion) {
      if (completionSeparator) completionSeparator.classList.add("hidden");
      completion.parentElement.classList.add("hidden");
    }

    const features = card.querySelector("[data-card-features]");
    if (features) buildFeatures(property, features);

    // View Buttons Container (3D Tour, Aerial View, etc.) - Next to each other
    const viewButtonsContainer = card.querySelector("[data-card-view-buttons]");
    
    // 3D Tour Badge - Prominent placement (key differentiator)
    const threeDBadge = card.querySelector("[data-card-3d-badge]");
    const threeDButton = card.querySelector("[data-card-3d]");
    if (threeDBadge && threeDButton) {
      if (property.interior_view) {
        threeDBadge.classList.remove("hidden");
        threeDButton.dataset.card3d = property.interior_view;
        threeDButton.setAttribute("data-3d-view", property.interior_view);
      } else {
        threeDBadge.classList.add("hidden");
      }
    }

    // Aerial View Badge - Next to 3D Tour
    const droneBadge = card.querySelector("[data-card-drone-badge]");
    const droneButton = card.querySelector("[data-card-drone]");
    if (droneBadge && droneButton) {
      if (property.ariel_view) {
        droneBadge.classList.remove("hidden");
        droneButton.dataset.cardDrone = property.ariel_view;
        droneButton.setAttribute("data-drone-view", property.ariel_view);
      } else {
        droneBadge.classList.add("hidden");
      }
    }
    
    // Hide view buttons container if no views are available
    if (viewButtonsContainer) {
      const hasAnyView = (threeDBadge && !threeDBadge.classList.contains("hidden")) || 
                         (droneBadge && !droneBadge.classList.contains("hidden"));
      if (!hasAnyView) {
        viewButtonsContainer.classList.add("hidden");
      } else {
        viewButtonsContainer.classList.remove("hidden");
      }
    }

    // Developer/Agent Header Section
    const developerImage = card.querySelector("[data-card-developer-image]");
    const developerIconFallback = card.querySelector("[data-card-developer-icon-fallback]");
    if (developerImage) {
      developerImage.src = property.developer_image || defaultAvatar;
      withImageFallback(developerImage, defaultAvatar);
      // Show icon fallback if image fails
      developerImage.addEventListener("error", () => {
        if (developerIconFallback) {
          developerIconFallback.classList.remove("hidden");
          developerImage.classList.add("hidden");
        }
      });
      // Hide icon fallback if image loads successfully
      developerImage.addEventListener("load", () => {
        if (developerIconFallback) {
          developerIconFallback.classList.add("hidden");
          developerImage.classList.remove("hidden");
        }
      });
    }

    const developerName = card.querySelector("[data-card-developer-name]");
    if (developerName) developerName.textContent = property.developer_company_name || "N/A";

    const developerCompany = card.querySelector("[data-card-developer-company]");
    if (developerCompany) {
      // Show company name if available, otherwise hide the line
      const companyText = property.developer_company_name || "";
      if (companyText) {
        developerCompany.textContent = companyText;
        developerCompany.classList.remove("hidden");
      } else {
        developerCompany.classList.add("hidden");
      }
    }

    // Contact Button in Header - Links to property detail page
    const contactButton = card.querySelector("[data-card-contact-btn]");
    if (contactButton) {
      const detailUrl = `/property/details/${property.id ?? ""}/`;
      contactButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = detailUrl;
      };
      // Always show contact button - it goes to detail page where they can contact
      contactButton.classList.remove("hidden");
    }

    // Date handling - check if map-view template (has data-card-date-relative)
    const dateRelativeContainer = card.querySelector("[data-card-date-relative]");
    const dateValue = card.querySelector("[data-card-date-value]");
    const dateLabel = card.querySelector("[data-card-date-label]");
    const created = card.querySelector("[data-card-created]");
    
    if (dateRelativeContainer && dateValue && dateLabel) {
      // Map-view: Use relative date format
      let dateToUse = property.created_at;
      let labelText = "Added";
      
      // Check if property was recently updated (within last 7 days) to show "Reduced"
      if (property.updated_at && property.updated_at !== property.created_at) {
        const updatedDate = new Date(property.updated_at);
        const createdDate = new Date(property.created_at);
        const daysDiff = (updatedDate - createdDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1 && daysDiff < 7) {
          labelText = "Reduced";
          dateToUse = property.updated_at;
        }
      }
      
      dateLabel.textContent = labelText;
      dateValue.textContent = formatRelativeDate(dateToUse);
    } else if (created && dateLabel) {
      // Regular view: Use formatted date
      created.textContent = formatDate(property.created_at);
      // Check if property was recently updated (within last 7 days) to show "Reduced on"
      if (property.updated_at && property.updated_at !== property.created_at) {
        const updatedDate = new Date(property.updated_at);
        const createdDate = new Date(property.created_at);
        const daysDiff = (updatedDate - createdDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1 && daysDiff < 7) {
          dateLabel.textContent = "Reduced on";
          created.textContent = formatDate(property.updated_at);
        } else {
          dateLabel.textContent = "Added on";
        }
      } else {
        dateLabel.textContent = "Added on";
      }
    }

    // Developer Phone Number
    const developerPhone = card.querySelector("[data-card-developer-phone]");
    if (developerPhone && property.developer_phone_number) {
      developerPhone.href = `tel:${property.developer_phone_number}`;
      developerPhone.textContent = property.developer_phone_number;
      developerPhone.classList.remove("hidden");
    } else if (developerPhone) {
      developerPhone.classList.add("hidden");
    }

    // Media & Action Buttons
    const mediaButtonsContainer = card.querySelector("[data-card-media-buttons]");
    if (mediaButtonsContainer) {
      const fragments = document.createDocumentFragment();
      const buttonClass = "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition hover:border-accent/60 hover:bg-accent/10 hover:text-accent touch-manipulation min-h-[36px] sm:min-h-[40px] sm:px-3 sm:py-1.5 sm:text-xs";

      // Images
      if (property.total_default_images > 0) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=image`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-images text-accent"></i><span>Images</span>';
        fragments.appendChild(btn);
      }

      // Unit Plans
      if (property.has_unit_plans) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=unit_floor_plan`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-file-earmark-image text-accent"></i><span>Unit Plans</span>';
        fragments.appendChild(btn);
      }

      // Master Plan
      if (property.has_master_plan) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=master_plan`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-diagram-3 text-accent"></i><span>Master Plan</span>';
        fragments.appendChild(btn);
      }

      // Video
      if (property.has_video) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=video`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-play-circle text-accent"></i><span>Video</span>';
        fragments.appendChild(btn);
      }

      // Interior 360°
      if (property.interior_view) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=interior_view`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-360 text-accent"></i><span>Interior 360°</span>';
        fragments.appendChild(btn);
      }

      // Facilities
      if (property.facility_view) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=facility_view`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-building text-accent"></i><span>Facilities</span>';
        fragments.appendChild(btn);
      }

      // Aerial (already shown as button above, but can add here too if needed)
      if (property.ariel_view) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery=aerial_drone_video`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-camera-video text-accent"></i><span>Aerial</span>';
        fragments.appendChild(btn);
      }

      // View Gallery
      if (property.total_default_images > 0 || property.has_unit_plans || property.has_master_plan || property.has_video || property.interior_view || property.facility_view || property.ariel_view) {
        const btn = document.createElement("a");
        btn.href = `${detailUrl}#gallery`;
        btn.className = buttonClass;
        btn.innerHTML = '<i class="bi bi-grid-3x3-gap text-accent"></i><span>View gallery</span>';
        fragments.appendChild(btn);
      }

      if (fragments.childNodes.length > 0) {
        mediaButtonsContainer.appendChild(fragments);
      } else {
        mediaButtonsContainer.classList.add("hidden");
      }
    }

    const scheduleButton = card.querySelector("[data-card-schedule]");
    if (scheduleButton) {
      const scheduleHref = typeof config.scheduleUrl === "function" ? config.scheduleUrl(property) : config.scheduleUrl;
      if (config.showSchedule && scheduleHref) {
        scheduleButton.href = scheduleHref;
        scheduleButton.classList.remove("hidden");
      } else {
        scheduleButton.classList.add("hidden");
      }
    }

    // Contact button removed - users can contact via detail page

    return card;
  };

  window.PropertyCardFactory = {
    createCard,
    formatCurrency,
  };
})();
