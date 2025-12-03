"use strict";

(function () {
  /**
   * Utility: Debounce function
   */
  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  /**
   * Property Search Manager
   * Handles fetching, rendering, and interaction for the property search page.
   */
  class PropertySearchManager {
    constructor() {
      this.config = {
        apiUrl: "/property/api/list/",
        skeletonCount: 3,
      };

      this.state = {
        loading: false,
        page: 1,
        hasMore: true,
        ordering: "-created_at",
        place: "",
        filters: {},
        mapBounds: null, // Store current map bounds
        // Default search (/property/search/) shows map view
        // search-with-map URL shows list view
        viewMode: window.location.pathname.includes("search-with-map") ? "list" : "map",
        displayMode: localStorage.getItem("property-display-mode") || "grid", // grid or list
      };

      // Cache DOM elements
      this.els = {
    list: document.getElementById("search-result-list"),
        listList: document.getElementById("search-result-list-list"), // List view container
        emptyState: document.getElementById("search-empty-state"),
        loadingSkeleton: document.getElementById("search-loading-skeleton"),
        sentinel: document.getElementById("search-freescroll"),
    availableCount: document.querySelector("[label='available-properties']"),
    heading: document.querySelector(".search-area"),
        locationInput: document.getElementById("gm-search-input"),
        clearLocationBtn: document.querySelector("[data-filter-clear-location]"),
        viewToggle: document.querySelector("[label-name='view-tag']"),
        viewToggles: document.querySelectorAll("[label-name='view-tag']"), // All view toggle buttons
        displayModeButtons: document.querySelectorAll(".view-toggle-btn"), // Grid/List toggle buttons
    sortingLabel: document.querySelector("[label='sorting-type']"),
        sortingBox: document.querySelector("[pop-element='sorting-box']"),
        sortingBtn: document.querySelector("[pop-target='sorting-box']"),
        sortingOptions: document.querySelectorAll("[pop-element='sorting-box'] li"),
    modal3d: document.getElementById("_3d_view_dialog"),
    modalDrone: document.getElementById("_3d_drone_view"),
    droneVideo: document.getElementById("_3d_model_display_video"),
    resetMapBtn: document.querySelector(".reset-map"),
  };

      this.abortController = null;
      this.CardFactory = window.PropertyCardFactory;
      this.userType = window.user_type || null;
      this.isProspect = !this.userType || this.userType === "prospect";
      // Show compare/favorite buttons for all authenticated users
      this.isAuthenticated = this.userType !== false && this.userType !== null;
      
      // Map manager reference
      this.mapManager = null;
    }

    init() {
      if (!this.els.list || !this.CardFactory) {
        console.warn("PropertySearchManager: Critical dependencies missing (List or CardFactory).");
        return;
      }

      // Initialize state from URL
      this.syncStateFromURL();
      
      // Set up initial UI state
      this.updateHeading();
      this.updateViewToggleLink();
      this.updateSortingUI();
      this.updateDisplayMode(); // Set initial grid/list view

      // Initialize map integration if MapManager is available
      this.initMapIntegration();

      // Bind events
      this.bindEvents();

      // Initial fetch
      this.fetchProperties({ reset: true });
    }

    initMapIntegration() {
      // Check if we're on a map view page and MapManager is available
      if (this.state.viewMode === "map" && typeof window.MapManager !== 'undefined' && window.mapManager) {
        this.mapManager = window.mapManager;
        
        // Listen for map bounds changes
        document.addEventListener("mapBounds:changed", (e) => {
          this.state.mapBounds = e.detail.bounds;
          this.state.page = 1; // Reset page on bounds change
          this.updateURL();
          this.fetchProperties({ reset: true });
        });

        // Show/hide reset map button based on whether we have location filters
        this.updateResetMapButton();
      }
    }

    syncStateFromURL() {
      const params = new URLSearchParams(window.location.search);
      this.state.page = Number(params.get("page")) || 1;
      this.state.ordering = params.get("ordering") || "-created_at";
      this.state.place = params.get("place") || "";
      
      if (this.els.locationInput) {
        this.els.locationInput.value = this.state.place;
      }

      // Get filters from global filter data if available
      if (window.filter_data?.only_has_value) {
        this.state.filters = window.filter_data.only_has_value();
      }
    }

    updateURL() {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(this.state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value);
        }
      });

      // Add search/sort state
      if (this.state.place) params.set("place", this.state.place);
      params.set("ordering", this.state.ordering);
      if (this.state.page > 1) params.set("page", this.state.page);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
      
      this.updateViewToggleLink();
    }

    updateHeading() {
      if (this.els.heading) {
        this.els.heading.textContent = this.state.place || "All properties";
      }
      // Update breadcrumb
      const breadcrumbArea = document.querySelector("[data-breadcrumb-area]");
      if (breadcrumbArea) {
        breadcrumbArea.textContent = this.state.place 
          ? `Properties For Sale in ${this.state.place}` 
          : "Properties For Sale";
      }
    }

    updateViewToggleLink() {
      // Update all view toggle buttons (there may be multiple on the page)
      const toggles = this.els.viewToggles || (this.els.viewToggle ? [this.els.viewToggle] : []);
      if (toggles.length === 0) return;
      
      const currentParams = window.location.search;
      const isMapView = this.state.viewMode === "map";
      
      toggles.forEach(toggle => {
        if (isMapView) {
          // Currently in map view, switch to list view
          toggle.href = `/property/search-with-map${currentParams}`;
          toggle.innerHTML = `<i class="bi bi-list-task"></i> <span>List view</span>`;
      } else {
          // Currently in list view, switch to map view
          toggle.href = `/property/search${currentParams}`;
          toggle.innerHTML = `<i class="bi bi-map"></i> <span>Map view</span>`;
      }
      });
    }
    
    updateSortingUI() {
        if(!this.els.sortingLabel) return;
        const activeOption = Array.from(this.els.sortingOptions).find(opt => opt.getAttribute("value") === this.state.ordering);
        if(activeOption) {
            this.els.sortingLabel.textContent = activeOption.textContent.trim();
            // Update checkmarks
            this.els.sortingOptions.forEach(opt => {
                const checkIcon = opt.querySelector("i.bi-check2");
                if (checkIcon) {
                    checkIcon.classList.toggle("hidden", opt.getAttribute("value") !== this.state.ordering);
                }
            });
        }
    }

    bindEvents() {
      // Infinite Scroll
      window.addEventListener("scroll", this.handleScroll.bind(this), { passive: true });

      // Sorting
      if (this.els.sortingBtn && this.els.sortingBox) {
        this.els.sortingBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.els.sortingBox.classList.toggle("hidden");
        });
        
        document.addEventListener("click", (e) => {
          if (!this.els.sortingBox.contains(e.target) && !this.els.sortingBtn.contains(e.target)) {
            this.els.sortingBox.classList.add("hidden");
          }
        });

        this.els.sortingOptions.forEach((option) => {
          option.addEventListener("click", () => {
            const value = option.getAttribute("value");
            if (value) {
                this.state.ordering = value;
                // Update label text (remove checkmark icon from text)
                const labelText = option.textContent.trim().replace(/✓|check/i, "").trim();
                if (this.els.sortingLabel) {
                    this.els.sortingLabel.textContent = labelText;
                }
                // Update checkmarks
                this.els.sortingOptions.forEach(opt => {
                    const checkIcon = opt.querySelector("i.bi-check2");
                    if (checkIcon) {
                        checkIcon.classList.toggle("hidden", opt.getAttribute("value") !== value);
                    }
                });
                this.els.sortingBox.classList.add("hidden");
                this.updateURL();
                this.fetchProperties({ reset: true });
            }
          });
        });
      }

      // Location Input
      if (this.els.locationInput) {
        const handleLocationChange = debounce(() => {
          const newVal = this.els.locationInput.value.trim();
          if (this.state.place !== newVal) {
            this.state.place = newVal;
            this.state.page = 1; // Reset page on new search
            this.updateHeading();
            this.updateURL();
            this.fetchProperties({ reset: true });
          }
        }, 500);

        this.els.locationInput.addEventListener("input", handleLocationChange);
        this.els.locationInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") {
                e.preventDefault();
                this.els.locationInput.blur(); // Trigger change/input
            }
        });
      }

      if (this.els.clearLocationBtn) {
        this.els.clearLocationBtn.addEventListener("click", () => {
            if(this.els.locationInput) {
                this.els.locationInput.value = "";
                this.els.locationInput.dispatchEvent(new Event("input"));
            }
        });
      }

      // Filter Changes (Custom Event from filter-init.js)
      document.addEventListener("propertyFilters:changed", (e) => {
        this.state.filters = e.detail.filters;
        this.state.page = 1; // Reset page on filter change
        this.updateURL();
        this.fetchProperties({ reset: true });
        this.updateResetMapButton();
      });

      // Reset Map Button
      if (this.els.resetMapBtn) {
        this.els.resetMapBtn.addEventListener("click", () => {
          this.resetMapView();
        });
      }

      // Update card comparison state when properties are added/removed
      window.addEventListener("compare:added", (e) => {
        this.updateCardComparisonState(e.detail.propertyId, true);
      });
      window.addEventListener("compare:removed", (e) => {
        this.updateCardComparisonState(e.detail.propertyId, false);
      });

      // Save Search Button
      const saveSearchBtn = document.querySelector("[data-save-search]");
      if (saveSearchBtn) {
        saveSearchBtn.addEventListener("click", () => {
          this.handleSaveSearch();
        });
      }

      // Display Mode Toggle (Grid/List)
      this.els.displayModeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = btn.getAttribute("data-view-mode");
          if (mode && mode !== this.state.displayMode) {
            this.setDisplayMode(mode);
          }
        });
      });

      // Clear Filters Button
      const clearFiltersBtn = document.querySelector("[data-clear-filters]");
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
          if (this.els.locationInput) {
            this.els.locationInput.value = "";
            this.els.locationInput.dispatchEvent(new Event("input"));
          }
          if (window.filter_data) {
            window.filter_data.clearAll();
            document.dispatchEvent(new CustomEvent("propertyFilters:changed", {
              detail: { trigger: "clear-all", filters: {} }
            }));
          }
        });
      }

      // Modal Close Buttons
      document.querySelectorAll(".close_3d_view_dialog, .close_3d_drone_view").forEach(btn => {
        btn.addEventListener("click", this.closeModals.bind(this));
      });
    }

    setDisplayMode(mode) {
      this.state.displayMode = mode;
      localStorage.setItem("property-display-mode", mode);
      this.updateDisplayMode();
      
      // Re-render current results in new layout
      const currentCards = Array.from(this.els.list.children).filter(
        el => el.hasAttribute("data-property-card")
      );
      if (currentCards.length > 0) {
        const fragment = document.createDocumentFragment();
        currentCards.forEach(card => fragment.appendChild(card.cloneNode(true)));
        
        const targetContainer = mode === "grid" ? this.els.list : this.els.listList;
        const sourceContainer = mode === "grid" ? this.els.listList : this.els.list;
        
        sourceContainer.innerHTML = "";
        targetContainer.appendChild(fragment);
        
        // Re-initialize card behaviors
        Array.from(targetContainer.children).forEach(card => {
          this.initializeCardBehavior(card);
        });
      }
    }

    updateDisplayMode() {
      const isGrid = this.state.displayMode === "grid";
      
      // Update containers
      if (this.els.list) {
        if (isGrid) {
          this.els.list.classList.remove("hidden");
          this.els.list.classList.add("grid");
        } else {
          this.els.list.classList.add("hidden");
          this.els.list.classList.remove("grid");
        }
      }
      if (this.els.listList) {
        if (isGrid) {
          this.els.listList.classList.add("hidden");
        } else {
          this.els.listList.classList.remove("hidden");
        }
      }
      
      // Update toggle buttons
      this.els.displayModeButtons.forEach(btn => {
        const mode = btn.getAttribute("data-view-mode");
        const isActive = mode === this.state.displayMode;
        if (isActive) {
          btn.classList.add("bg-primary", "text-white");
          btn.classList.remove("bg-transparent", "text-muted-foreground");
          btn.setAttribute("aria-pressed", "true");
        } else {
          btn.classList.remove("bg-primary", "text-white");
          btn.classList.add("bg-transparent", "text-muted-foreground");
          btn.setAttribute("aria-pressed", "false");
        }
      });
    }

    handleScroll() {
      if (this.state.loading || !this.state.hasMore || !this.els.sentinel) return;
      const rect = this.els.sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 200) { // 200px buffer
        this.fetchProperties();
      }
    }

    buildQueryString() {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(this.state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value);
        }
      });
      
      // Add map bounds if available
      if (this.state.mapBounds) {
        params.set("bounds_north", this.state.mapBounds.north);
        params.set("bounds_south", this.state.mapBounds.south);
        params.set("bounds_east", this.state.mapBounds.east);
        params.set("bounds_west", this.state.mapBounds.west);
      }
      
      // Add place/sort/page
      if (this.state.place) params.set("place", this.state.place);
      params.set("ordering", this.state.ordering);
      params.set("page", this.state.page);
      
      return params.toString();
    }

    async fetchProperties({ reset = false } = {}) {
      if (this.state.loading) return;
      if (!reset && !this.state.hasMore) return;

      // Abort previous request if resetting
      if (reset && this.abortController) {
        this.abortController.abort();
      }
      
      this.state.loading = true;
      this.abortController = new AbortController();

      if (reset) {
        this.state.page = 1;
        this.state.hasMore = true;
        if (this.els.list) this.els.list.innerHTML = "";
        if (this.els.listList) this.els.listList.innerHTML = "";
        if (this.els.emptyState) this.els.emptyState.classList.add("hidden");
      }
      
      this.appendSkeletons();

      try {
        const queryString = this.buildQueryString();
        const response = await fetch(`${this.config.apiUrl}?${queryString}`, {
          headers: { 
            "X-CSRFToken": window.csrfToken || "",
            "Content-Type": "application/json"
          },
          signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        
        this.removeSkeletons();
        this.handleDataSuccess(data, reset);
        
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error("Fetch error:", error);
        this.removeSkeletons();
        this.handleDataError(reset);
      } finally {
        this.state.loading = false;
      }
    }

    handleDataSuccess(data, reset) {
      if (this.els.availableCount) {
        this.els.availableCount.textContent = new Intl.NumberFormat().format(data.count || 0);
      }

      const results = data.results || [];
      
      // PostHog tracking - track search
      if (reset && typeof Analytics !== 'undefined') {
        const searchTerm = this.state.place || '';
        const filters = this.state.filters || {};
        Analytics.trackSearch(searchTerm, filters, data.count || 0);
      }
      
      // Update map markers if map manager is available
      if (this.mapManager && reset) {
        this.mapManager.addPropertyMarkers(results);
      }
      
      if (results.length === 0) {
        if (reset) {
            this.renderEmptyState();
            // Clear map markers if no results
            if (this.mapManager) {
              this.mapManager.clearMarkers();
            }
        }
        this.state.hasMore = false;
        return;
      }

      // Hide empty state if we have results
      if (this.els.emptyState) {
        this.els.emptyState.classList.add("hidden");
      }

      this.renderProperties(results);
      
      // Determine next page
      if (data.next) {
        try {
           const nextUrl = new URL(data.next, window.location.origin);
           const nextPage = nextUrl.searchParams.get("page");
           if (nextPage && Number(nextPage) > this.state.page) {
               this.state.page = Number(nextPage);
               this.state.hasMore = true;
           } else {
               // Next page not found or not greater than current -> stop
               this.state.hasMore = false;
               this.renderEndOfResults();
      }
        } catch (e) {
            console.warn("Invalid next URL:", data.next);
            this.state.hasMore = false;
            this.renderEndOfResults();
    }
      } else {
        this.state.hasMore = false;
        this.renderEndOfResults();
      }
    }
    
    handleDataError(reset) {
        if (reset || !this.els.list.children.length) {
            this.els.list.innerHTML = `
              <div class="rounded-2xl border border-destructive/30 bg-destructive/10 p-12 text-center text-destructive shadow-sm">
                <i class="bi bi-exclamation-triangle text-3xl"></i>
                <p class="mt-3 text-sm">Failed to load properties. Please try again later.</p>
              </div>`;
        }
    }

    renderEmptyState() {
      const filters = this.state.filters || {};
      const hasFilters = Object.keys(filters).length > 0;
      const hasLocation = this.state.place && this.state.place.trim() !== "";
      
      // Hide grid/list containers
      if (this.els.list) this.els.list.innerHTML = "";
      if (this.els.listList) this.els.listList.innerHTML = "";
      
      // Show empty state
      if (this.els.emptyState) {
        this.els.emptyState.classList.remove("hidden");
      }
      
      // Build suggestions based on active filters
      const suggestions = [];
      if (filters.min_price || filters.max_price) {
        suggestions.push("Try adjusting your price range");
      }
      if (filters.min_number_of_bedroom || filters.max_number_of_bedroom) {
        suggestions.push("Try different bedroom options");
      }
      if (filters.building__type) {
        suggestions.push("Try other property types");
      }
      if (hasLocation) {
        suggestions.push("Try searching in nearby areas");
      }
      if (filters.nearby) {
        suggestions.push("Try expanding your search radius");
      }
      
      // Update empty state content if it exists
      if (this.els.emptyState) {
        const emptyStateContent = this.els.emptyState.querySelector("p");
        if (emptyStateContent && hasFilters || hasLocation) {
          emptyStateContent.textContent = "Try adjusting your filters or search criteria to see more results.";
        }
      }
    }

    renderProperties(properties) {
      // Get the active container based on display mode
      const activeContainer = this.state.displayMode === "grid" ? this.els.list : this.els.listList;
      
      // Remove any existing end-of-results indicator
      const existingEndIndicator = activeContainer.querySelector("[data-end-of-results]");
      if (existingEndIndicator) {
        existingEndIndicator.remove();
      }
      
      const fragment = document.createDocumentFragment();
      properties.forEach(property => {
        const card = this.CardFactory.createCard(property, {
            showActions: this.isAuthenticated, // Show compare/favorite for all authenticated users
            favoriteEffect: localStorage.getItem("favorite-effect") || "pulse",
            scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
            contactEmail: (p) => p?.developer_email || null,
            enableMediaButtons: true,
            listView: this.state.displayMode === "list", // Pass list view flag
        });

        // Apply list view styling if needed
        if (this.state.displayMode === "list" && card) {
          card.classList.add("list-view-card");
        }

        // Initialize responsive card behavior
        this.initializeCardBehavior(card);
        this.adaptCardToContainer(card, activeContainer);
        
        fragment.appendChild(card);
      });
      activeContainer.appendChild(fragment);
      
      // Re-init global components if needed
      if (typeof window.Countdown === "function") {
         new window.Countdown({ template: "dd|hh|mm", labels: "Days|Hours|Minutes" });
      }
    }

    adaptCardToContainer(card, container) {
      // Use ResizeObserver to detect card size and adapt content
      if (!card) return;
      
      // Initial size check (fallback if ResizeObserver not available)
      const checkSize = () => {
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        const aspectRatio = width / (height || 1);
        
        // Remove all size classes
        card.classList.remove("property-card-narrow", "property-card-medium", "property-card-wide", "property-card-horizontal");
        
        // Apply size-based classes
        if (width < 400) {
          card.classList.add("property-card-narrow");
        } else if (width < 600) {
          card.classList.add("property-card-medium");
        } else {
          card.classList.add("property-card-wide");
          // For very wide cards, consider horizontal layout if aspect ratio suggests it
          if (width >= 800 && aspectRatio > 1.3) {
            card.classList.add("property-card-horizontal");
          }
        }
      };
      
      // Initial check
      checkSize();
      
      // Use ResizeObserver if available for dynamic updates
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            checkSize();
          }
        });
        
        resizeObserver.observe(card);
        
        // Store observer for cleanup if needed
        if (!card.dataset.resizeObserver) {
          card.dataset.resizeObserver = "true";
          card._resizeObserver = resizeObserver;
        }
      }
    }

    renderEndOfResults() {
      // Get the active container based on display mode
      const activeContainer = this.state.displayMode === "grid" ? this.els.list : this.els.listList;
      
      // Only show if we have results and no more pages
      if (activeContainer.children.length === 0) return;
      
      // Check if end indicator already exists
      if (activeContainer.querySelector("[data-end-of-results]")) return;
      
      const endIndicator = document.createElement("div");
      endIndicator.setAttribute("data-end-of-results", "true");
      endIndicator.className = "mt-6 rounded-2xl border border-border bg-card p-6 text-center";
      endIndicator.innerHTML = `
        <div class="flex flex-col items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-full bg-muted">
            <i class="bi bi-check-circle text-2xl text-accent"></i>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">You've reached the end</p>
            <p class="mt-1 text-xs text-muted-foreground">All matching properties are displayed above</p>
          </div>
          <button type="button" class="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/80" data-scroll-to-top>
            <i class="bi bi-arrow-up"></i>
            <span>Back to top</span>
          </button>
        </div>
      `;
      
      activeContainer.appendChild(endIndicator);
      
      // Add scroll to top functionality
      const scrollBtn = endIndicator.querySelector("[data-scroll-to-top]");
      if (scrollBtn) {
        scrollBtn.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    }

    updateCardComparisonState(propertyId, isCompared) {
      // Check both containers
      const containers = [this.els.list, this.els.listList].filter(Boolean);
      containers.forEach(container => {
        const card = container.querySelector(`[data-property-id="${propertyId}"]`);
        if (card) {
          if (isCompared) {
            card.classList.add("property-compared");
            const compareButton = card.querySelector("[data-card-compare]");
            if (compareButton) {
              compareButton.setAttribute("added", "true");
              compareButton.innerHTML = `<i class="bi bi-check2"></i><span class="sr-only">Compare</span>`;
            }
          } else {
            card.classList.remove("property-compared");
            const compareButton = card.querySelector("[data-card-compare]");
            if (compareButton) {
              compareButton.setAttribute("added", "false");
              compareButton.innerHTML = `<i class="bi bi-arrow-left-right"></i><span class="sr-only">Compare</span>`;
            }
          }
        }
      });
    }

    initializeCardBehavior(card) {
      // 1. Lazy Load Gallery (Splide)
      const splideEl = card.querySelector(".splide");
      if (splideEl && !splideEl.dataset.splideMounted) {
        this.setupSplide(card, splideEl);
      }

      // 2. Modals
      card.querySelectorAll("[data-3d-view]").forEach(btn => {
        btn.addEventListener("click", () => this.openModal("3d", btn.getAttribute("data-3d-view")));
      });
      card.querySelectorAll("[data-drone-view]").forEach(btn => {
        btn.addEventListener("click", () => this.openModal("drone", btn.getAttribute("data-drone-view")));
      });
    }

    setupSplide(card, splideEl) {
       const listElement = splideEl.querySelector(".splide__list");
    const propertyId = card.dataset.propertyId;

       const splide = new Splide(splideEl, {
      perPage: 1,
      gap: "0.75rem",
      pagination: false,
      arrows: true,
    });
    
    // Connect thumbnails to splide if they exist
    const thumbnailsContainer = card.querySelector("[data-card-thumbnails]");
    if (thumbnailsContainer && !thumbnailsContainer.classList.contains("hidden")) {
      const thumbnailButtons = thumbnailsContainer.querySelectorAll("div[data-thumbnail-index]");
      thumbnailButtons.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const index = parseInt(thumb.dataset.thumbnailIndex) || 1;
          if (splide.go) {
            splide.go(index);
          }
        });
      });
    }

       // Lazy load next images logic
    splide.on("moved", (newIndex) => {
      const slides = listElement.children;
      const currentSlide = slides[newIndex];
      if (!currentSlide?.classList.contains("search-result-box-img-loader")) return;
         
         const nextPage = listElement.dataset.imagesNextPage;
      if (!nextPage || listElement.dataset.loading === "true") return;

      listElement.dataset.loading = "true";
         
      fetch(`/property/api/details/${propertyId}/media-files/?page_size=1&media_type=image&page=${nextPage}`, {
             headers: { "X-CSRFToken": window.csrfToken || "" }
      })
         .then(res => res.ok ? res.json() : Promise.reject())
         .then(json => {
             const next = json.next ? new URL(json.next, window.location.origin).searchParams.get("page") : "";
          listElement.dataset.imagesNextPage = next || "";
          splide.remove(newIndex);
             
             if(json.results?.length) {
            splide.add(
                  `<li class="splide__slide"><img src="${json.results[0].file}" alt="Property" class="h-full w-full object-cover" loading="lazy" /></li>`,
              newIndex
            );
          }
             
             if(next) {
            splide.add(
              `<li class="splide__slide search-result-box-img-loader"><div class="flex h-full items-center justify-center bg-muted"><div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div></li>`
            );
          }
        })
         .catch(err => {
             console.error("Image load error", err);
          splide.remove(newIndex);
        })
        .finally(() => {
          listElement.dataset.loading = "false";
        });
    });

    splide.mount();
       splideEl.dataset.splideMounted = "true";
    }

    appendSkeletons() {
      const isGrid = this.state.displayMode === "grid";
      const container = isGrid ? this.els.list : this.els.listList;
      
      if (!container) return;
      
      // Grid skeleton (simplified)
      const gridTemplate = `
        <div class="rounded-2xl border border-border bg-card shadow-sm animate-pulse skeleton-item">
          <div class="h-56 sm:h-64 rounded-t-2xl bg-muted"></div>
          <div class="p-4 sm:p-5 space-y-3">
            <div class="h-5 w-3/4 rounded bg-muted"></div>
            <div class="h-3 w-1/2 rounded bg-muted"></div>
            <div class="grid grid-cols-4 gap-1.5">
              <div class="h-14 rounded-lg bg-muted"></div>
              <div class="h-14 rounded-lg bg-muted"></div>
              <div class="h-14 rounded-lg bg-muted"></div>
              <div class="h-14 rounded-lg bg-muted"></div>
            </div>
            <div class="flex items-center gap-2.5 pt-3 border-t border-border/60">
              <div class="size-8 rounded-md bg-muted"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3 w-20 rounded bg-muted"></div>
                <div class="h-2 w-16 rounded bg-muted"></div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-9 w-full rounded-lg bg-muted"></div>
              <div class="h-9 w-full rounded-lg bg-muted"></div>
            </div>
          </div>
        </div>`;
      
      // List skeleton (horizontal layout)
      const listTemplate = `
        <div class="rounded-2xl border border-border bg-card shadow-sm animate-pulse skeleton-item">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] p-4">
            <div class="h-56 rounded-xl bg-muted lg:h-full"></div>
            <div class="flex flex-col justify-between gap-4">
              <div class="space-y-3">
                <div class="h-5 w-3/4 rounded bg-muted"></div>
                <div class="h-3 w-1/2 rounded bg-muted"></div>
                <div class="grid grid-cols-4 gap-1.5">
                  <div class="h-12 rounded-lg bg-muted"></div>
                  <div class="h-12 rounded-lg bg-muted"></div>
                  <div class="h-12 rounded-lg bg-muted"></div>
                  <div class="h-12 rounded-lg bg-muted"></div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 border-t border-border/60 pt-3">
                <div class="size-8 rounded-md bg-muted"></div>
                <div class="flex-1">
                  <div class="h-3 w-24 rounded bg-muted mb-1"></div>
                  <div class="h-2 w-16 rounded bg-muted"></div>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="h-9 flex-1 rounded-lg bg-muted"></div>
                <div class="h-9 flex-1 rounded-lg bg-muted"></div>
              </div>
            </div>
          </div>
        </div>`;

      const template = isGrid ? gridTemplate : listTemplate;
      const fragment = document.createDocumentFragment();
      
      for (let i = 0; i < this.config.skeletonCount; i++) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = template;
        fragment.appendChild(wrapper.firstElementChild);
      }
      
      container.appendChild(fragment);
    }

    removeSkeletons() {
      // Remove from both containers
      [this.els.list, this.els.listList].filter(Boolean).forEach(container => {
        container.querySelectorAll(".skeleton-item").forEach(el => el.remove());
        // Fallback for any lingering pulse elements
        container.querySelectorAll(".animate-pulse").forEach(el => {
          if (el.closest(".rounded-2xl")?.classList.contains("skeleton-item")) {
            el.closest(".rounded-2xl")?.remove();
          }
        });
      });
    }

    openModal(type, src) {
      if (type === "3d" && this.els.modal3d) {
        const display = this.els.modal3d.querySelector("._3d_model_display");
        if (display) {
          display.innerHTML = `<iframe src="${src}" class="h-full w-full" allowfullscreen loading="lazy"></iframe>`;
      }
        window.$?.(this.els.modal3d).modal("show");
      } else if (type === "drone" && this.els.modalDrone) {
        const source = this.els.droneVideo?.querySelector("source");
        if (source) {
          source.src = src;
          if(window.videojs && this.els.droneVideo) {
              window.videojs(this.els.droneVideo).load();
          }
        }
        window.$?.(this.els.modalDrone).modal("show");
      }
    }

    closeModals() {
      if (this.els.modal3d) {
        const display = this.els.modal3d.querySelector("._3d_model_display");
        if (display) display.innerHTML = "";
        window.$?.(this.els.modal3d).modal("hide");
      }
      if (this.els.modalDrone) {
        const source = this.els.droneVideo?.querySelector("source");
        if (source) source.src = "";
        if(window.videojs && this.els.droneVideo) {
            window.videojs(this.els.droneVideo).pause();
        }
        window.$?.(this.els.modalDrone).modal("hide");
      }
    }

    handleSaveSearch() {
      // TODO: Implement save search functionality
      // This would typically save the current search criteria to user's account
      console.log("Save search clicked", {
        place: this.state.place,
        filters: this.state.filters,
        ordering: this.state.ordering
      });
      // Show a toast or modal for save search
      alert("Save search feature coming soon!");
    }

    updateResetMapButton() {
      if (!this.els.resetMapBtn) return;
      
      const hasLocation = this.state.place && this.state.place.trim() !== "";
      const hasBounds = this.state.mapBounds !== null;
      
      if (hasLocation || hasBounds) {
        this.els.resetMapBtn.classList.remove("hidden");
      } else {
        this.els.resetMapBtn.classList.add("hidden");
      }
    }

    resetMapView() {
      // Clear map bounds
      this.state.mapBounds = null;
      
      // Reset map to default view
      if (this.mapManager) {
        const urlParams = new URLSearchParams(window.location.search);
        const p_latitude = urlParams.get('latitude');
        const p_longitude = urlParams.get('longitude');
        const center = p_latitude && p_longitude 
          ? { lat: Number(p_latitude), lng: Number(p_longitude) }
          : { lat: 13.7563309, lng: 100.5017651 };
        
        this.mapManager.updateMapView(center, 12);
        this.mapManager.clearMarkers();
      }
      
      // Update URL and refetch
      this.updateURL();
      this.fetchProperties({ reset: true });
      this.updateResetMapButton();
    }
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    new PropertySearchManager().init();
  });
})();

