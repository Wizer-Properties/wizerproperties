"use strict";

(function () {
  const CardFactory = window.PropertyCardFactory;
  const CountdownTimer = typeof Countdown === "function" ? Countdown : null;
  const csrfToken = typeof window.csrfToken !== "undefined" ? window.csrfToken : "";
  const userType = typeof window.user_type !== "undefined" ? window.user_type : null;
  const showActions = !["agent", "developer"].includes(userType || "");
  const favoriteEffect = localStorage.getItem("favorite-effect") || "pulse";

  if (typeof Splide !== "function") {
    console.warn("Splide is required for home.js but was not found.");
    return;
  }

  const selectors = {
    heroInput: document.getElementById("gm-search-input"),
    searchButton: document.getElementById("location-search-btn"),
    clearLocation: document.querySelector("[data-search-clear]"),
    errorNode: document.querySelector("[data-search-error]"),
    propertyTypeButtons: document.querySelectorAll("[data-property-type]"),
  };

  const perPageBreakpoints = () => {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1200) return 2;
    return 3;
  };

  const createLoaderSlide = () => {
    const slide = document.createElement("li");
    slide.className = "splide__slide";
    slide.dataset.sliderLoader = "true";
    slide.innerHTML = `
      <div class="h-full w-full animate-pulse rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div class="aspect-video w-full rounded-2xl bg-muted"></div>
        <div class="mt-4 space-y-3">
          <div class="h-4 w-3/4 rounded bg-muted"></div>
          <div class="h-4 w-1/2 rounded bg-muted"></div>
          <div class="h-3 w-full rounded bg-muted"></div>
        </div>
      </div>
    `;
    return slide;
  };

  const addLoaders = (listElement, count = 3) => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      fragment.appendChild(createLoaderSlide());
    }
    listElement.appendChild(fragment);
  };

  const clearLoaders = (listElement) => {
    listElement.querySelectorAll("[data-slider-loader]").forEach((node) => node.remove());
  };

  const convertCountdownAttributes = (container) => {
    container.querySelectorAll("[data-date-count]").forEach((node) => {
      if (!node.hasAttribute("date-count")) {
        node.setAttribute("date-count", node.dataset.dateCount);
      }
    });
  };

  const refreshCountdowns = () => {
    if (!CountdownTimer) return;
    try {
      new CountdownTimer({ template: "dd|hh|mm", labels: "d|h|m" });
    } catch (error) {
      console.warn("Failed to initialise countdown timer", error);
    }
  };

  const mountGallery = (card) => {
    const gallery = card.querySelector(".splide");
    if (!gallery || gallery.dataset.splideMounted === "true") return;
    const gallerySplide = new Splide(gallery, {
      type: "fade",
      perPage: 1,
      arrows: true,
      pagination: false,
    });
    gallerySplide.mount();
    gallery.dataset.splideMounted = "true";
  };

  const createFallbackCard = (property = {}) => {
    const wrapper = document.createElement("article");
    const price = Number(property.price) || 0;
    const priceText = typeof window.formatBalance === "function"
      ? window.formatBalance(price)
      : price.toLocaleString();
    wrapper.className = "rounded-3xl border border-border bg-card p-6 shadow-sm";
    wrapper.innerHTML = `
      <div class="space-y-3">
        <h3 class="text-lg font-semibold text-foreground">${property.building_title || property.title || "Available property"}</h3>
        <p class="text-sm text-muted-foreground">${property.address || "Thailand"}</p>
        <p class="text-2xl font-semibold text-foreground">฿ ${priceText}</p>
        <a class="inline-flex items-center gap-2 text-sm text-primary" href="/property/details/${property.id ?? ""}/">
          View details <i class="bi bi-arrow-up-right"></i>
        </a>
      </div>
    `;
    return wrapper;
  };

  const createPropertyCard = (property) => {
    if (!CardFactory || typeof CardFactory.createCard !== "function") {
      return createFallbackCard(property);
    }
    const card = CardFactory.createCard(property, {
      showActions,
      favoriteEffect,
      scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
      contactEmail: (p) => p?.developer_email || null,
    });
    convertCountdownAttributes(card);
    mountGallery(card);
    return card;
  };

  const appendSlides = (sliderInstance, listElement, items = []) => {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const card = createPropertyCard(item);
      if (!card) return;
      const slide = document.createElement("li");
      slide.className = "splide__slide";
      slide.appendChild(card);
      fragment.appendChild(slide);
    });
    if (!fragment.childNodes.length) return false;
    listElement.appendChild(fragment);
    sliderInstance.refresh();
    refreshCountdowns();
    return true;
  };

  const initPaginatedSlider = ({ key, endpoint, requiresAuth = false }) => {
    const sliderElement = document.querySelector(`[data-slider='${key}']`);
    if (!sliderElement) return;

    const listElement = sliderElement.querySelector("[data-slider-list]");
    const emptyMessage = sliderElement.parentElement?.querySelector("[data-slider-empty]");
    if (!listElement) return;

    const slider = new Splide(sliderElement, {
      type: "slide",
      gap: "1.5rem",
      perPage: perPageBreakpoints(),
      arrows: true,
      pagination: false,
      breakpoints: {
        1280: { perPage: 2, gap: "1rem" },
        768: { perPage: 1, gap: "1rem", arrows: false },
      },
    });

    slider.mount();

    const state = {
      page: 1,
      hasMore: true,
      loading: false,
    };

    const handleEmpty = () => {
      sliderElement.classList.add("hidden");
      emptyMessage?.classList.remove("hidden");
    };

    const buildUrl = () => {
      const params = new URLSearchParams({ page_size: perPageBreakpoints().toString(), page: state.page.toString() });
      return `${endpoint}?${params.toString()}`;
    };

    const updatePagination = (nextUrl) => {
      if (!nextUrl) {
        state.hasMore = false;
        return;
      }
      try {
        const url = new URL(nextUrl, window.location.origin);
        const nextPage = Number(url.searchParams.get("page"));
        state.page = Number.isNaN(nextPage) ? state.page + 1 : nextPage;
        state.hasMore = true;
      } catch (error) {
        state.page += 1;
        state.hasMore = true;
      }
    };

    const fetchPage = async () => {
      if (state.loading || !state.hasMore) return;
      state.loading = true;
      addLoaders(listElement, Math.min(perPageBreakpoints(), 3));

      try {
        const response = await fetch(buildUrl(), {
          headers: { "X-CSRFToken": csrfToken },
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (requiresAuth && (response.status === 401 || response.status === 403)) {
            clearLoaders(listElement);
            state.hasMore = false;
            handleEmpty();
            return;
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

        clearLoaders(listElement);

        if (!results.length && state.page === 1) {
          state.hasMore = false;
          handleEmpty();
          return;
        }

        const appended = appendSlides(slider, listElement, results);
        if (!appended && state.page === 1) {
          state.hasMore = false;
          handleEmpty();
          return;
        }

        sliderElement.classList.remove("hidden");
        emptyMessage?.classList.add("hidden");
        updatePagination(data?.next ?? null);
      } catch (error) {
        console.error(`Failed to load slider data for ${key}`, error);
        clearLoaders(listElement);
        if (state.page === 1) {
          handleEmpty();
        }
      } finally {
        state.loading = false;
      }
    };

    fetchPage();

    slider.on("moved", () => {
      const slideCount = slider.Components.Slides.getLength();
      const threshold = Math.max(slideCount - perPageBreakpoints() * 2, 0);
      if (state.hasMore && !state.loading && slider.index >= threshold) {
        fetchPage();
      }
    });

    window.addEventListener("resize", () => {
      state.page = Math.max(state.page, 1);
    });
  };

  const initNearestSlider = () => {
    const sliderElement = document.querySelector("[data-slider='hot']");
    if (!sliderElement) return;

    const listElement = sliderElement.querySelector("[data-slider-list]");
    const emptyMessage = sliderElement.parentElement?.querySelector("[data-slider-empty]");
    if (!listElement) return;

    // Ensure Splide is available before initializing
    if (typeof Splide === 'undefined') {
      console.warn('Splide library not loaded');
      return;
    }

    const slider = new Splide(sliderElement, {
      type: "slide",
      gap: "1.5rem",
      perPage: perPageBreakpoints(),
      arrows: true,
      pagination: false,
      breakpoints: {
        1280: { perPage: 2, gap: "1rem" },
        768: { perPage: 1, gap: "1rem", arrows: false },
      },
    });

    slider.mount();

    let loading = false;

    const showPrompt = () => {
      sliderElement.classList.add("hidden");
      emptyMessage?.classList.remove("hidden");
    };

    const hidePrompt = () => {
      sliderElement.classList.remove("hidden");
      emptyMessage?.classList.add("hidden");
    };

    const fetchNearest = async (coords) => {
      if (!coords || !coords.latitude || !coords.longitude) {
        showPrompt();
        return;
      }
      if (loading) return;
      loading = true;
      listElement.innerHTML = "";
      addLoaders(listElement, 3);

      try {
        const params = new URLSearchParams({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
        });
        const response = await fetch(`/property/api/nearest/?${params.toString()}`, {
          headers: { "X-CSRFToken": csrfToken },
          credentials: "same-origin",
        });

        if (!response.ok) throw new Error(`Nearest request failed with status ${response.status}`);

        const data = await response.json();
        clearLoaders(listElement);
        listElement.innerHTML = "";

        if (!Array.isArray(data) || !data.length) {
          showPrompt();
          return;
        }

        appendSlides(slider, listElement, data);
        hidePrompt();
      } catch (error) {
        console.warn("Failed to load nearby properties", error);
        clearLoaders(listElement);
        showPrompt();
      } finally {
        loading = false;
      }
    };

    const geolocationButton = document.querySelector("[data-trigger-geolocation]");
    if (geolocationButton) {
      geolocationButton.addEventListener("click", () => {
        if (!navigator.geolocation) {
          showPrompt();
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchNearest({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          },
          () => showPrompt()
        );
      });
    }

    showPrompt();
  };

  const handlePropertyTypeToggle = (button) => {
    selectors.propertyTypeButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.remove("bg-primary", "text-white", "border-primary", "bg-secondary/60", "text-muted-foreground", "border-border");
      if (isActive) {
        btn.classList.add("bg-primary", "text-white", "border-primary");
      } else {
        btn.classList.add("bg-secondary/60", "text-muted-foreground", "border-border");
      }
    });
  };

  const initPropertyTypeControls = () => {
    const buttons = selectors.propertyTypeButtons;
    if (!buttons.length) return;
    let defaultButton = null;
    buttons.forEach((button) => {
      if (!button.dataset.propertyType && !defaultButton) {
        defaultButton = button;
      }
      button.addEventListener("click", () => handlePropertyTypeToggle(button));
    });
    handlePropertyTypeToggle(defaultButton || buttons[0]);
  };

  const hideError = () => {
    if (!selectors.errorNode) return;
    selectors.errorNode.classList.add("hidden");
  };

  const showError = (message) => {
    if (!selectors.errorNode) return;
    selectors.errorNode.textContent = message;
    selectors.errorNode.classList.remove("hidden");
  };

  const clearLocationValue = () => {
    if (!selectors.heroInput) return;
    ["latitude", "longitude", "place_id", "fature_type"].forEach((attr) => selectors.heroInput.removeAttribute(attr));
    selectors.heroInput.value = "";
    hideError();
    selectors.heroInput.focus();
  };

  const buildSearchUrl = () => {
    const input = selectors.heroInput;
    if (!input) return null;
    const latitude = input.getAttribute("latitude");
    const longitude = input.getAttribute("longitude");
    const placeId = input.getAttribute("place_id");
    const featureType = input.getAttribute("fature_type");
    const value = input.value.trim();

    if (!latitude || !longitude || !value) {
      return null;
    }

    const params = new URLSearchParams({
      place: value,
      latitude,
      longitude,
    });

    if (placeId) params.set("place_id", placeId);
    if (featureType) params.set("fature_type", featureType);

    ["min_price", "max_price", "min_number_of_bedroom", "max_number_of_bedroom"].forEach((name) => {
      const field = document.querySelector(`select[name='${name}']`);
      if (field && field.value) {
        params.set(name, field.value);
      }
    });

    selectors.propertyTypeButtons.forEach((button) => {
      if (button.getAttribute("aria-pressed") === "true" && button.dataset.propertyType) {
        params.set("building__type", button.dataset.propertyType);
      }
    });

    return `/property/search/?${params.toString()}`;
  };

  const handleSearch = () => {
    const url = buildSearchUrl();
    if (!url) {
      showError("Select a location from the autocomplete suggestions to start.");
      selectors.heroInput?.focus();
      return;
    }
    
    // PostHog tracking - track search from home page
    if (typeof Analytics !== 'undefined') {
      const searchTerm = selectors.heroInput?.value.trim() || '';
      const filters = {};
      
      // Extract filters from URL
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.forEach((value, key) => {
        if (key !== 'place' && key !== 'latitude' && key !== 'longitude' && key !== 'place_id' && key !== 'fature_type') {
          filters[key] = value;
        }
      });
      
      Analytics.trackSearch(searchTerm, filters, 0);
    }
    
    window.location.href = url;
  };

  const initFilterToggle = () => {
    const toggleButton = document.querySelector("[data-filter-toggle]");
    const filterPanel = document.querySelector("[data-filter-panel]");
    const filterIcon = document.querySelector("[data-filter-icon]");

    if (!toggleButton || !filterPanel || !filterIcon) return;

    toggleButton.addEventListener("click", () => {
      const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
      toggleButton.setAttribute("aria-expanded", !isExpanded);
      filterPanel.classList.toggle("hidden");
      filterIcon.classList.toggle("rotate-180");
    });
  };

  const initHeroSearch = () => {
    if (!selectors.heroInput || !selectors.searchButton) return;

    initPropertyTypeControls();
    initFilterToggle();

    selectors.searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      handleSearch();
    });

    selectors.heroInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });

    selectors.heroInput.addEventListener("input", () => {
      hideError();
      ["latitude", "longitude", "place_id", "fature_type"].forEach((attr) => selectors.heroInput.removeAttribute(attr));
    });

    selectors.heroInput.addEventListener("change", hideError);

    if (selectors.clearLocation) {
      selectors.clearLocation.addEventListener("click", (event) => {
        event.preventDefault();
        clearLocationValue();
      });
    }
  };

  const sliderConfigs = [
    { key: "discount", endpoint: "/property/api/list/discount/" },
    { key: "recommended", endpoint: "/property/api/list/suggested-properties/", requiresAuth: true },
    { key: "popular", endpoint: "/property/api/list/popular/" },
  ];

  sliderConfigs.forEach(initPaginatedSlider);
  initNearestSlider();
  initHeroSearch();
})();
