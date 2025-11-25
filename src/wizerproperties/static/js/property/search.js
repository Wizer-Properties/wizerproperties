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
        viewMode: window.location.pathname.includes("search-with-map") ? "map" : "list",
      };

      // Cache DOM elements
      this.els = {
    list: document.getElementById("search-result-list"),
        sentinel: document.getElementById("search-freescroll"),
    availableCount: document.querySelector("[label='available-properties']"),
    heading: document.querySelector(".search-area"),
        locationInput: document.getElementById("gm-search-input"),
        clearLocationBtn: document.querySelector("[data-filter-clear-location]"),
        viewToggle: document.querySelector("[label-name='view-tag']"),
    sortingLabel: document.querySelector("[label='sorting-type']"),
        sortingBox: document.querySelector("[pop-element='sorting-box']"),
        sortingBtn: document.querySelector("[pop-target='sorting-box']"),
        sortingOptions: document.querySelectorAll("[pop-element='sorting-box'] li"),
    modal3d: document.getElementById("_3d_view_dialog"),
    modalDrone: document.getElementById("_3d_drone_view"),
    droneVideo: document.getElementById("_3d_model_display_video"),
  };

      this.abortController = null;
      this.CardFactory = window.PropertyCardFactory;
      this.userType = window.user_type || null;
      this.isProspect = !this.userType || this.userType === "prospect";
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

      // Bind events
      this.bindEvents();

      // Initial fetch
      this.fetchProperties({ reset: true });
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
    }

    updateViewToggleLink() {
      if (!this.els.viewToggle) return;
      const currentParams = window.location.search;
      if (this.state.viewMode === "map") {
        this.els.viewToggle.href = `/property/search/${currentParams}`;
        this.els.viewToggle.innerHTML = `<i class="bi bi-list-task"></i> <span>List view</span>`;
      } else {
        this.els.viewToggle.href = `/property/search-with-map/${currentParams}`;
        this.els.viewToggle.innerHTML = `<i class="bi bi-map"></i> <span>Map view</span>`;
      }
    }
    
    updateSortingUI() {
        if(!this.els.sortingLabel) return;
        const activeOption = Array.from(this.els.sortingOptions).find(opt => opt.getAttribute("value") === this.state.ordering);
        if(activeOption) {
            this.els.sortingLabel.textContent = activeOption.textContent.trim();
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
                this.els.sortingLabel.textContent = option.textContent.trim();
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
      });

      // Modal Close Buttons
      document.querySelectorAll(".close_3d_view_dialog, .close_3d_drone_view").forEach(btn => {
        btn.addEventListener("click", this.closeModals.bind(this));
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
        this.els.list.innerHTML = "";
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
      
      if (results.length === 0) {
        if (reset) {
            this.renderEmptyState();
        }
        this.state.hasMore = false;
        return;
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
      }
        } catch (e) {
            console.warn("Invalid next URL:", data.next);
            this.state.hasMore = false;
    }
      } else {
        this.state.hasMore = false;
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
      this.els.list.innerHTML = `
        <div class="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          <i class="bi bi-search text-3xl"></i>
          <p class="mt-3 text-sm">No properties found. Adjust your filters and try again.</p>
        </div>`;
    }

    renderProperties(properties) {
      const fragment = document.createDocumentFragment();
      properties.forEach(property => {
        const card = this.CardFactory.createCard(property, {
            showActions: this.isProspect,
            favoriteEffect: localStorage.getItem("favorite-effect") || "pulse",
            scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
            contactEmail: (p) => p?.developer_email || null,
    enableMediaButtons: true,
  });

        this.initializeCardBehavior(card);
        fragment.appendChild(card);
      });
      this.els.list.appendChild(fragment);
      
      // Re-init global components if needed
      if (typeof window.Countdown === "function") {
         new window.Countdown({ template: "dd|hh|mm", labels: "Days|Hours|Minutes" });
      }
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
       const template = `
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div class="h-64 rounded-2xl bg-muted"></div>
            <div class="flex flex-col justify-between gap-6">
              <div class="space-y-4">
                <div class="h-6 w-3/4 rounded bg-muted"></div>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div class="h-16 rounded-lg bg-muted"></div>
                  <div class="h-16 rounded-lg bg-muted"></div>
                  <div class="h-16 rounded-lg bg-muted"></div>
                  <div class="h-16 rounded-lg bg-muted"></div>
                </div>
              </div>
              <div class="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-muted"></div>
                  <div class="space-y-1">
                    <div class="h-4 w-24 rounded bg-muted"></div>
                    <div class="h-3 w-16 rounded bg-muted"></div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div class="h-10 w-36 rounded-full bg-muted"></div>
                  <div class="h-10 w-28 rounded-full bg-muted"></div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

    const fragment = document.createDocumentFragment();
       for (let i = 0; i < this.config.skeletonCount; i++) {
         const wrapper = document.createElement("div");
         wrapper.innerHTML = template;
         wrapper.firstElementChild.classList.add("skeleton-item");
         fragment.appendChild(wrapper.firstElementChild);
       }
       this.els.list.appendChild(fragment);
    }

    removeSkeletons() {
       this.els.list.querySelectorAll(".skeleton-item").forEach(el => el.remove());
       // Fallback for any lingering pulse elements from old logic if mixed
       this.els.list.querySelectorAll(".animate-pulse").forEach(el => el.closest(".rounded-2xl")?.remove());
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
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    new PropertySearchManager().init();
  });
})();
