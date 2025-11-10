"use strict";

(function () {
  const CardFactory = window.PropertyCardFactory;
  if (!CardFactory || typeof CardFactory.createCard !== "function") return;

  const els = {
    list: document.getElementById("search-result-list"),
    availableCount: document.querySelector("[label='available-properties']"),
    heading: document.querySelector(".search-area"),
    sortingButton: document.querySelector("[pop-target='sorting-box']"),
    sortingList: document.querySelector("[pop-element='sorting-box']"),
    sortingLabel: document.querySelector("[label='sorting-type']"),
    viewToggle: document.querySelector("[label-name='view-tag']"),
    sentinel: document.getElementById("search-freescroll"),
    locationInput: document.getElementById("gm-search-input"),
    clearLocation: document.querySelector("[data-filter-clear-location]") || null,
    modal3d: document.getElementById("_3d_view_dialog"),
    modalDrone: document.getElementById("_3d_drone_view"),
    droneVideo: document.getElementById("_3d_model_display_video"),
  };

  if (!els.list) return;

  const url = new URL(window.location.href);
  const state = {
    next: Number(url.searchParams.get("page")) || 1,
    loading: false,
    hasMore: true,
    ordering: url.searchParams.get("ordering") || "-created_at",
    searchPlace: url.searchParams.get("place") || "",
    pendingQuery: null,
    favoriteEffect: localStorage.getItem("favorite-effect") || "pulse",
  };

  const userType = window.user_type || null;
  const isProspect = !userType || userType === "prospect";

  const numberFormatter = new Intl.NumberFormat();

  const skeletonTemplate = () => `
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div class="h-64 animate-pulse rounded-2xl bg-muted"></div>
        <div class="flex flex-col justify-between gap-6">
          <div class="space-y-4">
            <div class="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="h-16 animate-pulse rounded-lg bg-muted"></div>
              <div class="h-16 animate-pulse rounded-lg bg-muted"></div>
              <div class="h-16 animate-pulse rounded-lg bg-muted"></div>
              <div class="h-16 animate-pulse rounded-lg bg-muted"></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <div class="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
              <div class="h-6 w-24 animate-pulse rounded-full bg-muted"></div>
            </div>
          </div>
          <div class="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 animate-pulse rounded-full bg-muted"></div>
              <div class="space-y-1">
                <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
                <div class="h-3 w-16 animate-pulse rounded bg-muted"></div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <div class="h-10 w-36 animate-pulse rounded-full bg-muted"></div>
              <div class="h-10 w-28 animate-pulse rounded-full bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const appendSkeletons = (count = 3) => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = skeletonTemplate();
      fragment.appendChild(wrapper.firstElementChild);
    }
    els.list.appendChild(fragment);
  };

  const removeSkeletons = () => {
    els.list.querySelectorAll(".animate-pulse").forEach((node) => {
      const container = node.closest(".rounded-2xl");
      if (container) container.remove();
    });
  };

  const updateAvailableCount = (value) => {
    if (!els.availableCount) return;
    els.availableCount.textContent = numberFormatter.format(value || 0);
  };

  const updateHeading = (text) => {
    if (!els.heading) return;
    els.heading.textContent = text || "All properties";
  };

  const updateViewToggle = () => {
    if (!els.viewToggle) return;
    const current = new URL(window.location.href);
    const mapView = window.location.pathname.includes("search-with-map");
    if (mapView) {
      els.viewToggle.href = `/property/search/${current.search}`;
      els.viewToggle.innerHTML = `<i class="bi bi-list-task"></i> <span>List view</span>`;
    } else {
      els.viewToggle.href = `/property/search-with-map/${current.search}`;
      els.viewToggle.innerHTML = `<i class="bi bi-map"></i> <span>Map view</span>`;
    }
  };

  const openModal = (type, src) => {
    if (type === "3d" && els.modal3d) {
      const display = els.modal3d.querySelector("._3d_model_display");
      if (display) {
        display.innerHTML = `<iframe src="${src}" class="h-full w-full" allowfullscreen loading="lazy"></iframe>`;
      }
      window.$?.(els.modal3d).modal("show");
    } else if (type === "drone" && els.modalDrone) {
      const source = els.droneVideo?.querySelector("source");
      if (source) {
        source.src = src;
        window.videojs(els.droneVideo).load();
      }
      window.$?.(els.modalDrone).modal("show");
    }
  };

  const closeModals = () => {
    if (els.modal3d) {
      const display = els.modal3d.querySelector("._3d_model_display");
      if (display) display.innerHTML = "";
      window.$?.(els.modal3d).modal("hide");
    }
    if (els.modalDrone) {
      const source = els.droneVideo?.querySelector("source");
      if (source) source.src = "";
      window.videojs?.(els.droneVideo)?.pause?.();
      window.$?.(els.modalDrone).modal("hide");
    }
  };

  const createCardOptions = () => ({
    showActions: isProspect,
    favoriteEffect: state.favoriteEffect,
    scheduleUrl: (property) => `/schedule/create_schedule/?type=property&id=${property?.id ?? ""}`,
    contactEmail: (property) => property?.developer_email || null,
    enableMediaButtons: true,
  });

  const initializeLazyGallery = (card) => {
    const splideElement = card.querySelector(".splide");
    if (!splideElement || splideElement.dataset.splideMounted === "true") return;
    const listElement = splideElement.querySelector(".splide__list");
    const propertyId = card.dataset.propertyId;
    if (!listElement || !propertyId) return;

    const splide = new Splide(splideElement, {
      perPage: 1,
      gap: "0.75rem",
      pagination: false,
      arrows: true,
    });

    splide.on("moved", (newIndex) => {
      const slides = listElement.children;
      const currentSlide = slides[newIndex];
      if (!currentSlide?.classList.contains("search-result-box-img-loader")) return;
      const nextPage = listElement.dataset.imagesNextPage || "";
      if (!nextPage || listElement.dataset.loading === "true") return;

      listElement.dataset.loading = "true";
      fetch(`/property/api/details/${propertyId}/media-files/?page_size=1&media_type=image&page=${nextPage}`, {
        headers: { "X-CSRFToken": window.csrfToken || "" },
      })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((json) => {
          const next = json.next ? new URL(json.next).searchParams.get("page") : "";
          listElement.dataset.imagesNextPage = next || "";
          splide.remove(newIndex);
          if (json.results?.length) {
            splide.add(
              `<li class="splide__slide"><img src="${json.results[0].file}" alt="Property image" class="h-full w-full object-cover" loading="lazy" /></li>`,
              newIndex
            );
          }
          if (next) {
            splide.add(
              `<li class="splide__slide search-result-box-img-loader"><div class="flex h-full items-center justify-center bg-muted"><div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div></li>`
            );
          }
        })
        .catch(() => {
          splide.remove(newIndex);
        })
        .finally(() => {
          listElement.dataset.loading = "false";
        });
    });

    splide.mount();
    splideElement.dataset.splideMounted = "true";
  };

  const mountCard = (card) => {
    initializeLazyGallery(card);
    card.querySelectorAll("[data-3d-view]").forEach((button) => {
      button.addEventListener("click", () => openModal("3d", button.getAttribute("data-3d-view")));
    });
    card.querySelectorAll("[data-drone-view]").forEach((button) => {
      button.addEventListener("click", () => openModal("drone", button.getAttribute("data-drone-view")));
    });
  };

  const renderProperties = (properties, { reset = false } = {}) => {
    if (reset) {
      els.list.innerHTML = "";
    }
    const cards = [];
    const fragment = document.createDocumentFragment();
    properties.forEach((property) => {
      const card = CardFactory.createCard(property, createCardOptions(property));
      card.dataset.propertyId = property.id || "";
      cards.push(card);
      fragment.appendChild(card);
    });
    els.list.appendChild(fragment);
    cards.forEach(mountCard);
    if (typeof window.Countdown === "function") {
      new window.Countdown({ template: "dd|hh|mm", labels: "Days|Hours|Minutes" });
    }
  };

  const clearResults = () => {
    els.list.innerHTML = "";
    state.next = 1;
    state.hasMore = true;
  };

  const getFilters = () => (window.filter_data?.only_has_value?.() || {});

  const buildQuery = (page) => {
    const params = new URLSearchParams(window.location.search);
    const filters = getFilters();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });
    if (!filters.nearby) params.delete("nearby");
    params.set("ordering", state.ordering);
    if (state.searchPlace) params.set("place", state.searchPlace);
    else params.delete("place");
    params.set("page", page);
    return params.toString();
  };

  const fetchProperties = async ({ reset = false } = {}) => {
    if (state.loading || (!state.hasMore && !reset)) return;
    state.loading = true;
    if (reset) clearResults();
    appendSkeletons();

    const query = buildQuery(reset ? 1 : state.next || 1);
    state.pendingQuery = query;

    try {
      const response = await fetch(`/property/api/list/?${query}`, {
        headers: { "X-CSRFToken": window.csrfToken || "" },
      });
      if (!response.ok) throw new Error("Failed to fetch properties");
      const data = await response.json();
      if (state.pendingQuery !== query) return;

      updateAvailableCount(data.count || 0);
      const results = data.results || [];
      renderProperties(results, { reset });
      state.hasMore = Boolean(data.next);
      state.next = state.hasMore ? Number(new URL(data.next).searchParams.get("page")) : null;

      if (data.count === 0) {
        els.list.innerHTML = `
          <div class="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
            <i class="bi bi-search text-3xl"></i>
            <p class="mt-3 text-sm">No properties found. Adjust your filters and try again.</p>
          </div>`;
      }
    } catch (error) {
      console.error(error);
      if (!els.list.children.length) {
        els.list.innerHTML = `
          <div class="rounded-2xl border border-destructive/30 bg-destructive/10 p-12 text-center text-destructive shadow-sm">
            <i class="bi bi-exclamation-triangle text-3xl"></i>
            <p class="mt-3 text-sm">Failed to load properties. Please try again.</p>
          </div>`;
      }
    } finally {
      removeSkeletons();
      state.loading = false;
      state.pendingQuery = null;
    }
  };

  const handleScroll = () => {
    if (state.loading || !state.hasMore) return;
    const sentinelRect = els.sentinel?.getBoundingClientRect();
    if (sentinelRect && sentinelRect.top <= window.innerHeight + 100) {
      fetchProperties();
    }
  };

  const handleSorting = () => {
    if (!els.sortingButton || !els.sortingList) return;
    els.sortingButton.addEventListener("click", () => {
      els.sortingList.classList.toggle("hidden");
    });
    els.sortingList.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        const value = item.getAttribute("value") || "-created_at";
        state.ordering = value;
        els.sortingLabel.textContent = item.textContent.trim();
        els.sortingList.classList.add("hidden");
        url.searchParams.set("ordering", state.ordering);
        window.history.replaceState({}, "", `${window.location.pathname}?${url.searchParams.toString()}`);
        fetchProperties({ reset: true });
      });
    });
    document.addEventListener("click", (event) => {
      if (!els.sortingList.contains(event.target) && !els.sortingButton.contains(event.target)) {
        els.sortingList.classList.add("hidden");
      }
    });
  };

  const handleLocationInput = () => {
    if (!els.locationInput) return;
    const updatePlace = () => {
      state.searchPlace = els.locationInput.value.trim();
      if (state.searchPlace) url.searchParams.set("place", state.searchPlace);
      else url.searchParams.delete("place");
      window.history.replaceState({}, "", `${window.location.pathname}?${url.searchParams.toString()}`);
      updateHeading(state.searchPlace);
      fetchProperties({ reset: true });
    };

    els.locationInput.value = state.searchPlace;
    els.locationInput.addEventListener("change", updatePlace);
    els.locationInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        updatePlace();
      }
    });
    if (els.clearLocation) {
      els.clearLocation.addEventListener("click", () => {
        els.locationInput.value = "";
        updatePlace();
      });
    }
  };

  document.addEventListener("propertyFilters:changed", () => {
    fetchProperties({ reset: true });
  });

  const init = () => {
    updateHeading(state.searchPlace);
    updateViewToggle();
    handleSorting();
    handleLocationInput();
    fetchProperties({ reset: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    const closeButtons = [...document.querySelectorAll(".close_3d_view_dialog"), ...document.querySelectorAll(".close_3d_drone_view")];
    closeButtons.forEach((button) => button.addEventListener("click", closeModals));
  };

  init();
})();