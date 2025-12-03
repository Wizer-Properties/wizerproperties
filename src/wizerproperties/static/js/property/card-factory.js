"use strict";

(function () {
  const template = document.getElementById("property-card-template");
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
    if (property.have_freehold) features.push("Freehold");
    if (property.have_leasehold) features.push("Leasehold");
    if (property.construction_year) features.push(`Built ${property.construction_year}`);
    if (property.quota) features.push(`${property.quota} Quota`);
    if (property.distance_from_location_to_BTS_or_MRT) features.push(`BTS/MRT ${property.distance_from_location_to_BTS_or_MRT}km`);
    if (property.distance_from_location_to_ARL) features.push(`ARL ${property.distance_from_location_to_ARL}km`);
    if (property.have_pets_allowed) features.push("Pet Friendly");
    if (property.view) features.push(property.view);
    if (property.have_infinity_pool) features.push("Infinity Pool");
    if (property.have_fitness_area) features.push("Gym");
    if (property.have_sky_lounge) features.push("Sky Lounge");

    if (!features.length) return;
    const fragment = document.createDocumentFragment();
    features.forEach((feature) => {
      const chip = document.createElement("span");
      chip.className = "inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-primary";
      chip.textContent = feature;
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

    // Price Display (Enhanced)
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

    const link = card.querySelector("[data-card-link]");
    if (link) {
      let detailUrl = `/property/details/${property.id ?? ""}/`;
      if (property.tag === "spotlight") detailUrl += "?discounted=True";
      else if (property.tag === "feature") detailUrl += "?featured=True";
      link.href = detailUrl;
    }

    const title = card.querySelector("[data-card-title]");
    if (title) title.textContent = property.building_title || property.title || "Untitled property";

    // Property Type Badge
    const propertyType = card.querySelector("[data-card-property-type]");
    if (propertyType) {
      const typeText = formatPropertyType(property.building_type, property.building_sub_type);
      if (typeText) {
        propertyType.textContent = typeText;
        propertyType.classList.remove("hidden");
      } else {
        propertyType.classList.add("hidden");
      }
    }

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

    const beds = card.querySelector("[data-card-beds]");
    if (beds) beds.textContent = property.number_of_bedroom || "—";

    const baths = card.querySelector("[data-card-baths]");
    if (baths) baths.textContent = property.number_of_bathroom || "—";

    const size = card.querySelector("[data-card-size]");
    if (size) {
      // Show just the number for compact display
      const area = property.unit_area ? property.unit_area.toString() : "—";
      size.textContent = area;
    }

    const floor = card.querySelector("[data-card-floor]");
    if (floor) floor.textContent = property.floor_number ? `Floor ${property.floor_number}` : "Floor —";

    const features = card.querySelector("[data-card-features]");
    if (features) buildFeatures(property, features);

    // Features summary for wide cards
    const featuresSummary = card.querySelector("[data-card-features-summary]");
    if (featuresSummary && property.features && property.features.length > 0) {
      const keyFeatures = property.features.slice(0, 2); // Show first 2 features
      featuresSummary.innerHTML = keyFeatures.map(f => 
        `<span class="text-xs">${f}</span>`
      ).join('<span class="text-muted-foreground"> • </span>');
    }

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

    // Secondary actions (drone view)
    const droneButton = card.querySelector("[data-card-drone]");
    if (droneButton) {
      if (property.ariel_view) {
        droneButton.classList.remove("hidden");
        droneButton.dataset.cardDrone = property.ariel_view;
        droneButton.setAttribute("data-drone-view", property.ariel_view);
      } else {
        droneButton.classList.add("hidden");
      }
    }

    const developerImage = card.querySelector("[data-card-developer-image]");
    if (developerImage) {
      developerImage.src = property.developer_image || defaultAvatar;
      withImageFallback(developerImage, defaultAvatar);
    }

    const developerName = card.querySelector("[data-card-developer-name]");
    if (developerName) developerName.textContent = property.developer_company_name || "N/A";

    const created = card.querySelector("[data-card-created]");
    const dateLabel = card.querySelector("[data-card-date-label]");
    if (created) {
      created.textContent = formatDate(property.created_at);
      // Check if property was recently updated (within last 7 days) to show "Reduced on"
      if (property.updated_at && property.updated_at !== property.created_at) {
        const updatedDate = new Date(property.updated_at);
        const createdDate = new Date(property.created_at);
        const daysDiff = (updatedDate - createdDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1 && daysDiff < 7) {
          if (dateLabel) dateLabel.textContent = "Reduced on";
          created.textContent = formatDate(property.updated_at);
        } else {
          if (dateLabel) dateLabel.textContent = "Added on";
        }
      } else {
        if (dateLabel) dateLabel.textContent = "Added on";
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

    const contactButton = card.querySelector("[data-card-contact]");
    if (contactButton) {
      const email = typeof config.contactEmail === "function" ? config.contactEmail(property) : config.contactEmail;
      if (config.showContact && email) {
        contactButton.href = `mailto:${email}`;
        contactButton.classList.remove("hidden");
        contactButton.classList.remove("pointer-events-none", "opacity-60");
      } else {
        contactButton.classList.add("hidden");
      }
    }

    return card;
  };

  window.PropertyCardFactory = {
    createCard,
    formatCurrency,
  };
})();
