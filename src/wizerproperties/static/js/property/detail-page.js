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
    propertyTypeBadge: document.querySelector("[data-property-type-badge]"),
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
      splide: null,
      filter: "all",
      next: null,
      fetching: false,
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
      } else {
        btn.classList.remove("nav-pill-active");
      }
    });
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
        const daysDiff = (updatedDate - createdDate) / (1000 * 60 * 60 * 24);
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
      els.descriptionToggle.textContent = "Collapse";
    } else {
      els.description.style.maxHeight = "12rem";
      els.description.style.overflow = "hidden";
      els.descriptionToggle.textContent = "Expand";
    }
  }

  function renderSpecifications(property) {
    applyText(els.balcony, property.number_of_balcony);
    applyText(els.carparks, property.number_of_car_parking);

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
    applyText(els.availability, availabilityFlags.join(" • ") || "Availability upon request");

    const orientation = [];
    if (property.balcony_direction) orientation.push(`Balcony: ${property.balcony_direction}`);
    if (property.main_door_direction) orientation.push(`Door: ${property.main_door_direction}`);
    applyText(els.orientation, orientation.join(" • ") || "—");
    applyText(els.doorDirection, property.main_door_direction);
    applyText(els.position, (property.unit_position || "").replace(/_/g, " "));
  }

  function renderIframes(property) {
    if (els.facilityView) {
      if (property.facility_view) {
        els.facilityView.innerHTML = `<iframe src="${property.facility_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.facilityView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Facility tour coming soon</div>';
      }
    }

    if (els.locationView) {
      if (property.location_view) {
        els.locationView.innerHTML = `<iframe src="${property.location_view}" class="aspect-video w-full" allowfullscreen loading="lazy"></iframe>`;
      } else {
        els.locationView.innerHTML =
          '<div class="aspect-video flex items-center justify-center text-xs text-muted-foreground">Location tour coming soon</div>';
      }
    }
  }

  function initializeMap() {
    const mapNode = document.getElementById("map");
    if (!mapNode) return;
    const defaultLatLng = { lat: 13.7563, lng: 100.5018 };
    buildingGeocodeAddress(mapNode, defaultLatLng);
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
          <textarea class="give-review input min-h-[140px]" placeholder="Share your honest experience—what you loved, what could be better, and who this property is perfect for..."></textarea>
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
      if (warning) warning.textContent = "Please share your experience—your review helps other buyers make confident decisions.";
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

  function createAvailableCard(unit) {
    // Use PropertyCardFactory if available, otherwise fallback to simple card
    const CardFactory = window.PropertyCardFactory;
    if (CardFactory && typeof CardFactory.createCard === "function") {
      const card = CardFactory.createCard(unit, {
        showActions: !["agent", "developer"].includes(userType || ""),
        favoriteEffect: favoriteEffect,
        scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
        showSchedule: userType === "prospect" || !userType,
        contactEmail: (p) => p?.developer_email || null,
        enableMediaButtons: true,
        listView: false,
      });
      
      // Initialize Splide for the card's image slider if present
      const splideElement = card.querySelector(".splide");
      if (splideElement && splideElement.dataset.splideMounted !== "true") {
        const splide = new Splide(splideElement, {
          perPage: 1,
          gap: "0.75rem",
          pagination: false,
          arrows: true,
        });
        splide.mount();
        splideElement.dataset.splideMounted = "true";
      }
      
      return card;
    }
    
    // Fallback for when PropertyCardFactory is not available
    const fallbackCard = document.createElement("div");
    fallbackCard.className = "rounded-2xl border border-border bg-card shadow-sm";
    fallbackCard.innerHTML = `
      <div class="relative">
        <img src="${unit.default_image || "/static/media/placeholder.png"}" alt="${unit.title || "Available unit"}" class="h-48 w-full rounded-t-2xl object-cover" loading="lazy" />
      </div>
      <div class="space-y-4 p-4">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-foreground">${formatCurrency(unit.price)}</span>
          <span class="text-xs text-muted-foreground">${formatCurrency(unit.price_per_sqm)} / sqm</span>
        </div>
        <a href="/property/details/${unit.id}/" class="btn-secondary w-full justify-center text-sm">View details</a>
      </div>
    `;
    return fallbackCard;
  }

  async function fetchAvailableUnits({ append = false } = {}) {
    if (state.available.fetching) return;
    state.available.fetching = true;

    const perPage = window.innerWidth <= 460 ? 1 : window.innerWidth <= 740 ? 2 : window.innerWidth <= 1200 ? 3 : 4;

    try {
      const data = await fetchJson(AVAILABLE_API_URL, {
        page_size: perPage,
        page: append ? state.available.next : 1,
        bed: state.available.filter === "all" ? null : state.available.filter,
        property_id: PROPERTY_ID,
      });

      const results = data?.results || [];
      state.available.next = data?.next || null;

      if (!els.availableList) return;
      if (!append) {
        els.availableList.innerHTML = "";
      }

      if (results.length === 0 && !append) {
        const li = document.createElement("li");
        li.className = "splide__slide";
        li.innerHTML = `<div class="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">No other units available right now.</div>`;
        els.availableList.appendChild(li);
      } else {
        results.forEach((unit) => {
          const li = document.createElement("li");
          li.className = "splide__slide";
          const card = createAvailableCard(unit);
          li.appendChild(card);
          els.availableList.appendChild(li);
        });
      }

      if (state.available.splide) {
        state.available.splide.destroy(true);
        state.available.splide = null;
      }

      const slider = document.querySelector("#property-available-slider");
      if (slider) {
        state.available.splide = new Splide(slider, {
          gap: "1rem",
          perPage,
          omitEnd: true,
          arrows: true,
          pagination: false,
          breakpoints: {
            1200: { perPage: 3 },
            900: { perPage: 2 },
            640: { perPage: 1 },
          },
        });
        state.available.splide.mount();
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
        els.availableFilterChips.forEach((el) => el.classList.remove("filter-chip-active"));
        chip.classList.add("filter-chip-active");
        state.available.next = null;
        fetchAvailableUnits({ append: false });
      });
    });

    const section = document.querySelector("#property-available-slider");
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
      });
    });

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

  async function fetchPropertyDetails() {
    try {
      const data = await fetchJson(ASSET_API_URL, { default_images_number: 5, reviewed_by: USER_ID });
      state.property = data;
      state.galleryCache.set("image", data.default_images || []);
      hydratePrimaryDetails(data);
      renderHeroSlides(data.default_images || [], "image");
      renderModalSlides(data.default_images || [], "image");
      await updateGallery("image");
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
            '<p class="mt-4 text-center text-xs text-muted-foreground">Be the first to help other buyers—share your honest experience with this property.</p>';
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

  async function init() {
    await fetchPropertyDetails();
    initDescriptionToggle();
    initGalleryControls();
    initAvailableUnits();
    initReviewsObserver();
    initFacilitiesObserver();
    initLoadMoreObserver();
    fetchSimilarProperties();
  }
  
  async function fetchSimilarProperties() {
    if (!els.similarProperties || !state.property) return;
    
    try {
      // Fetch similar properties based on building type and price range
      const priceRange = Number(state.property.price) || 0;
      
      // Skip if no valid price
      if (!Number.isFinite(priceRange) || priceRange <= 0) {
        els.similarProperties.innerHTML = '<p class="text-sm text-muted-foreground">No similar properties found.</p>';
        return;
      }
      
      const minPrice = Math.max(0, priceRange * 0.7);
      const maxPrice = priceRange * 1.3;
      
      const data = await fetchJson("/property/api/list/", {
        building_type: state.property.building_type,
        min_price: Math.floor(minPrice),
        max_price: Math.ceil(maxPrice),
        page_size: 4,
        exclude_id: PROPERTY_ID
      });
      
      const results = data?.results || [];
      if (results.length === 0) {
        els.similarProperties.innerHTML = '<p class="text-sm text-muted-foreground">No similar properties found.</p>';
        return;
      }
      
      renderSimilarProperties(results);
    } catch (error) {
      console.error("Failed to fetch similar properties", error);
      els.similarProperties.innerHTML = '<p class="text-sm text-muted-foreground">Unable to load similar properties.</p>';
    }
  }
  
  function renderSimilarProperties(properties) {
    if (!els.similarProperties) return;
    
    els.similarProperties.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
    // Use PropertyCardFactory if available
    const CardFactory = window.PropertyCardFactory;
    if (CardFactory && typeof CardFactory.createCard === "function") {
      properties.forEach((property) => {
        const card = CardFactory.createCard(property, {
          showActions: !["agent", "developer"].includes(userType || ""),
          favoriteEffect: favoriteEffect,
          scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
          showSchedule: userType === "prospect" || !userType,
          contactEmail: (p) => p?.developer_email || null,
          enableMediaButtons: true,
          listView: false,
        });
        
        // Initialize Splide for the card's image slider if present
        const splideElement = card.querySelector(".splide");
        if (splideElement && splideElement.dataset.splideMounted !== "true") {
          const splide = new Splide(splideElement, {
            perPage: 1,
            gap: "0.75rem",
            pagination: false,
            arrows: true,
          });
          splide.mount();
          splideElement.dataset.splideMounted = "true";
        }
        
        fragment.appendChild(card);
      });
    } else {
      // Fallback for when PropertyCardFactory is not available
      properties.forEach((property) => {
        const card = document.createElement("a");
        card.href = `/property/details/${property.id}/`;
        card.className = "group block overflow-hidden rounded-xl border border-border bg-card transition hover:border-accent/40 hover:shadow-md";
        
        const imageUrl = property.default_images?.[0]?.file || property.default_image || "/static/media/background/home-page-bg.webp";
        const price = formatCurrency(property.price);
        const address = property.address || "Address not available";
        const beds = property.number_of_bedroom || "—";
        const baths = property.number_of_bathroom || "—";
        
        card.innerHTML = `
          <div class="aspect-video overflow-hidden bg-muted">
            <img src="${imageUrl}" alt="${property.title || 'Property'}" class="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          </div>
          <div class="p-4">
            <p class="text-lg font-semibold text-foreground">${price}</p>
            <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">${address}</p>
            <div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span><i class="bi bi-bed"></i> ${beds}</span>
              <span><i class="bi bi-bathtub"></i> ${baths}</span>
            </div>
          </div>
        `;
        
        fragment.appendChild(card);
      });
    }
    
    els.similarProperties.appendChild(fragment);
  }

  document.addEventListener("DOMContentLoaded", init);
})();


