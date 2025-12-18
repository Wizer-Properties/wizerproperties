"use strict";

(function () {
  const userType = window.user_type || null;

  const els = {
    title: document.querySelector("[data-building-title]"),
    address: document.querySelector("[data-building-address]"),
    price: document.querySelector("[data-building-price]"),
    priceContainer: document.querySelector("[data-building-price-container]"),
    priceRange: document.querySelector("[data-building-price-range]"),
    priceOverlay: document.querySelector("[data-building-price-overlay]"),
    type: document.querySelector("[data-building-type]"),
    typeBadge: document.querySelector("[data-building-type-badge]"),
    units: document.querySelector("[data-building-units]"),
    area: document.querySelector("[data-building-area]"),
    floors: document.querySelector("[data-building-floors]"),
    completion: document.querySelector("[data-building-completion]"),
    completionWrapper: document.querySelector("[data-building-completion-wrapper]"),
    bts: document.querySelector("[data-building-bts]"),
    btsWrapper: document.querySelector("[data-building-bts-wrapper]"),
    arl: document.querySelector("[data-building-arl]"),
    arlWrapper: document.querySelector("[data-building-arl-wrapper]"),
    quota: document.querySelector("[data-building-quota]"),
    quotaWrapper: document.querySelector("[data-building-quota-wrapper]"),
    status: document.querySelector("[data-building-status]"),
    furnishing: document.querySelector("[data-building-furnishing]"),
    view: document.querySelector("[data-building-view]"),
    amenities: document.querySelector("[data-building-amenities]"),
    description: document.querySelector("[data-building-description]"),
    descriptionToggle: document.querySelector("[data-description-toggle]"),
    descriptionExpand: document.querySelector("[data-description-expand]"),
    facilityView: document.querySelector("[data-facility-view]"),
    locationView: document.querySelector("[data-location-view]"),
    contactPhone: document.querySelector("[data-contact-phone]"),
    galleryList: document.querySelector("[data-gallery-list]"),
    galleryTabsContainer: document.querySelector("[data-gallery-tabs-container]"),
    galleryPlansDropdown: document.querySelector("[data-gallery-plans-dropdown]"),
    galleryModal: document.querySelector("[data-gallery-modal]"),
    galleryModalList: document.querySelector("[data-gallery-modal-list]"),
    galleryOpen: document.querySelector("[data-gallery-open]"),
    galleryClose: document.querySelector("[data-gallery-close]"),
    galleryButtons: document.querySelectorAll(".gallery-tab-button"),
    availableList: document.querySelector("[data-available-list]"),
    availableFilterChips: document.querySelectorAll("[data-available-filter]"),
    reviewsWrapper: document.querySelector(".review-writing-area"),
    reviewsList: document.querySelector(".view-the-reviews"),
    reviewsLoadMore: document.querySelector(".load-more-reviews"),
    developerImage: document.querySelector("[data-building-developer-image]"),
    developerIconFallback: document.querySelector("[data-building-developer-icon-fallback]"),
    developerName: document.querySelector("[data-building-developer-name]"),
    dateRelative: document.querySelector("[data-building-date-relative]"),
    dateLabel: document.querySelector("[data-building-date-label]"),
    dateValue: document.querySelector("[data-building-date-value]"),
    featuredAccent: document.querySelector("[data-building-featured-accent]"),
    badgesContainer: document.querySelector("[data-building-badges]"),
    imageCounter: document.querySelector("[data-image-counter]"),
    currentImage: document.querySelector("[data-current-image]"),
    totalImages: document.querySelector("[data-total-images]"),
    shareButton: document.querySelector(".share-building-btn"),
  };

  const state = {
    building: null,
    galleryCache: new Map(),
    activeGalleryType: "image",
    heroSplide: null,
    modalSplide: null,
    descriptionExpanded: false,
    available: {
      splide: null,
      filter: "all",
      next: null,
      fetching: false,
      initialized: false,
    },
    reviews: {
      next: 1,
      loading: false,
      hasLoaded: false,
    },
    facilitiesFetched: false,
  };

  const formatNumber = (value) => {
    if (typeof window.formatBalance === "function") {
      return window.formatBalance(value ?? 0);
    }
    return new Intl.NumberFormat().format(value ?? 0);
  };

  const formatCurrency = (min, max) => {
    const formattedMin = formatNumber(Math.floor(min || 0));
    if (max === null || max === undefined || max === min) {
      return `฿ ${formattedMin}`;
    }
    const formattedMax = formatNumber(Math.floor(max || 0));
    return `฿ ${formattedMin} — ฿ ${formattedMax}`;
  };

  async function fetchJson(url, query = {}) {
    const params = new URLSearchParams(query);
    const response = await fetch(`${url}${params.toString() ? "?" + params.toString() : ""}`, {
      headers: {
        "X-CSRFToken": CSRF_TOKEN,
      },
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  function applyText(node, value, fallback = "—") {
    if (!node) return;
    node.textContent = value && value !== "" ? value : fallback;
  }

  function renderHeroSlides(items, type) {
    const listEl = els.galleryList;
    if (!listEl) return;

    listEl.innerHTML = "";
    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.className = "splide__slide h-full flex items-center justify-center bg-muted text-sm text-muted-foreground";
      li.textContent = "Property photos coming soon";
      listEl.appendChild(li);
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "splide__slide";
        if (type === "video" || type === "aerial_drone_video" || /\.(mp4|webm)$/i.test(item.file || "")) {
          li.innerHTML = `
            <video class="h-full w-full object-cover" controls preload="metadata">
              <source src="${item.file}" type="video/${item.file.endsWith(".webm") ? "webm" : "mp4"}" />
              Your browser does not support the video tag.
            </video>
          `;
        } else {
          li.innerHTML = `
            <img src="${item.file}" alt="Building media" class="h-full w-full object-cover" loading="lazy" />
          `;
        }
        listEl.appendChild(li);
      });
    }

    if (state.heroSplide) {
      state.heroSplide.destroy(true);
    }
    const heroElement = document.querySelector("#building-hero-slider");
    if (heroElement) {
      state.heroSplide = new Splide(heroElement, {
        type: "loop",
        perPage: 1,
        gap: "1rem",
        autoplay: true,
        interval: 6000,
        pauseOnHover: true,
        arrows: true,
        pagination: true,
      });
      state.heroSplide.on("moved", (splide, index) => {
        updateImageCounter(index + 1, items.length);
      });
      state.heroSplide.mount();
      // Update counter with initial values
      if (items && items.length > 0) {
        updateImageCounter(1, items.length);
      }
    }
  }

  function renderModalSlides(items, type) {
    if (!els.galleryModalList) return;
    els.galleryModalList.innerHTML = "";

    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.className = "splide__slide h-[80vh] flex items-center justify-center bg-white/5 text-white/60";
      li.textContent = "Photos not available";
      els.galleryModalList.appendChild(li);
    } else {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "splide__slide";
        if (type === "video" || type === "aerial_drone_video" || /\.(mp4|webm)$/i.test(item.file || "")) {
          li.innerHTML = `
            <video class="h-[80vh] w-full object-contain bg-black" controls preload="metadata">
              <source src="${item.file}" type="video/${item.file.endsWith(".webm") ? "webm" : "mp4"}" />
              Your browser does not support the video tag.
            </video>
          `;
        } else {
          li.innerHTML = `
            <img src="${item.file}" alt="Gallery media" class="h-[80vh] w-full object-contain bg-black" loading="lazy" />
          `;
        }
        els.galleryModalList.appendChild(li);
      });
    }

    if (state.modalSplide) {
      state.modalSplide.destroy(true);
    }
    const modalElement = document.querySelector("#building-gallery-modal");
    if (modalElement) {
      state.modalSplide = new Splide(modalElement, {
        type: "loop",
        perPage: 1,
        gap: "1.5rem",
        autoplay: false,
        pagination: true,
      });
      state.modalSplide.mount();
    }
  }

  function toggleGalleryModal(show) {
    if (!els.galleryModal) return;
    if (show) {
      els.galleryModal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      els.galleryModal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  async function ensureGallery(type) {
    if (state.galleryCache.has(type)) {
      return state.galleryCache.get(type);
    }
    const data = await fetchJson(GALLERY_API_URL, {
      media_type: type,
      page_size: 12,
    });
    const results = data?.results || [];
    state.galleryCache.set(type, results);
    return results;
  }

  function setActiveGalleryButton(type) {
    els.galleryButtons.forEach((button) => {
      const buttonType = button.dataset.galleryFilter;
      if (buttonType === type) {
        button.classList.add("nav-pill-active");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.classList.remove("nav-pill-active");
        button.setAttribute("aria-pressed", "false");
      }
    });
  }

  async function updateGallery(type) {
    try {
      const items =
        type === "image" && state.building?.default_images
          ? state.building.default_images
          : await ensureGallery(type);
      state.activeGalleryType = type;
      setActiveGalleryButton(type);
      renderHeroSlides(items, type);
      renderModalSlides(items, type);
      updateImageCounter(1, items?.length || 0);
    } catch (error) {
      console.error("Gallery fetch failed", error);
    }
  }

  function updatePrimaryDetails(data) {
    applyText(els.title, data.title);
    applyText(els.address, data.address);
    applyText(els.type, (data.type || "").replace(/_/g, " "));
    applyText(els.units, data.total_units_for_sale);
    applyText(els.area, data.project_total_area ? `${data.project_total_area}` : null);
    applyText(els.floors, data.total_floors);
    
    // Completion - show wrapper if data exists
    if (els.completion && els.completionWrapper) {
      const completionText = data.construction_year || "TBC";
      els.completion.textContent = completionText;
      if (completionText && completionText !== "—") {
        els.completionWrapper.classList.remove("hidden");
      }
    }
    
    // Quota - show wrapper if data exists
    if (els.quota && els.quotaWrapper) {
      const quotaText = (data.quota || "").replace(/_/g, " ");
      els.quota.textContent = quotaText;
      if (quotaText && quotaText !== "—") {
        els.quotaWrapper.classList.remove("hidden");
      }
    }
    
    applyText(els.status, (data.status || "").replace(/_/g, " "));
    applyText(els.furnishing, (data.furnishing || "").replace(/_/g, " "));
    applyText(els.view, data.view || "—");

    // BTS/MRT - show wrapper if data exists
    const btsDistance =
      data.distance_from_location_to_BTS_or_MRT !== null &&
      data.distance_from_location_to_BTS_or_MRT !== undefined &&
      data.distance_from_location_to_BTS_or_MRT !== ""
        ? `${data.distance_from_location_to_BTS_or_MRT}`
        : null;
    if (els.bts && els.btsWrapper) {
      if (btsDistance) {
        els.bts.textContent = btsDistance;
        els.btsWrapper.classList.remove("hidden");
      }
    }

    // ARL - show wrapper if data exists
    const arlDistance =
      data.distance_from_location_to_ARL !== null &&
      data.distance_from_location_to_ARL !== undefined &&
      data.distance_from_location_to_ARL !== ""
        ? `${data.distance_from_location_to_ARL}`
        : null;
    if (els.arl && els.arlWrapper) {
      if (arlDistance) {
        els.arl.textContent = arlDistance;
        els.arlWrapper.classList.remove("hidden");
      }
    }

    // Price - show overlay if price exists
    if (els.price) {
      const priceText = formatCurrency(data.lowest_price, data.highest_price);
      els.price.textContent = priceText;
      if (els.priceOverlay && (data.lowest_price || data.highest_price)) {
        els.priceOverlay.classList.remove("hidden");
      }
    }

    if (els.contactPhone && data.contact_phone_number) {
      els.contactPhone.textContent = data.contact_phone_number;
      els.contactPhone.setAttribute("href", `tel:${data.contact_phone_number}`);
    }

    renderIframes(data);
    
    // Developer info
    if (els.developerName && data.developer_company_name) {
      els.developerName.textContent = data.developer_company_name;
    }
    
    if (els.developerImage) {
      const defaultAvatar = "/static/media/default-avatar.jpg";
      els.developerImage.src = data.developer_image || defaultAvatar;
      els.developerImage.addEventListener("error", () => {
        if (els.developerIconFallback) {
          els.developerIconFallback.classList.remove("hidden");
          els.developerImage.classList.add("hidden");
        }
      });
      els.developerImage.addEventListener("load", () => {
        if (els.developerIconFallback) {
          els.developerIconFallback.classList.add("hidden");
          els.developerImage.classList.remove("hidden");
        }
      });
    }
    
    // Date relative
    if (els.dateValue && data.date_listed) {
      const date = new Date(data.date_listed);
      if (!isNaN(date.getTime())) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        
        let relativeDate = "today";
        if (diffDays === 1) {
          relativeDate = "1 day ago";
        } else if (diffDays < 7) {
          relativeDate = `${diffDays} days ago`;
        } else if (diffWeeks === 1) {
          relativeDate = "1 week ago";
        } else if (diffWeeks < 4) {
          relativeDate = `${diffWeeks} weeks ago`;
        } else if (diffMonths === 1) {
          relativeDate = "1 month ago";
        } else if (diffMonths < 12) {
          relativeDate = `${diffMonths} months ago`;
        } else {
          relativeDate = date.toLocaleDateString();
        }
        els.dateValue.textContent = relativeDate;
      }
    }
  }

  function renderIframes(building) {
    if (els.facilityView) {
      if (building.facility_view && isValidUrl(building.facility_view)) {
        els.facilityView.innerHTML = `<iframe src="${building.facility_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.facilityView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Facility tour coming soon</div>';
      }
    }

    if (els.locationView) {
      if (building.location_view && isValidUrl(building.location_view)) {
        els.locationView.innerHTML = `<iframe src="${building.location_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.locationView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Location tour coming soon</div>';
      }
    }
  }

  function updateDescription(data) {
    if (!els.description) return;
    const descriptionText = data.description || "Project details are being updated. Check back soon for complete information.";
    
    // Create paragraph with proper formatting
    const paragraph = document.createElement("p");
    paragraph.className = "leading-relaxed";
    paragraph.textContent = descriptionText;
    els.description.innerHTML = "";
    els.description.appendChild(paragraph);

    // Check if description needs truncation
    const needsTruncation = descriptionText.length > 800;
    const toggleButton = els.descriptionToggle || els.descriptionExpand;
    
    if (needsTruncation && toggleButton) {
      state.descriptionExpanded = false;
      els.description.style.maxHeight = "12rem";
      els.description.style.overflow = "hidden";
      toggleButton.classList.remove("hidden");
      const icon = toggleButton.querySelector("i");
      if (icon) {
        icon.className = "bi bi-chevron-down mr-1.5";
      }
      toggleButton.setAttribute("aria-expanded", "false");
      const span = toggleButton.querySelector("span");
      if (span) {
        span.textContent = "Expand";
      } else {
        toggleButton.textContent = "Expand";
      }
    } else if (toggleButton) {
      toggleButton.classList.add("hidden");
    }
  }

  function toggleDescription() {
    const toggleButton = els.descriptionToggle || els.descriptionExpand;
    if (!els.description || !toggleButton) return;
    
    state.descriptionExpanded = !state.descriptionExpanded;
    const icon = toggleButton.querySelector("i");
    const span = toggleButton.querySelector("span");
    
    if (state.descriptionExpanded) {
      els.description.style.maxHeight = "100%";
      els.description.style.overflow = "visible";
      if (icon) {
        icon.className = "bi bi-chevron-up mr-1.5";
      }
      toggleButton.setAttribute("aria-expanded", "true");
      if (span) {
        span.textContent = "Collapse";
      } else {
        toggleButton.textContent = "Collapse";
      }
    } else {
      els.description.style.maxHeight = "12rem";
      els.description.style.overflow = "hidden";
      if (icon) {
        icon.className = "bi bi-chevron-down mr-1.5";
      }
      toggleButton.setAttribute("aria-expanded", "false");
      if (span) {
        span.textContent = "Expand";
      } else {
        toggleButton.textContent = "Expand";
      }
    }
  }

  function renderAmenities(building) {
    if (!els.amenities) return;
    const chips = [];

    const addChip = (condition, label) => {
      if (condition) {
        chips.push(label);
      }
    };

    addChip(building.have_freehold, "Freehold");
    addChip(building.have_leasehold, "Leasehold");
    addChip(building.have_infinity_pool, "Infinity Pool");
    addChip(building.have_pets_allowed, "Pet Friendly");
    addChip(building.have_sauna, "Sauna");
    addChip(building.have_rooftop_pool || building.have_sky_lounge, "Rooftop Pool");
    addChip(building.have_fitness_area, "Fitness Area");
    addChip(building.have_grocery, "On-site Grocery");
    addChip(building.have_guard_house, "Guard House");
    addChip(building.have_river_view, "River View");
    addChip(building.view, building.view);

    if (building.distance_from_location_to_BTS_or_MRT) {
      chips.push(`BTS/MRT • ${building.distance_from_location_to_BTS_or_MRT} km`);
    }
    if (building.distance_from_location_to_ARL) {
      chips.push(`ARL • ${building.distance_from_location_to_ARL} km`);
    }

    els.amenities.innerHTML = "";
    if (chips.length === 0) {
      const span = document.createElement("span");
      span.className = "text-xs text-muted-foreground";
      span.textContent = "Amenities list is being updated. Complete details coming soon.";
      els.amenities.appendChild(span);
      return;
    }

    chips.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground";
      chip.textContent = label;
      els.amenities.appendChild(chip);
    });
  }

  async function fetchBuildingDetails() {
    try {
      const data = await fetchJson(ASSET_API_URL, { default_images_number: 5, reviewed_by: USER_ID });
      state.building = data;
      state.galleryCache.set("image", data.default_images || []);
      updatePrimaryDetails(data);
      updateDescription(data);
      renderAmenities(data);
      renderHeroSlides(data.default_images || [], "image");
      renderModalSlides(data.default_images || [], "image");
      updateGallery("image");
      updateGalleryTabVisibility(data);
      renderReviewsHeader(data.reviews);
      initializeMap();
      
      // Update image counter
      const totalImages = data.default_images?.length || 0;
      updateImageCounter(1, totalImages);
    } catch (error) {
      console.error("Failed to fetch building details", error);
    }
  }

  function initializeMap() {
    const sidebarMapNode = document.getElementById("sidebar-map");
    const defaultLatLng = { lat: 13.7563, lng: 100.5018 };
    
    if (!sidebarMapNode) {
      return; // No map element to initialize
    }
    
    // Wait for Google Maps to be available
    let retryCount = 0;
    const maxRetries = 50; // 10 seconds max wait time
    
    const initMaps = () => {
      retryCount++;
      
      if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
        if (retryCount < maxRetries) {
          // Retry after a short delay
          setTimeout(initMaps, 200);
        } else {
          console.warn("Google Maps API failed to load after multiple retries");
        }
        return;
      }
      
      // Initialize sidebar map - always use direct initialization for reliability
      if (sidebarMapNode) {
        // Check if map was already initialized (has a child element from Google Maps)
        const isAlreadyInitialized = sidebarMapNode.querySelector('div[style*="overflow"]') || 
                                     sidebarMapNode.querySelector('iframe') ||
                                     sidebarMapNode.children.length > 0;
        
        if (!isAlreadyInitialized) {
          // Always use direct initialization for sidebar map to ensure it works
          initializeMapDirectly(sidebarMapNode, defaultLatLng, 14);
        }
      }
    };
    
    // Start initialization
    initMaps();
  }

  function initializeMapDirectly(renderDom, defaultLatLng, zoom = 13) {
    if (!renderDom) {
      console.warn("Map container element not found");
      return;
    }
    
    if (typeof google === 'undefined' || !google.maps || !google.maps.Map) {
      // Retry after a short delay if Google Maps isn't loaded yet
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
          initializeMapDirectly(renderDom, defaultLatLng, zoom);
        }
      }, 500);
      return;
    }
    
    try {
      const geocoder = new google.maps.Geocoder();
      // Try to get address from multiple sources
      const address = state.building?.address || 
                      els.address?.textContent?.trim() ||
                      '';
      
      if (address) {
        geocoder.geocode({ address: address }, function (results, status) {
          if (!renderDom) return; // Check if element still exists
          
          try {
            const map = new google.maps.Map(renderDom, {
              center: status === 'OK' ? results[0].geometry.location : defaultLatLng,
              zoom: zoom,
              disableDefaultUI: true,
            });
            new google.maps.Marker({
              position: status === 'OK' ? results[0].geometry.location : defaultLatLng,
              map: map,
              title: address,
            });
          } catch (error) {
            console.error("Error creating map:", error);
          }
        });
      } else {
        // If no address, just show default location
        try {
          const map = new google.maps.Map(renderDom, {
            center: defaultLatLng,
            zoom: zoom,
            disableDefaultUI: true,
          });
          new google.maps.Marker({
            position: defaultLatLng,
            map: map,
          });
        } catch (error) {
          console.error("Error creating map with default location:", error);
        }
      }
    } catch (error) {
      console.error("Error in initializeMapDirectly:", error);
    }
  }

  function isValidUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      // Check if it's a valid HTTP/HTTPS URL
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      // If URL constructor throws, it's not a valid absolute URL
      return false;
    }
  }

  function initPlansDropdown() {
    const dropdownTrigger = document.getElementById("plans-dropdown-trigger");
    const dropdownMenu = document.getElementById("plans-dropdown-menu");
    if (!dropdownTrigger || !dropdownMenu) return;

    dropdownTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = dropdownTrigger.getAttribute("aria-expanded") === "true";
      dropdownTrigger.setAttribute("aria-expanded", !isExpanded);
      dropdownMenu.classList.toggle("hidden");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownTrigger.setAttribute("aria-expanded", "false");
        dropdownMenu.classList.add("hidden");
      }
    });

    // Handle menu item clicks
    const menuItems = dropdownMenu.querySelectorAll('[role="menuitem"]');
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const type = item.dataset.galleryFilter;
        if (type) {
          updateGallery(type);
          dropdownTrigger.setAttribute("aria-expanded", "false");
          dropdownMenu.classList.add("hidden");
        }
      });
    });

    // Keyboard navigation
    dropdownTrigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dropdownTrigger.click();
      } else if (e.key === "Escape") {
        dropdownTrigger.setAttribute("aria-expanded", "false");
        dropdownMenu.classList.add("hidden");
      }
    });
  }

  function updateGalleryTabVisibility(building) {
    if (!els.galleryTabsContainer) return;
    
    const hasUnitPlans = building?.has_unit_plans || state.galleryCache.has("unit_floor_plan");
    const hasMasterPlan = building?.has_master_plan || state.galleryCache.has("master_plan");
    const hasVideo = building?.has_video || state.galleryCache.has("video");
    const hasAerial = building?.has_aerial || state.galleryCache.has("aerial_drone_video");
    
    // Show/hide Plans dropdown
    if (els.galleryPlansDropdown) {
      if (hasUnitPlans || hasMasterPlan) {
        els.galleryPlansDropdown.classList.remove("hidden");
      } else {
        els.galleryPlansDropdown.classList.add("hidden");
      }
    }
    
    // Show/hide individual gallery buttons
    els.galleryButtons.forEach((button) => {
      const type = button.dataset.galleryFilter;
      if (!type) return;
      
      if (type === "video") {
        button.classList.toggle("hidden", !hasVideo);
      } else if (type === "aerial_drone_video") {
        button.classList.toggle("hidden", !hasAerial);
      } else if (type === "unit_floor_plan" || type === "master_plan") {
        // These are handled by the dropdown
        button.classList.add("hidden");
      }
    });
  }

  function initGalleryControls() {
    els.galleryButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const type = button.dataset.galleryFilter;
        if (!type || type === state.activeGalleryType) return;
        button.setAttribute("aria-pressed", "true");
        els.galleryButtons.forEach((btn) => {
          if (btn !== button) {
            btn.setAttribute("aria-pressed", "false");
            btn.classList.remove("nav-pill-active");
          }
        });
        await updateGallery(type);
      });
    });

    initPlansDropdown();

    if (els.galleryOpen) {
      els.galleryOpen.addEventListener("click", async () => {
        const items =
          state.activeGalleryType === "image" && state.building?.default_images
            ? state.building.default_images
            : await ensureGallery(state.activeGalleryType);
        renderModalSlides(items, state.activeGalleryType);
        toggleGalleryModal(true);
      });
    }

    if (els.galleryClose) {
      els.galleryClose.addEventListener("click", () => toggleGalleryModal(false));
    }
    if (els.galleryModal) {
      els.galleryModal.addEventListener("click", (event) => {
        if (event.target === els.galleryModal) {
          toggleGalleryModal(false);
        }
      });
    }
  }

  function updateImageCounter(current, total) {
    if (els.currentImage) {
      els.currentImage.textContent = current || 1;
    }
    if (els.totalImages) {
      els.totalImages.textContent = total || "—";
    }
    if (els.imageCounter && total && total > 1) {
      els.imageCounter.classList.remove("hidden");
    } else if (els.imageCounter) {
      els.imageCounter.classList.add("hidden");
    }
  }

  function initShareButton() {
    if (!els.shareButton) return;
    
    els.shareButton.addEventListener("click", () => {
      const url = els.shareButton.dataset.shareUrl || window.location.href;
      const title = els.shareButton.dataset.shareTitle || document.title;
      
      if (navigator.share) {
        navigator.share({
          title: title,
          url: url,
        }).catch((err) => {
          console.log("Error sharing:", err);
          copyToClipboard(url);
        });
      } else {
        copyToClipboard(url);
      }
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const originalText = els.shareButton?.querySelector("i")?.nextSibling?.textContent || "";
      if (els.shareButton) {
        const icon = els.shareButton.querySelector("i");
        if (icon) {
          icon.className = "bi bi-check text-sm";
          setTimeout(() => {
            icon.className = "bi bi-share text-sm";
          }, 2000);
        }
      }
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  }

  function initSectionAnimations() {
    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0");
            entry.target.classList.add("opacity-100");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    
    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  function calculatePerPage() {
    if (window.innerWidth <= 460) return 1;
    if (window.innerWidth <= 740) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  }

  function renderUnitCard(unit) {
    return `
      <div class="h-full rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        <div class="relative">
          <img src="${unit.default_image}" alt="Unit image" class="h-40 w-full object-cover" loading="lazy" />
          ${
            !["agent", "developer"].includes(userType)
              ? `<div class="absolute right-3 top-3 flex flex-col gap-2">
                  <button class="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow">
                    <i class="bi bi-heart${unit.is_favorited ? "-fill text-primary" : ""}"></i>
                    Favourite
                  </button>
                </div>`
              : ""
          }
        </div>
        <div class="flex flex-1 flex-col gap-4 p-4">
          <div class="space-y-1">
            <p class="text-base font-semibold text-foreground">฿ ${formatNumber(unit.price || 0)}</p>
            <p class="text-xs text-muted-foreground">฿ ${formatNumber(unit.price_per_sqm || 0)} / sqm</p>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div class="rounded-lg bg-secondary/50 px-3 py-2">
              <span class="block text-[11px] uppercase tracking-wide">Beds</span>
              <span class="text-sm font-semibold text-foreground">${unit.number_of_bedroom}</span>
            </div>
            <div class="rounded-lg bg-secondary/50 px-3 py-2">
              <span class="block text-[11px] uppercase tracking-wide">Baths</span>
              <span class="text-sm font-semibold text-foreground">${unit.number_of_bathroom}</span>
            </div>
            <div class="rounded-lg bg-secondary/50 px-3 py-2">
              <span class="block text-[11px] uppercase tracking-wide">Size</span>
              <span class="text-sm font-semibold text-foreground">${unit.unit_area} sqm</span>
            </div>
            <div class="rounded-lg bg-secondary/50 px-3 py-2">
              <span class="block text-[11px] uppercase tracking-wide">Floor</span>
              <span class="text-sm font-semibold text-foreground">${unit.floor_number}</span>
            </div>
          </div>
          <div class="mt-auto">
            <a href="/property/details/${unit.id}/" class="btn-secondary w-full justify-center text-sm">View details</a>
          </div>
        </div>
      </div>
    `;
  }

  function initAvailableSlider() {
    const sliderElement = document.querySelector("#available-units-slider");
    if (!sliderElement) return;
    if (state.available.splide) {
      state.available.splide.destroy(true);
    }
    state.available.splide = new Splide(sliderElement, {
      perPage: calculatePerPage(),
      gap: "1.25rem",
      pagination: false,
      arrows: true,
      breakpoints: {
        1200: { perPage: 3 },
        740: { perPage: 2 },
        460: { perPage: 1 },
      },
    });
    state.available.splide.on("moved", (index) => {
      if (!state.available.next || state.available.fetching) return;
      const lastIndex = state.available.splide.length - 1;
      if (index >= lastIndex - 1) {
        fetchAvailableUnits({ append: true });
      }
    });
    state.available.splide.mount();
    state.available.initialized = true;
  }

  async function fetchAvailableUnits({ append = false } = {}) {
    if (state.available.fetching) return;
    state.available.fetching = true;
    try {
      const perPage = calculatePerPage();
      const page = append && state.available.next ? state.available.next : 1;
      const query = {
        page_size: perPage,
        page: page,
      };
      if (state.available.filter !== "all") {
        query.bed = state.available.filter;
      }
      const data = await fetchJson(AVAILABLE_API_URL, query);
      state.available.next = data?.next || null;

      const items = data?.results || [];
      const listEl = els.availableList;
      if (!listEl) return;

      if (!append) {
        listEl.innerHTML = "";
      }

      items.forEach((unit) => {
        const li = document.createElement("li");
        li.className = "splide__slide";
        li.innerHTML = renderUnitCard(unit);
        listEl.appendChild(li);
      });

      if (!state.available.initialized) {
        initAvailableSlider();
      } else if (append) {
        state.available.splide.refresh();
      } else {
        state.available.splide.destroy(true);
        initAvailableSlider();
      }
    } catch (error) {
      console.error("Failed to fetch available units", error);
    } finally {
      state.available.fetching = false;
    }
  }

  function initAvailableUnits() {
    els.availableFilterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filterValue = chip.dataset.availableFilter || "all";
        if (filterValue === state.available.filter) return;
        state.available.filter = filterValue;
        state.available.next = null;
        els.availableFilterChips.forEach((el) => el.classList.remove("filter-chip-active"));
        chip.classList.add("filter-chip-active");
        fetchAvailableUnits({ append: false });
      });
    });

    const section = document.querySelector("#available-units-slider");
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          fetchAvailableUnits({ append: false });
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
  }

  function ratingStars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<i class="bi ${i <= rating ? "bi-star-fill text-accent" : "bi-star text-muted-foreground"}" data-rating="${i}"></i>`;
    }
    return html;
  }

  function renderReviewsHeader(reviewsData) {
    if (!els.reviewsWrapper) return;
    const data = reviewsData || {};
    const average = data.average_rating || 0;
    const total = data.total_rating || 0;

    let html = `
      <div class="rounded-2xl border border-border bg-secondary/40 p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase text-muted-foreground">Average Rating</p>
            <p class="text-2xl font-semibold text-foreground">${average.toFixed(1)} / 5</p>
            <p class="text-sm text-muted-foreground">Based on <strong>${total}</strong> review${total === 1 ? "" : "s"}</p>
          </div>
          <div class="flex items-center gap-2 text-xl text-accent">
            ${ratingStars(Math.round(average))}
          </div>
        </div>
    `;

    if (!data.has_reviewed && userType === "prospect") {
      html += `
        <div class="mt-6 space-y-4 rounded-2xl border border-border bg-background p-4">
          <p class="text-sm font-semibold text-foreground">Share your experience</p>
          <div class="flex items-center gap-2 text-xl text-accent give-rating">
            ${ratingStars(0)}
          </div>
          <textarea class="give-review input min-h-[140px]" placeholder="Share your honest experience. What you loved about this development, amenities that stood out, and who this project is perfect for..."></textarea>
          <div class="review-warrning-text space-y-1 text-xs text-destructive"></div>
          <button class="btn w-full justify-center review-submit-btn text-sm">Share your review</button>
        </div>
      `;
    }

    html += `</div>`;
    els.reviewsWrapper.innerHTML = html;

    if (!state.reviews.hasLoaded) {
      initReviewInteractions();
    }
  }

  function initReviewInteractions() {
    let selectedRating = 0;

    document.addEventListener("mouseover", (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        const rating = parseInt(event.target.dataset.rating, 10);
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = ratingStars(rating);
        }
      }
    });

    document.addEventListener("click", async (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        selectedRating = parseInt(event.target.dataset.rating, 10);
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = ratingStars(selectedRating);
        }
      }

      if (event.target.closest(".review-submit-btn")) {
        await submitReview(selectedRating);
      }

      if (event.target.closest(".load-more-reviews button")) {
        await fetchMoreReviews();
      }
    });

    document.addEventListener("mouseout", (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = ratingStars(selectedRating);
        }
      }
    });
  }

  async function submitReview(rating) {
    if (state.reviews.loading) return;
    const warning = document.querySelector(".review-warrning-text");
    if (!rating) {
      if (warning) warning.textContent = "Please rate this development to help other buyers.";
      return;
    }
    const textarea = document.querySelector(".give-review");
    const reviewText = textarea ? textarea.value.trim() : "";
    if (!reviewText) {
      if (warning) warning.textContent = "Please share your experience. Your review helps other buyers make confident decisions.";
      return;
    }
    state.reviews.loading = true;
    if (warning) warning.textContent = "";

    try {
      const response = await fetch("/building/api/review/create/", {
        method: "POST",
        headers: {
          "X-CSRFToken": CSRF_TOKEN,
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          building: BUILDING_ID,
          review_text: reviewText,
          rating,
        }),
      });
      if (!response.ok) {
        throw new Error("Review submission failed");
      }
      const data = await response.json();
      appendReview(data, true);
      const form = document.querySelector(".review-submit-area");
      if (form) {
        form.remove();
      }
    } catch (error) {
      console.error(error);
      if (warning) warning.textContent = "Something went wrong. Please try again in a moment.";
    } finally {
      state.reviews.loading = false;
    }
  }

  function appendReview(review, prepend = false) {
    if (!els.reviewsList) return;
    let created = "";
    try {
      created = typeof dayjs === "function"
        ? dayjs(review.created_at).format("h:mm A, DD MMM YYYY")
        : new Date(review.created_at).toLocaleString();
    } catch (_) {
      created = new Date(review.created_at).toLocaleString();
    }
    const template = document.createElement("div");
    template.className = "view-the-reviews-box rounded-2xl border border-border bg-card p-4 shadow-sm";
    template.innerHTML = `
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span class="flex items-center gap-1 text-sm text-accent">
          ${ratingStars(review.rating)}
        </span>
        <span class="text-xs text-muted-foreground">
          <strong>${review.reviewer_details?.fullname || "Anonymous"}</strong> • ${created}
        </span>
      </div>
      <p class="text-sm text-foreground">${review.review_text}</p>
    `;
    if (prepend) {
      els.reviewsList.prepend(template);
    } else {
      els.reviewsList.appendChild(template);
    }
  }

  async function fetchMoreReviews() {
    if (state.reviews.loading || !state.reviews.next) return;
    state.reviews.loading = true;
    try {
      const data = await fetchJson("/building/api/review/list/", {
        building_id: BUILDING_ID,
        page_size: 5,
        page: state.reviews.next,
      });
      const results = data?.results || [];
      results.forEach((review) => appendReview(review));
      state.reviews.next = data?.next || null;
      if (!state.reviews.next && els.reviewsLoadMore) {
        els.reviewsLoadMore.innerHTML =
          '<p class="text-center text-xs text-muted-foreground mt-4">No additional reviews.</p>';
      } else if (els.reviewsLoadMore) {
        els.reviewsLoadMore.innerHTML =
          '<button class="btn-secondary mt-4 inline-flex items-center justify-center px-4 py-2 text-sm">Load More</button>';
      }
    } catch (error) {
      console.error("Failed to load additional reviews", error);
    } finally {
      state.reviews.loading = false;
    }
  }

  function initReviewsObserver() {
    const reviewsSection = document.querySelector("#review");
    if (!reviewsSection) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          if (!state.reviews.hasLoaded) {
            state.reviews.hasLoaded = true;
            state.reviews.next = 1;
            fetchMoreReviews();
          }
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(reviewsSection);
  }

  function initDescriptionToggle() {
    if (els.descriptionToggle) {
      els.descriptionToggle.addEventListener("click", toggleDescription);
    }
  }

  function initFacilitiesObserver() {
    if (state.facilitiesFetched) return;
    const amenitiesElement = els.amenities;
    if (!amenitiesElement) return;
    const observer = new IntersectionObserver(
      async (entries, obs) => {
        if (entries[0].isIntersecting && !state.facilitiesFetched) {
          state.facilitiesFetched = true;
          obs.disconnect();
          try {
            const data = await fetchJson(`/building/api/details/${BUILDING_ID}/available-facilities/`);
            renderAmenities({ ...state.building, ...data });
          } catch (error) {
            console.error("Failed to fetch facilities", error);
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(amenitiesElement);
  }

  function initDescriptionToggle() {
    const toggleButton = els.descriptionToggle || els.descriptionExpand;
    if (toggleButton) {
      toggleButton.addEventListener("click", toggleDescription);
    }
  }

  function init() {
    fetchBuildingDetails();
    initGalleryControls();
    initAvailableUnits();
    initReviewsObserver();
    initDescriptionToggle();
    initFacilitiesObserver();
    initShareButton();
    initSectionAnimations();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

