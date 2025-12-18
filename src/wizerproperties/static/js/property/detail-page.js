"use strict";

(function () {
  const userType = window.user_type || null;
  const favoriteEffect = localStorage.getItem("favorite-effect") || "pulse";

  const els = {
    title: document.querySelector("[data-property-title]"),
    address: document.querySelector("[data-property-address]"),
    unitId: document.querySelector("[data-property-unit-id]"),
    price: document.querySelector("[data-property-price]"),
    priceSqm: document.querySelector("[data-property-price-sqm]"),
    beds: document.querySelector("[data-property-beds]"),
    baths: document.querySelector("[data-property-baths]"),
    size: document.querySelector("[data-property-size]"),
    floor: document.querySelector("[data-property-floor]"),
    year: document.querySelector("[data-property-year]"),
    features: document.querySelector("[data-property-features]"),
    description: document.querySelector("[data-property-description]"),
    descriptionToggle: document.querySelector("[data-description-toggle]"),
    availability: document.querySelector("[data-property-availability]"),
    balcony: document.querySelector("[data-property-balcony]"),
    carparks: document.querySelector("[data-property-carparks]"),
    orientation: document.querySelector("[data-property-orientation]"),
    doorDirection: document.querySelector("[data-property-door-direction]"),
    position: document.querySelector("[data-property-position]"),
    facilityView: document.querySelector("[data-facility-view]"),
    locationView: document.querySelector("[data-location-view]"),
    contactPhone: document.querySelector("[data-contact-phone]"),
    contactEmail: document.querySelector("[data-contact-email]"),
    compareButton: document.querySelector(".add-to-compare"),
    favoriteButton: document.querySelector(".add-to-favorite"),
    galleryList: document.querySelector("[data-gallery-list]"),
    galleryButtons: document.querySelectorAll(".gallery-tab-button"),
    galleryModal: document.querySelector("[data-gallery-modal]"),
    galleryModalList: document.querySelector("[data-gallery-modal-list]"),
    galleryOpen: document.querySelector("[data-gallery-open]"),
    galleryClose: document.querySelector("[data-gallery-close]"),
    availableList: document.querySelector("[data-available-list]"),
    availableFilterChips: document.querySelectorAll("[data-available-filter]"),
    reviewsWrapper: document.querySelector(".review-writing-area"),
    reviewsList: document.querySelector(".view-the-reviews"),
    reviewsLoadMore: document.querySelector(".load-more-reviews"),
    buildingThumbnail: document.querySelector("[data-building-thumbnail]"),
    buildingDeveloper: document.querySelector("[data-building-developer]"),
    buildingName: document.querySelector("[data-building-name]"),
    buildingFloors: document.querySelector("[data-building-floors]"),
    buildingUnits: document.querySelector("[data-building-units]"),
    buildingArea: document.querySelector("[data-building-area]"),
    buildingType: document.querySelector("[data-building-type]"),
    buildingCompletion: document.querySelector("[data-building-completion]"),
    buildingAddress: document.querySelector("[data-building-address]"),
    // New elements
    propertyTypeBadge: document.querySelector("[data-property-type-badge]"),
    propertyTypeDisplay: document.querySelector("[data-property-type-display]"),
    propertyTenure: document.querySelector("[data-property-tenure]"),
    imageCounter: document.querySelector("[data-image-counter]"),
    currentImage: document.querySelector("[data-current-image]"),
    totalImages: document.querySelector("[data-total-images]"),
    shareButton: document.querySelector(".share-property-btn"),
    // Developer/Agent header elements
    developerImage: document.querySelector("[data-property-developer-image]"),
    developerIconFallback: document.querySelector("[data-property-developer-icon-fallback]"),
    developerName: document.querySelector("[data-property-developer-name]"),
    dateRelative: document.querySelector("[data-property-date-relative]"),
    dateLabel: document.querySelector("[data-property-date-label]"),
    dateValue: document.querySelector("[data-property-date-value]"),
    // Featured accent bar
    featuredAccent: document.querySelector("[data-property-featured-accent]"),
    // Badges container
    badgesContainer: document.querySelector("[data-property-badges]"),
    // Price overlay elements
    priceContainer: document.querySelector("[data-property-price-container]"),
    originalPrice: document.querySelector("[data-property-original-price]"),
    discountAmount: document.querySelector("[data-property-discount-amount]"),
    // View buttons
    viewButtonsContainer: document.querySelector("[data-property-view-buttons]"),
    threeDBadge: document.querySelector("[data-property-3d-badge]"),
    threeDButton: document.querySelector("[data-property-3d]"),
    droneBadge: document.querySelector("[data-property-drone-badge]"),
    droneButton: document.querySelector("[data-property-drone]"),
    // Stats section wrappers
    floorWrapper: document.querySelector("[data-property-floor-wrapper]"),
    floorNumber: document.querySelector("[data-property-floor-number]"),
    parkingWrapper: document.querySelector("[data-property-parking-wrapper]"),
    parking: document.querySelector("[data-property-parking]"),
    tenureWrapper: document.querySelector("[data-property-tenure-wrapper]"),
    infoTenure: document.querySelector("[data-info-tenure]"),
    infoUnitId: document.querySelector("[data-info-unit-id]"),
    infoFloor: document.querySelector("[data-info-floor]"),
    agentLogo: document.querySelector("[data-agent-logo]"),
    agentName: document.querySelector("[data-agent-name]"),
    contactPhoneBtn: document.querySelector("[data-contact-phone-btn]"),
    contactEmailBtn: document.querySelector("[data-contact-email-btn]"),
    propertyNotes: document.querySelector("[data-property-notes]"),
    saveNotesBtn: document.querySelector("[data-save-notes]"),
    similarProperties: document.querySelector("[data-similar-properties]"),
    backToSearchLink: document.getElementById("back-to-search-link"),
  };

  const state = {
    property: null,
    galleryCache: new Map(),
    activeGalleryType: "image",
    heroSplide: null,
    modalSplide: null,
    descriptionExpanded: false,
    available: {
      filter: "all",
      next: null,
      fetching: false,
      initialized: false,
      splide: null,
    },
    similar: {
      initialized: false,
      splide: null,
    },
    reviews: {
      next: null,
      loading: false,
      hasLoaded: false,
    },
    facilitiesFetched: false,
  };

  const numberFormatter = new Intl.NumberFormat();

  const formatNumber = (value) => numberFormatter.format(Number(value || 0));

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

  const formatCurrency = (value) => `฿ ${formatNumber(Math.floor(value || 0))}`;

  function applyText(node, value, fallback = "—") {
    if (!node) return;
    node.textContent = value && value !== "" ? value : fallback;
  }

  async function fetchJson(url, query = {}) {
    const urlObj = new URL(url, window.location.origin);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.append(key, value);
      }
    });

    const response = await fetch(urlObj.toString(), {
      headers: {
        "X-CSRFToken": CSRF_TOKEN,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  function attachVideoTracking(containerOrVideoEl, videoId, videoTitle) {
    if (typeof Analytics === 'undefined') return;
    setTimeout(() => {
      const videoEl = containerOrVideoEl.tagName === 'VIDEO' 
        ? containerOrVideoEl 
        : containerOrVideoEl.querySelector('video');
      if (videoEl) {
        videoEl.addEventListener('play', function() {
          Analytics.trackVideoPlay(videoId, videoTitle);
        }, { once: true });
      }
    }, 100);
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
          const videoId = item.id || item.file;
          const videoTitle = state.property?.title || 'Property Video';
          li.innerHTML = `
            <video class="h-full w-full object-cover" controls preload="metadata" data-video-id="${videoId}">
              <source src="${item.file}" type="video/${item.file?.endsWith(".webm") ? "webm" : "mp4"}" />
              Your browser does not support the video tag.
            </video>
          `;
          // PostHog tracking - track video play
          attachVideoTracking(li, videoId, videoTitle);
        } else {
          li.innerHTML = `
            <img src="${item.file}" alt="Property media" class="h-full w-full object-cover" loading="lazy" />
          `;
        }
        listEl.appendChild(li);
      });
    }

    if (state.heroSplide) {
      state.heroSplide.destroy(true);
    }
    const heroElement = document.querySelector("#property-hero-slider");
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
      state.heroSplide.mount();
      
      // Update image counter on slide change
      if (state.heroSplide && els.imageCounter && els.currentImage && els.totalImages) {
        const total = items.length;
        if (total > 1) {
          els.imageCounter.classList.remove("hidden");
          els.totalImages.textContent = total;
          state.heroSplide.on("moved", (newIndex) => {
            if (els.currentImage) {
              els.currentImage.textContent = (newIndex + 1);
            }
          });
          // Initial update
          if (els.currentImage) {
            els.currentImage.textContent = "1";
          }
        } else {
          els.imageCounter.classList.add("hidden");
        }
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
          const videoId = item.id || item.file;
          const videoTitle = state.property?.title || 'Property Video';
          li.innerHTML = `
            <video class="h-[80vh] w-full object-contain bg-black" controls preload="metadata" data-video-id="${videoId}">
              <source src="${item.file}" type="video/${item.file?.endsWith(".webm") ? "webm" : "mp4"}" />
              Your browser does not support the video tag.
            </video>
          `;
          // PostHog tracking - track video play
          attachVideoTracking(li, videoId, videoTitle);
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
    const modalElement = document.querySelector("#property-gallery-modal");
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
    els.galleryButtons.forEach((btn) => {
      const targetType = btn.dataset.galleryFilter;
      if (targetType === type) {
        btn.classList.add("nav-pill-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("nav-pill-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
    
    // Also update plans dropdown if active
    const plansDropdown = document.querySelector("[data-gallery-plans-dropdown]");
    if (plansDropdown) {
      const unitPlanBtn = plansDropdown.querySelector('[data-gallery-filter="unit_floor_plan"]');
      const masterPlanBtn = plansDropdown.querySelector('[data-gallery-filter="master_plan"]');
      if (unitPlanBtn) {
        unitPlanBtn.classList.toggle("nav-pill-active", type === "unit_floor_plan");
        unitPlanBtn.setAttribute("aria-pressed", type === "unit_floor_plan" ? "true" : "false");
      }
      if (masterPlanBtn) {
        masterPlanBtn.classList.toggle("nav-pill-active", type === "master_plan");
        masterPlanBtn.setAttribute("aria-pressed", type === "master_plan" ? "true" : "false");
      }
    }
  }

  async function updateGallery(type) {
    try {
      const items =
        type === "image" && state.property?.default_images
          ? state.property.default_images
          : await ensureGallery(type);
      state.activeGalleryType = type;
      setActiveGalleryButton(type);
      renderHeroSlides(items, type);
      renderModalSlides(items, type);
      // Update gallery tab visibility after fetching media
      if (state.property) {
        updateGalleryTabVisibility(state.property);
      }
    } catch (error) {
      console.error("Gallery fetch failed", error);
    }
  }

  function hydratePrimaryDetails(property) {
    applyText(els.title, property.title);
    applyText(els.address, property.address);
    applyText(els.unitId, property.unit_id);
    applyText(els.beds, property.number_of_bedroom);
    applyText(els.baths, property.number_of_bathroom);
    applyText(els.size, property.unit_area ? `${property.unit_area} sqm` : null);
    applyText(els.floor, property.floor_number);
    applyText(els.year, property.construction_year || property.date_listed);

    // Developer/Agent Header
    if (els.developerImage) {
      const defaultAvatar = "/static/media/default-avatar.jpg";
      els.developerImage.src = property.developer_image || defaultAvatar;
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
    if (els.developerName) {
      els.developerName.textContent = property.developer_company_name || "N/A";
    }
    if (els.dateRelative && els.dateLabel && els.dateValue) {
      let dateToUse = property.created_at;
      let labelText = "Added";
      if (property.updated_at && property.updated_at !== property.created_at) {
        const updatedDate = new Date(property.updated_at);
        const createdDate = new Date(property.created_at);
        const daysDiff = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1 && daysDiff < 7) {
          labelText = "Reduced";
          dateToUse = property.updated_at;
        }
      }
      els.dateLabel.textContent = labelText;
      els.dateValue.textContent = formatRelativeDate(dateToUse);
    }

    // Featured Accent Bar
    if (els.featuredAccent && property.tag === "feature") {
      els.featuredAccent.classList.remove("hidden");
    }

    // Badges
    if (els.badgesContainer) {
      els.badgesContainer.innerHTML = "";
      if (property.tag === "spotlight") {
        const badge = document.createElement("span");
        badge.className = "rounded-full border-2 border-discounted bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
        badge.textContent = "Flash Sale";
        els.badgesContainer.appendChild(badge);
      }
      if (property.tag === "feature") {
        const badge = document.createElement("span");
        badge.className = "rounded-full border-2 border-featured bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
        badge.textContent = "Featured Listing";
        els.badgesContainer.appendChild(badge);
      }
      if (property.tag === "newly_created") {
        const badge = document.createElement("span");
        badge.className = "rounded-full border-2 border-primary bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg";
        badge.textContent = "New Home";
        els.badgesContainer.appendChild(badge);
      }
    }

    // Price Overlay
    if (els.price) {
      els.price.textContent = formatCurrency(property.price);
    }
    if (els.priceSqm) {
      els.priceSqm.textContent =
        property.price_per_sqm !== null && property.price_per_sqm !== undefined
          ? `${formatCurrency(property.price_per_sqm)} / sqm`
          : "—";
    }
    // Original price and discount
    if (property.original_price && property.original_price > property.price) {
      const discount = property.original_price - property.price;
      const discountPercent = Math.round((discount / property.original_price) * 100);
      if (els.originalPrice) {
        els.originalPrice.textContent = formatCurrency(property.original_price);
        els.originalPrice.classList.remove("hidden");
      }
      if (els.discountAmount) {
        els.discountAmount.textContent = `Save ${formatCurrency(discount)} (${discountPercent}% off)`;
        els.discountAmount.classList.remove("hidden");
      }
      if (els.priceContainer) {
        els.priceContainer.classList.add("border-brand-teal/50");
      }
    } else {
      if (els.originalPrice) els.originalPrice.classList.add("hidden");
      if (els.discountAmount) els.discountAmount.classList.add("hidden");
    }

    // 3D Tour & Aerial View Buttons
    if (els.threeDBadge && els.threeDButton && property.interior_view) {
      els.threeDBadge.classList.remove("hidden");
      els.threeDButton.dataset.property3d = property.interior_view;
      els.threeDButton.setAttribute("data-3d-view", property.interior_view);
    }
    if (els.droneBadge && els.droneButton && property.ariel_view) {
      els.droneBadge.classList.remove("hidden");
      els.droneButton.dataset.propertyDrone = property.ariel_view;
      els.droneButton.setAttribute("data-drone-view", property.ariel_view);
    }
    if (els.viewButtonsContainer) {
      const hasAnyView = (els.threeDBadge && !els.threeDBadge.classList.contains("hidden")) ||
        (els.droneBadge && !els.droneBadge.classList.contains("hidden"));
      if (!hasAnyView) {
        els.viewButtonsContainer.classList.add("hidden");
      } else {
        els.viewButtonsContainer.classList.remove("hidden");
      }
    }

    // Property Type Badge - Show in header next to developer name
    // Show sub-type as badge if available, otherwise show main type
    if (els.propertyTypeBadge) {
      let typeText = null;
      
      if (property.building_sub_type) {
        // Show only sub-type (e.g., "Condo", "Apartment/Condo/Service Residence")
        // If it contains slashes, take the first one for brevity
        const subType = property.building_sub_type.split('/')[0].trim();
        typeText = subType;
      } else if (property.building_type) {
        // Fallback to main type if no sub-type
        const typeMap = {
          'residence': 'Residential',
          'commercial': 'Commercial',
          'mixed': 'Mixed Use',
        };
        typeText = typeMap[property.building_type] || property.building_type.charAt(0).toUpperCase() + property.building_type.slice(1);
      }
      
      if (typeText) {
        els.propertyTypeBadge.textContent = typeText;
        els.propertyTypeBadge.classList.remove("hidden");
      } else {
        els.propertyTypeBadge.classList.add("hidden");
      }
    }
    
    // Keep old display for backwards compatibility (hidden)
    if (els.propertyTypeDisplay) {
      const typeMap = {
        'residence': 'Residential',
        'commercial': 'Commercial',
        'mixed': 'Mixed Use',
      };
      const type = typeMap[property.building_type] || (property.building_type ? property.building_type.charAt(0).toUpperCase() + property.building_type.slice(1) : "—");
      els.propertyTypeDisplay.textContent = property.building_sub_type ? `${type} - ${property.building_sub_type}` : type;
    }
    if (els.floorWrapper && els.floorNumber && property.floor_number) {
      els.floorNumber.textContent = property.floor_number;
      els.floorWrapper.classList.remove("hidden");
    }
    if (els.parkingWrapper && els.parking && property.number_of_car_parking && property.number_of_car_parking > 0) {
      els.parking.textContent = property.number_of_car_parking;
      els.parkingWrapper.classList.remove("hidden");
    }
    if (els.tenureWrapper && els.propertyTenure) {
      const tenure = property.have_freehold ? "Freehold" : (property.have_leasehold ? "Leasehold" : null);
      if (tenure) {
        els.propertyTenure.textContent = tenure;
        els.tenureWrapper.classList.remove("hidden");
      }
    }

    if (els.contactPhone) {
      const phone = property.developer_phone_number || property.contact_phone_number || property.building?.contact_phone_number;
      if (phone) {
        els.contactPhone.textContent = phone;
        els.contactPhone.setAttribute("href", `tel:${phone}`);
      } else {
        els.contactPhone.textContent = "Get contact details";
        els.contactPhone.removeAttribute("href");
      }
    }

    if (els.contactEmail) {
      const email = property.developer_email || property.contact_email || property.building?.contact_email;
      if (email) {
        els.contactEmail.textContent = email;
        els.contactEmail.setAttribute("href", `mailto:${email}`);
      } else {
        els.contactEmail.textContent = "Request contact info";
        els.contactEmail.removeAttribute("href");
      }
    }

    // Property Information fields (consolidated section)
    if (els.infoUnitId) {
      applyText(els.infoUnitId, property.unit_id);
    }
    if (els.infoFloor) {
      applyText(els.infoFloor, property.floor_number);
    }
    if (els.infoTenure) {
      const tenure = property.have_freehold ? "Freehold" : (property.have_leasehold ? "Leasehold" : "—");
      applyText(els.infoTenure, tenure);
    }

    if (property.description) {
      renderDescription(property.description);
    }
    renderSpecifications(property);
    renderIframes(property);
    initializeMap();
    updateActions(property);
    updateAgentInfo(property);
    initShareButton();
    initNotes();
    initBackToSearch();
  }
  
  function updateAgentInfo(property) {
    // Agent/Developer branding
    if (els.agentName) {
      const agentName = property.developer_company_name || "Wizer Properties";
      els.agentName.textContent = agentName;
    }
    
    if (els.agentLogo) {
      const logoUrl = property.developer_image;
      if (logoUrl) {
        els.agentLogo.innerHTML = `<img src="${logoUrl}" alt="Agent logo" class="h-full w-full object-cover" />`;
      } else {
        els.agentLogo.innerHTML = '<div class="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Logo</div>';
      }
    }
    
    // Update contact buttons
    if (els.contactPhoneBtn) {
      const phone = property.developer_phone_number;
      if (phone) {
        els.contactPhoneBtn.setAttribute("href", `tel:${phone}`);
        els.contactPhoneBtn.classList.remove("hidden");
      } else {
        els.contactPhoneBtn.classList.add("hidden");
      }
    }
    
    if (els.contactEmailBtn) {
      const email = property.developer_email;
      if (email) {
        els.contactEmailBtn.setAttribute("href", `mailto:${email}`);
        els.contactEmailBtn.classList.remove("hidden");
      } else {
        els.contactEmailBtn.classList.add("hidden");
      }
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
          url: url
        }).catch(() => {
          // Fallback to clipboard
          copyToClipboard(url);
        });
      } else {
        copyToClipboard(url);
      }
    });
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (els.shareButton) {
        const originalText = els.shareButton.innerHTML;
        els.shareButton.innerHTML = '<i class="bi bi-check"></i> <span>Copied!</span>';
        setTimeout(() => {
          els.shareButton.innerHTML = originalText;
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      if (els.shareButton) {
        const originalText = els.shareButton.innerHTML;
        els.shareButton.innerHTML = '<i class="bi bi-check"></i> <span>Copied!</span>';
        setTimeout(() => {
          els.shareButton.innerHTML = originalText;
        }, 2000);
      }
    });
  }
  
  function initNotes() {
    if (!els.propertyNotes || !els.saveNotesBtn) return;
    
    // Load saved notes
    const propertyId = els.propertyNotes.dataset.propertyId;
    try {
      const savedNotes = localStorage.getItem(`property_notes_${propertyId}`);
      if (savedNotes) {
        els.propertyNotes.value = savedNotes;
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
    
    els.saveNotesBtn.addEventListener("click", () => {
      const notes = els.propertyNotes.value.trim();
      try {
        localStorage.setItem(`property_notes_${propertyId}`, notes);
        els.saveNotesBtn.innerHTML = '<i class="bi bi-check"></i> <span>Saved</span>';
        setTimeout(() => {
          els.saveNotesBtn.innerHTML = '<i class="bi bi-save"></i> <span>Save note</span>';
        }, 2000);
      } catch (error) {
        console.error("Failed to save notes:", error);
        els.saveNotesBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> <span>Save failed</span>';
        setTimeout(() => {
          els.saveNotesBtn.innerHTML = '<i class="bi bi-save"></i> <span>Save note</span>';
        }, 2000);
      }
    });
  }
  
  function initBackToSearch() {
    if (!els.backToSearchLink) return;
    
    // Check if there's a referrer from search pages
    const referrer = document.referrer;
    if (referrer && (referrer.includes('/property/search') || referrer.includes('/property/search-with-map'))) {
      els.backToSearchLink.href = referrer;
      els.backToSearchLink.textContent = "Back to search results";
    } else {
      // Check localStorage for saved search
      try {
        const savedSearches = JSON.parse(localStorage.getItem("saved_searches") || "[]");
        if (savedSearches.length > 0) {
          const lastSearch = savedSearches[0];
          if (lastSearch.url) {
            els.backToSearchLink.href = lastSearch.url;
            els.backToSearchLink.textContent = "Back to search results";
          }
        }
      } catch (error) {
        console.error("Failed to parse saved searches:", error);
        // Clear corrupted data
        try {
          localStorage.removeItem("saved_searches");
        } catch (e) {
          // Ignore if localStorage is unavailable
        }
      }
    }
  }

  function updateActions(property) {
    if (!els.compareButton || !els.favoriteButton) return;
    const isProspect = !["agent", "developer"].includes(userType || "");
    if (!isProspect) {
      els.compareButton.classList.add("hidden");
      els.favoriteButton.classList.add("hidden");
      return;
    }
    els.compareButton.setAttribute("index", property.id);
    els.compareButton.setAttribute("added", property.is_compared ? "true" : "false");
    els.compareButton.setAttribute("effect", favoriteEffect);
    els.compareButton.classList.remove("hidden");

    els.favoriteButton.setAttribute("index", property.id);
    els.favoriteButton.setAttribute("added", property.is_favorited ? "true" : "false");
    els.favoriteButton.setAttribute("effect", favoriteEffect);
    els.favoriteButton.classList.remove("hidden");
  }

  function renderDescription(text) {
    if (!els.description) return;
    els.description.innerHTML = "";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    els.description.appendChild(paragraph);

    if (text.length > 800 && els.descriptionToggle) {
      state.descriptionExpanded = false;
      els.description.style.maxHeight = "12rem";
      els.description.style.overflow = "hidden";
      els.descriptionToggle.classList.remove("hidden");
      els.descriptionToggle.textContent = "Expand";
    } else if (els.descriptionToggle) {
      els.descriptionToggle.classList.add("hidden");
    }
  }

  function toggleDescription() {
    if (!els.description || !els.descriptionToggle) return;
    state.descriptionExpanded = !state.descriptionExpanded;
    if (state.descriptionExpanded) {
      els.description.style.maxHeight = "100%";
      els.description.style.overflow = "visible";
      const icon = els.descriptionToggle.querySelector("i");
      if (icon) icon.className = "bi bi-chevron-up mr-1.5";
      const span = els.descriptionToggle.querySelector("span");
      if (span) span.textContent = "Collapse";
      els.descriptionToggle.setAttribute("aria-expanded", "true");
    } else {
      els.description.style.maxHeight = "12rem";
      els.description.style.overflow = "hidden";
      const icon = els.descriptionToggle.querySelector("i");
      if (icon) icon.className = "bi bi-chevron-down mr-1.5";
      const span = els.descriptionToggle.querySelector("span");
      if (span) span.textContent = "Expand";
      els.descriptionToggle.setAttribute("aria-expanded", "false");
    }
  }

  function renderSpecifications(property) {
    // Helper to show/hide wrapper based on value
    const showIfHasValue = (wrapperSelector, value) => {
      const wrapper = document.querySelector(wrapperSelector);
      if (wrapper) {
        if (value && value !== "—" && value !== null && value !== undefined && value !== "") {
          wrapper.classList.remove("hidden");
        } else {
          wrapper.classList.add("hidden");
        }
      }
    };

    applyText(els.balcony, property.number_of_balcony);
    showIfHasValue("[data-property-balcony-wrapper]", property.number_of_balcony);

    applyText(els.carparks, property.number_of_car_parking);
    showIfHasValue("[data-property-carparks-wrapper]", property.number_of_car_parking);

    const availabilityFlags = [];
    if (property.have_vacant) availabilityFlags.push("Vacant");
    if (property.have_owner_occupied) availabilityFlags.push("Owner occupied");
    if (property.have_tenant_occupied) {
      if (property.tenant_occupied_validity) {
        availabilityFlags.push(`Tenant until ${dayjs(property.tenant_occupied_validity).format("DD MMM YYYY")}`);
      } else {
        availabilityFlags.push("Tenant occupied");
      }
    }
    const availabilityText = availabilityFlags.join(" • ") || "Availability upon request";
    applyText(els.availability, availabilityText);
    showIfHasValue("[data-property-availability-wrapper]", availabilityText);

    const orientation = [];
    if (property.balcony_direction) orientation.push(`Balcony: ${property.balcony_direction}`);
    if (property.main_door_direction) orientation.push(`Door: ${property.main_door_direction}`);
    const orientationText = orientation.join(" • ") || "—";
    applyText(els.orientation, orientationText);
    showIfHasValue("[data-property-orientation-wrapper]", orientationText !== "—" ? orientationText : null);

    applyText(els.doorDirection, property.main_door_direction);
    showIfHasValue("[data-property-door-direction-wrapper]", property.main_door_direction);

    const positionText = (property.unit_position || "").replace(/_/g, " ");
    applyText(els.position, positionText);
    showIfHasValue("[data-property-position-wrapper]", positionText);

    // Also handle info section fields
    showIfHasValue("[data-info-unit-id-wrapper]", property.unit_id);
    showIfHasValue("[data-info-floor-wrapper]", property.floor_number);
    const tenure = property.have_freehold ? "Freehold" : (property.have_leasehold ? "Leasehold" : null);
    showIfHasValue("[data-info-tenure-wrapper]", tenure);
    
    // Ensure at least one field is visible - if all are hidden, show a message
    const allWrappers = document.querySelectorAll("[data-property-specifications] > div[class*='hidden']");
    const visibleWrappers = document.querySelectorAll("[data-property-specifications] > div:not(.hidden)");
    if (visibleWrappers.length === 0 && allWrappers.length > 0) {
      // All fields are hidden, show a placeholder message
      const grid = document.querySelector("[data-property-specifications]");
      if (grid && !grid.querySelector("[data-no-specs-message]")) {
        const message = document.createElement("div");
        message.className = "col-span-full rounded-xl border border-border bg-secondary/20 p-6 text-center";
        message.setAttribute("data-no-specs-message", "true");
        message.innerHTML = '<p class="text-sm text-muted-foreground">Property specifications are being updated. Check back soon for complete details.</p>';
        grid.appendChild(message);
      }
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

  function renderIframes(property) {
    if (els.facilityView) {
      if (property.facility_view && isValidUrl(property.facility_view)) {
        els.facilityView.innerHTML = `<iframe src="${property.facility_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.facilityView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Facility tour coming soon</div>';
      }
    }

    if (els.locationView) {
      if (property.location_view && isValidUrl(property.location_view)) {
        els.locationView.innerHTML = `<iframe src="${property.location_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.locationView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Location tour coming soon</div>';
      }
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
      const address = state.property?.building?.address || 
                      state.property?.address || 
                      els.buildingAddress?.textContent?.trim() ||
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

  async function fetchFacilities() {
    if (state.facilitiesFetched) return;
    state.facilitiesFetched = true;
    try {
      const data = await fetchJson(`/property/api/details/${PROPERTY_ID}/available-facilities/`);
      renderFeatures(data);
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    }
  }

  function renderFeatures(data) {
    if (!els.features) return;
    const chips = [];

    const addChip = (condition, label) => {
      if (condition) chips.push(label);
    };

    const property = state.property || {};
    addChip(property.have_vacant, "Vacant now");
    addChip(property.have_owner_occupied, "Owner occupied");
    addChip(property.have_tenant_occupied, "Tenant occupied");
    addChip(property.have_bathtub, "Bathtub");
    addChip(property.have_duplex, "Duplex layout");
    addChip(property.have_pets_allowed, "Pet friendly");

    const building = data?.building || {};
    addChip(building.have_infinity_pool, "Infinity pool");
    addChip(building.have_sky_lounge, "Sky lounge");
    addChip(building.have_fitness_area, "Fitness area");
    addChip(building.have_guard_house, "24/7 security");
    addChip(building.have_grocery, "On-site grocery");
    addChip(building.have_sauna, "Sauna");
    addChip(building.have_freehold, "Freehold");
    addChip(building.have_leasehold, "Leasehold");
    if (building.view) {
      addChip(true, `${building.view} view`);
    }
    if (building.distance_from_location_to_BTS_or_MRT) {
      addChip(true, `BTS/MRT • ${building.distance_from_location_to_BTS_or_MRT} km`);
    }
    if (building.distance_from_location_to_ARL) {
      addChip(true, `ARL • ${building.distance_from_location_to_ARL} km`);
    }

    els.features.innerHTML = "";
    if (chips.length === 0) {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-sm text-muted-foreground";
      li.innerHTML = '<i class="bi bi-info-circle mt-0.5 flex-shrink-0 text-muted-foreground"></i><span>Property features are being updated. Check back soon for complete details.</span>';
      els.features.appendChild(li);
      return;
    }

    // Render as list items (Rightmove style)
    chips.forEach((label) => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-sm leading-relaxed text-foreground";
      li.innerHTML = `<i class="bi bi-check-circle-fill mt-0.5 flex-shrink-0 text-accent"></i><span>${label}</span>`;
      els.features.appendChild(li);
    });
  }

  async function fetchBuildingSnapshot() {
    try {
      const data = await fetchJson(`/property/api/details/${PROPERTY_ID}/building-info/`);
      if (els.buildingThumbnail) {
        els.buildingThumbnail.innerHTML = data?.default_image
          ? `<img src="${data.default_image}" alt="${data.title}" class="h-full w-full object-cover" loading="lazy" />`
          : '<div class="aspect-square flex items-center justify-center text-xs text-muted-foreground">Image coming soon</div>';
      }
      applyText(els.buildingDeveloper, data?.company_name);
      applyText(els.buildingName, data?.title);
      applyText(els.buildingFloors, data?.total_floors);
      applyText(els.buildingUnits, data?.total_units_for_sale);
      applyText(els.buildingArea, data?.project_total_area ? `${data.project_total_area} sqm` : null);
      applyText(els.buildingType, (data?.type || "").replace(/_/g, " "));
      applyText(els.buildingCompletion, data?.construction_year);
      applyText(els.buildingAddress, data?.address);
    } catch (error) {
      console.error("Failed to fetch building snapshot", error);
    }
  }

  function createRatingStars(rating) {
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
            ${createRatingStars(Math.round(average))}
          </div>
        </div>
    `;

    if (!data.has_reviewed && userType === "prospect") {
      html += `
        <div class="review-submit-area mt-6 space-y-4 rounded-2xl border border-border bg-background p-4">
          <p class="text-sm font-semibold text-foreground">Share your experience</p>
          <div class="flex items-center gap-2 text-xl text-accent give-rating">
            ${createRatingStars(0)}
          </div>
          <textarea class="give-review input min-h-[140px]" placeholder="Share your experience with this property..."></textarea>
          <div class="review-warrning-text space-y-1 text-xs text-destructive"></div>
          <button class="btn w-full justify-center review-submit-btn text-sm">Share your review</button>
        </div>
      `;
    }

    html += `</div>`;
    els.reviewsWrapper.innerHTML = html;
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
          ${createRatingStars(review.rating)}
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

  function bindReviewInteractions() {
    if (state.reviews.hasLoaded) return;
    state.reviews.hasLoaded = true;
    let selectedRating = 0;

    document.addEventListener("mouseover", (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        const rating = parseInt(event.target.dataset.rating, 10);
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = createRatingStars(rating);
        }
      }
    });

    document.addEventListener("mouseout", (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = createRatingStars(selectedRating);
        }
      }
    });

    document.addEventListener("click", async (event) => {
      if (event.target.matches(".give-rating [data-rating]")) {
        selectedRating = parseInt(event.target.dataset.rating, 10);
        const container = event.target.closest(".give-rating");
        if (container) {
          container.innerHTML = createRatingStars(selectedRating);
        }
      }

      if (event.target.closest(".review-submit-btn")) {
        await submitReview(selectedRating);
      }

      if (event.target.closest(".load-more-reviews button")) {
        await fetchMoreReviews();
      }
    });
  }

  async function submitReview(rating) {
    if (state.reviews.loading) return;
    const warning = document.querySelector(".review-warrning-text");
    if (!rating) {
      if (warning) warning.textContent = "Please rate this property to help other buyers.";
      return;
    }
    const textarea = document.querySelector(".give-review");
    const reviewText = textarea ? textarea.value.trim() : "";
    if (!reviewText) {
      if (warning) warning.textContent = "Your review helps other buyers. Please share your experience.";
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
          building: RELATED_BUILDING_ID,
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

  async function fetchMoreReviews() {
    if (state.reviews.loading || !state.reviews.next) return;
    state.reviews.loading = true;
    try {
      const data = await fetchJson("/building/api/review/list/", {
        building_id: RELATED_BUILDING_ID,
        page_size: 5,
        page: state.reviews.next,
      });
      const results = data?.results || [];
      results.forEach((review) => appendReview(review));
      state.reviews.next = data?.next || null;
      if (!state.reviews.next && els.reviewsLoadMore) {
        els.reviewsLoadMore.innerHTML =
          '<p class="mt-4 text-center text-xs text-muted-foreground">No additional reviews.</p>';
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
          fetchMoreReviews();
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(reviewsSection);
  }

  function renderUnitCard(unit) {
    // Validate and sanitize unit data
    const unitId = parseInt(unit.id, 10);
    if (isNaN(unitId) || unitId <= 0) {
      console.error("Invalid unit ID:", unit.id);
      return null;
    }
    
    // Validate image URL - ensure it's a safe URL
    let imageUrl = "";
    if (unit.default_image) {
      try {
        // If it's a relative URL, it's safe; if absolute, validate the protocol
        if (unit.default_image.startsWith("/") || unit.default_image.startsWith("./")) {
          imageUrl = unit.default_image;
        } else {
          const url = new URL(unit.default_image, window.location.origin);
          if (["http:", "https:"].includes(url.protocol)) {
            imageUrl = url.href;
          }
        }
      } catch (e) {
        console.error("Invalid image URL:", unit.default_image);
        imageUrl = "";
      }
    }
    
    // Create card container
    const card = document.createElement("div");
    card.className = "h-full rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden";
    
    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "relative";
    
    const img = document.createElement("img");
    img.src = imageUrl || "";
    img.alt = "Unit image";
    img.className = "h-40 w-full object-cover";
    img.loading = "lazy";
    imageContainer.appendChild(img);
    
    // Add favorite button if user is prospect
    if (!["agent", "developer"].includes(userType)) {
      const favoriteContainer = document.createElement("div");
      favoriteContainer.className = "absolute right-3 top-3 flex flex-col gap-2";
      
      const favoriteButton = document.createElement("button");
      favoriteButton.className = "inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow";
      
      const heartIcon = document.createElement("i");
      heartIcon.className = unit.is_favorited ? "bi bi-heart-fill text-primary" : "bi bi-heart";
      favoriteButton.appendChild(heartIcon);
      
      const favoriteText = document.createTextNode("Favourite");
      favoriteButton.appendChild(favoriteText);
      
      favoriteContainer.appendChild(favoriteButton);
      imageContainer.appendChild(favoriteContainer);
    }
    
    card.appendChild(imageContainer);
    
    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "flex flex-1 flex-col gap-4 p-4";
    
    // Price section
    const priceSection = document.createElement("div");
    priceSection.className = "space-y-1";
    
    const priceP = document.createElement("p");
    priceP.className = "text-base font-semibold text-foreground";
    priceP.textContent = `฿ ${formatNumber(unit.price || 0)}`;
    priceSection.appendChild(priceP);
    
    const pricePerSqmP = document.createElement("p");
    pricePerSqmP.className = "text-xs text-muted-foreground";
    pricePerSqmP.textContent = `฿ ${formatNumber(unit.price_per_sqm || 0)} / sqm`;
    priceSection.appendChild(pricePerSqmP);
    
    contentContainer.appendChild(priceSection);
    
    // Specs grid
    const specsGrid = document.createElement("div");
    specsGrid.className = "grid grid-cols-2 gap-3 text-xs text-muted-foreground";
    
    // Helper function to create spec item
    const createSpecItem = (label, value) => {
      const item = document.createElement("div");
      item.className = "rounded-lg bg-secondary/50 px-3 py-2";
      
      const labelSpan = document.createElement("span");
      labelSpan.className = "block text-[11px] uppercase tracking-wide";
      labelSpan.textContent = label;
      item.appendChild(labelSpan);
      
      const valueSpan = document.createElement("span");
      valueSpan.className = "text-sm font-semibold text-foreground";
      valueSpan.textContent = value;
      item.appendChild(valueSpan);
      
      return item;
    };
    
    specsGrid.appendChild(createSpecItem("Beds", unit.number_of_bedroom || "—"));
    specsGrid.appendChild(createSpecItem("Baths", unit.number_of_bathroom || "—"));
    specsGrid.appendChild(createSpecItem("Size", unit.unit_area ? `${unit.unit_area} sqm` : "—"));
    specsGrid.appendChild(createSpecItem("Floor", unit.floor_number || "—"));
    
    contentContainer.appendChild(specsGrid);
    
    // View details button
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "mt-auto";
    
    const viewLink = document.createElement("a");
    viewLink.href = `/property/details/${unitId}/`;
    viewLink.className = "btn-secondary w-full justify-center text-sm";
    viewLink.textContent = "View details";
    buttonContainer.appendChild(viewLink);
    
    contentContainer.appendChild(buttonContainer);
    card.appendChild(contentContainer);
    
    return card;
  }

  function calculatePerPage() {
    if (window.innerWidth <= 460) return 1;
    if (window.innerWidth <= 740) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
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
        property_id: PROPERTY_ID,
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
        const card = renderUnitCard(unit);
        if (!card) return; // Skip invalid units
        
        const li = document.createElement("li");
        li.className = "splide__slide";
        li.appendChild(card);
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
        els.availableFilterChips.forEach((el) => {
          el.classList.remove("filter-chip-active");
        });
        chip.classList.add("filter-chip-active");
        state.available.next = null;
        fetchAvailableUnits({ append: false });
      });
    });

    const section = els.availableList?.closest("section");
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

  function openViewModal(type, url) {
    if (!url) return;
    if (type === "3d") {
      updateGallery("interior_view");
      toggleGalleryModal(true);
    } else if (type === "drone") {
      updateGallery("aerial_drone_video");
      toggleGalleryModal(true);
    }
  }

  function initGalleryControls() {
    els.galleryButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const type = button.dataset.galleryFilter;
        if (!type) return;
        if (type === state.activeGalleryType && state.galleryCache.has(type)) {
          return;
        }
        await updateGallery(type);
        // Update aria-pressed for all buttons
        els.galleryButtons.forEach((btn) => {
          btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
        });
      });
      
      // Keyboard support
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          button.click();
        }
      });
    });
    
    initPlansDropdown();

    if (els.galleryOpen) {
      els.galleryOpen.addEventListener("click", () => {
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

    // 3D Tour and Aerial View buttons
    if (els.threeDButton) {
      els.threeDButton.addEventListener("click", () => {
        const viewUrl = els.threeDButton.getAttribute("data-3d-view");
        openViewModal("3d", viewUrl);
      });
    }

    if (els.droneButton) {
      els.droneButton.addEventListener("click", () => {
        const viewUrl = els.droneButton.getAttribute("data-drone-view");
        openViewModal("drone", viewUrl);
      });
    }
  }

  async function updateGalleryTabVisibility(property) {
    const tabsContainer = document.querySelector("[data-gallery-tabs-container]");
    if (!tabsContainer) return;

    // Check which media types are available
    const availableTypes = new Set();
    
    // Always show images if default_images exist
    if (property.default_images && property.default_images.length > 0) {
      availableTypes.add("image");
    }

    // Check property fields for view types
    if (property.interior_view) availableTypes.add("interior_view");
    if (property.facility_view) availableTypes.add("facility_view");
    if (property.ariel_view) availableTypes.add("aerial_drone_video");

    // Check gallery cache for other types (don't fetch if not cached yet)
    const mediaTypesToCheck = ["unit_floor_plan", "master_plan", "video"];
    for (const type of mediaTypesToCheck) {
      if (state.galleryCache.has(type)) {
        const items = state.galleryCache.get(type);
        if (items && items.length > 0) {
          availableTypes.add(type);
        }
      }
    }

    // Show/hide tabs based on available media
    els.galleryButtons.forEach((button) => {
      const type = button.dataset.galleryFilter;
      if (availableTypes.has(type)) {
        button.classList.remove("hidden");
      } else if (type !== "image") {
        // Keep image tab visible, hide others if not available
        button.classList.add("hidden");
      }
    });

    // Handle Plans dropdown visibility
    const plansDropdown = document.querySelector("[data-gallery-plans-dropdown]");
    const hasUnitPlans = availableTypes.has("unit_floor_plan");
    const hasMasterPlan = availableTypes.has("master_plan");
    
    if (plansDropdown) {
      if (hasUnitPlans || hasMasterPlan) {
        plansDropdown.classList.remove("hidden");
        // Update dropdown menu items
        const unitPlanBtn = plansDropdown.querySelector('[data-gallery-filter="unit_floor_plan"]');
        const masterPlanBtn = plansDropdown.querySelector('[data-gallery-filter="master_plan"]');
        if (unitPlanBtn) unitPlanBtn.classList.toggle("hidden", !hasUnitPlans);
        if (masterPlanBtn) masterPlanBtn.classList.toggle("hidden", !hasMasterPlan);
      } else {
        plansDropdown.classList.add("hidden");
      }
    }

    // If only image tab is visible and no other media, consider hiding tabs section
    const visibleTabs = Array.from(els.galleryButtons).filter(btn => !btn.classList.contains("hidden"));
    const hasPlansDropdown = plansDropdown && !plansDropdown.classList.contains("hidden");
    const tabsSection = tabsContainer.closest(".border-t");
    
    if ((visibleTabs.length === 1 && visibleTabs[0].dataset.galleryFilter === "image" && !hasPlansDropdown) && tabsSection) {
      // Only images available - tabs section can stay visible
      tabsSection.classList.remove("hidden");
    } else if (visibleTabs.length === 0 && !hasPlansDropdown && tabsSection) {
      tabsSection.classList.add("hidden");
    } else if ((visibleTabs.length > 0 || hasPlansDropdown) && tabsSection) {
      tabsSection.classList.remove("hidden");
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

  async function fetchPropertyDetails() {
    try {
      const data = await fetchJson(ASSET_API_URL, { default_images_number: 5, reviewed_by: USER_ID });
      state.property = data;
      state.galleryCache.set("image", data.default_images || []);
      hydratePrimaryDetails(data);
      renderHeroSlides(data.default_images || [], "image");
      renderModalSlides(data.default_images || [], "image");
      await updateGallery("image");
      // Update gallery tab visibility after initial load
      updateGalleryTabVisibility(data);
      renderReviewsHeader(data.reviews);
      if (Array.isArray(data.reviews?.results)) {
        data.reviews.results.forEach((review) => appendReview(review));
      }
      state.reviews.next = data.reviews?.next || null;
      if (els.reviewsLoadMore) {
        if (state.reviews.next) {
          els.reviewsLoadMore.innerHTML =
            '<button class="btn-secondary mt-4 inline-flex items-center justify-center px-4 py-2 text-sm">Load More</button>';
        } else {
          els.reviewsLoadMore.innerHTML =
            '<p class="mt-4 text-center text-xs text-muted-foreground">Be the first to help other buyers. Share your honest experience with this property.</p>';
        }
      }
      bindReviewInteractions();
    } catch (error) {
      console.error("Failed to fetch property details", error);
    }
  }

  function initDescriptionToggle() {
    if (els.descriptionToggle) {
      els.descriptionToggle.addEventListener("click", toggleDescription);
    }
  }

  function initFacilitiesObserver() {
    const target = els.features;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          fetchFacilities();
          fetchBuildingSnapshot();
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(target);
  }

  function initLoadMoreObserver() {
    if (!els.reviewsLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreReviews();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(els.reviewsLoadMore);
  }

  function initStickyCTA() {
    const stickyCTA = document.getElementById("sticky-book-cta");
    if (!stickyCTA) return;

    const heroSection = document.querySelector("article");
    if (!heroSection) return;

    let isVisible = false;
    const scrollThreshold = 300; // Show after 300px scroll

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > scrollThreshold;

      if (shouldShow !== isVisible) {
        isVisible = shouldShow;
        if (isVisible) {
          stickyCTA.classList.remove("hidden");
          stickyCTA.classList.add("animate-fade-in");
        } else {
          stickyCTA.classList.add("hidden");
          stickyCTA.classList.remove("animate-fade-in");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
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

  async function init() {
    await fetchPropertyDetails();
    initDescriptionToggle();
    initGalleryControls();
    initAvailableUnits();
    initReviewsObserver();
    initFacilitiesObserver();
    initLoadMoreObserver();
    initStickyCTA();
    initSectionAnimations();
    fetchSimilarProperties();
  }
  
  function initSimilarSlider() {
    const sliderElement = document.querySelector("#similar-properties-slider");
    if (!sliderElement) return;
    if (state.similar.splide) {
      state.similar.splide.destroy(true);
    }
    state.similar.splide = new Splide(sliderElement, {
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
    state.similar.splide.mount();
    state.similar.initialized = true;
  }

  async function fetchSimilarProperties() {
    if (!els.similarProperties || !state.property) return;
    
    try {
      // Fetch similar properties based on building type and price range
      const priceRange = Number(state.property.price) || 0;
      
      // Skip if no valid price
      if (!Number.isFinite(priceRange) || priceRange <= 0) {
        if (els.similarProperties) {
          els.similarProperties.innerHTML = "";
        }
        return;
      }
      
      const minPrice = Math.max(0, priceRange * 0.7);
      const maxPrice = priceRange * 1.3;
      
      const data = await fetchJson("/property/api/list/", {
        building_type: state.property.building_type,
        min_price: Math.floor(minPrice),
        max_price: Math.ceil(maxPrice),
        page_size: calculatePerPage() * 2,
        exclude_id: PROPERTY_ID
      });
      
      const results = data?.results || [];
      if (!els.similarProperties) return;
      
      if (results.length === 0) {
        els.similarProperties.innerHTML = "";
        return;
      }
      
      renderSimilarProperties(results);
    } catch (error) {
      console.error("Failed to fetch similar properties", error);
      if (els.similarProperties) {
        els.similarProperties.innerHTML = "";
      }
    }
  }
  
  function renderSimilarProperties(properties) {
    if (!els.similarProperties) return;
    
    els.similarProperties.innerHTML = "";
    
    if (properties.length === 0) {
      return;
    }
    
    properties.forEach((property) => {
      // Convert property data to match unit card format
      const unit = {
        id: property.id,
        default_image: property.default_image || (property.default_images?.[0]?.file || ""),
        price: property.price || 0,
        price_per_sqm: property.price_per_sqm || 0,
        number_of_bedroom: property.number_of_bedroom || 0,
        number_of_bathroom: property.number_of_bathroom || 0,
        unit_area: property.unit_area || 0,
        floor_number: property.floor_number || 0,
        is_favorited: property.is_favorited || false,
      };
      
      const card = renderUnitCard(unit);
      if (!card) return; // Skip invalid units
      
      const li = document.createElement("li");
      li.className = "splide__slide";
      li.appendChild(card);
      els.similarProperties.appendChild(li);
    });

    if (!state.similar.initialized) {
      initSimilarSlider();
    } else {
      state.similar.splide.refresh();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();


