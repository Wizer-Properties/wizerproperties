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
    infoTenure: document.querySelector("[data-info-tenure]"),
    infoParking: document.querySelector("[data-info-parking]"),
    infoUnitId: document.querySelector("[data-info-unit-id]"),
    infoFloor: document.querySelector("[data-info-floor]"),
    infoBalcony: document.querySelector("[data-info-balcony]"),
    infoPosition: document.querySelector("[data-info-position]"),
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

  function renderHeroSlides(items, type) {
    const listEl = els.galleryList;
    if (!listEl) return;

    listEl.innerHTML = "";
    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.className = "splide__slide h-72 rounded-xl bg-muted flex items-center justify-center text-sm text-muted-foreground";
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
            <video class="h-72 w-full rounded-xl border border-border object-cover" controls preload="metadata" data-video-id="${videoId}">
              <source src="${item.file}" type="video/${item.file?.endsWith(".webm") ? "webm" : "mp4"}" />
              Your browser does not support the video tag.
            </video>
          `;
          // PostHog tracking - track video play
          setTimeout(() => {
            const videoEl = li.querySelector('video');
            if (videoEl && typeof Analytics !== 'undefined') {
              videoEl.addEventListener('play', function() {
                Analytics.trackVideoPlay(videoId, videoTitle);
              }, { once: true });
            }
          }, 100);
        } else {
          li.innerHTML = `
            <img src="${item.file}" alt="Property media" class="h-72 w-full rounded-xl border border-border object-cover" loading="lazy" />
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
          setTimeout(() => {
            const videoEl = li.querySelector('video');
            if (videoEl && typeof Analytics !== 'undefined') {
              videoEl.addEventListener('play', function() {
                Analytics.trackVideoPlay(videoId, videoTitle);
              }, { once: true });
            }
          }, 100);
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

    if (els.price) {
      els.price.textContent = formatCurrency(property.price);
    }
    if (els.priceSqm) {
      els.priceSqm.textContent =
        property.price_per_sqm !== null && property.price_per_sqm !== undefined
          ? `${formatCurrency(property.price_per_sqm)} / sqm`
          : "—";
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
    const savedNotes = localStorage.getItem(`property_notes_${propertyId}`);
    if (savedNotes) {
      els.propertyNotes.value = savedNotes;
    }
    
    els.saveNotesBtn.addEventListener("click", () => {
      const notes = els.propertyNotes.value.trim();
      localStorage.setItem(`property_notes_${propertyId}`, notes);
      els.saveNotesBtn.innerHTML = '<i class="bi bi-check"></i> <span>Saved</span>';
      setTimeout(() => {
        els.saveNotesBtn.innerHTML = '<i class="bi bi-save"></i> <span>Save note</span>';
      }, 2000);
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
      const savedSearches = JSON.parse(localStorage.getItem("saved_searches") || "[]");
      if (savedSearches.length > 0) {
        const lastSearch = savedSearches[0];
        if (lastSearch.url) {
          els.backToSearchLink.href = lastSearch.url;
          els.backToSearchLink.textContent = "Back to search results";
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

  function renderAvailableCard(unit) {
    const chip = (label, value, icon) => `
      <div class="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
        <img src="${icon}" alt="${label}" class="size-4" loading="lazy" />
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground">${label}</span>
          <span class="text-sm font-semibold text-foreground">${value}</span>
        </div>
      </div>
    `;

    return `
      <div class="rounded-2xl border border-border bg-card shadow-sm">
        <div class="relative">
          <img src="${unit.default_image || "/static/media/placeholder.png"}" alt="${unit.title || "Available unit"}" class="h-48 w-full rounded-t-2xl object-cover" loading="lazy" />
          <div class="absolute left-4 top-4 flex flex-col gap-2">
            ${
              !["agent", "developer"].includes(userType || "")
                ? `
                  <button class="add-to-favorite inline-flex items-center gap-1 rounded-full border border-border bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur" added="${unit.is_favorited}" index="${unit.id}" effect="${favoriteEffect}">
                    <i class="bi bi-heart"></i><span>Save</span>
                  </button>
                  <button class="add-to-compare inline-flex items-center gap-1 rounded-full border border-border bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur" added="${unit.is_compared}" index="${unit.id}" effect="${favoriteEffect}">
                    <i class="bi bi-arrow-left-right"></i><span>Compare</span>
                  </button>`
                : ""
            }
          </div>
        </div>
        <div class="space-y-4 p-4">
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold text-foreground">${formatCurrency(unit.price)}</span>
            <span class="text-xs text-muted-foreground">${formatCurrency(unit.price_per_sqm)} / sqm</span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            ${chip("Beds", unit.number_of_bedroom, "/static/media/icons/bed.svg")}
            ${chip("Baths", unit.number_of_bathroom, "/static/media/icons/bath.svg")}
            ${chip("Size", `${unit.unit_area} sqm`, "/static/media/icons/plan-size.svg")}
            ${chip("Floor", unit.floor_number, "/static/media/icons/stairs.svg")}
          </div>
          <a href="/property/details/${unit.id}/" class="btn-secondary w-full justify-center text-sm">View details</a>
        </div>
      </div>
    `;
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
          li.innerHTML = renderAvailableCard(unit);
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
      const priceRange = state.property.price || 0;
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
    
    els.similarProperties.appendChild(fragment);
  }

  document.addEventListener("DOMContentLoaded", init);
})();


