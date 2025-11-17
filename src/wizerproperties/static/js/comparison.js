"use strict";

(function () {
  const sliderElement = document.querySelector("#comparison-slider");
  const listElement = document.querySelector("[data-comparison-list]");
  const fieldsElement = document.querySelector("[data-comparison-fields]");

  if (!sliderElement || !listElement || !fieldsElement) return;

  const state = {
    splide: null,
    next: 1,
    loading: false,
    maxForwardIndex: 0,
    videoCounter: 0,
  };

  const csrf = typeof csrfToken !== "undefined" ? csrfToken : "";

  const FIELD_CONFIG = [
    { key: "project_name", label: "Project Name" },
    { key: "price", label: "Price" },
    { key: "price_per_sqm", label: "Price per sqm" },
    { key: "unit_area", label: "Land / Unit Area" },
    { key: "number_of_bedroom", label: "Bedrooms" },
    { key: "number_of_bathroom", label: "Bathrooms" },
    { key: "number_of_car_parking", label: "Parking" },
    { key: "have_freehold", label: "Freehold", type: "boolean" },
    { key: "have_leasehold", label: "Leasehold", type: "boolean" },
    { key: "construction_year", label: "Completion Date" },
    { key: "quota", label: "Quota" },
    { key: "distance_from_location_to_BTS_or_MRT", label: "Access to BTS/MRT" },
    { key: "distance_from_location_to_ARL", label: "Access to ARL" },
    { key: "furnishing", label: "Furnishing" },
    { key: "have_tenant_occupied", label: "Tenant Occupied", type: "boolean" },
    { key: "have_owner_occupied", label: "Owner Occupied", type: "boolean" },
    { key: "have_duplex", label: "Duplex", type: "boolean" },
    { key: "have_pets_allowed", label: "Pet Friendly", type: "boolean" },
    { key: "number_of_balcony", label: "Balcony" },
    { key: "have_bathtub", label: "Bathtubs", type: "boolean" },
    { key: "view", label: "Primary View" },
    { key: "have_infinity_pool", label: "Infinity Pool", type: "boolean" },
    { key: "have_fitness_area", label: "Gym", type: "boolean" },
    { key: "have_sky_lounge", label: "Sky Lounge", type: "boolean" },
    { key: "details_link", label: "Details", type: "link" },
    { key: "interior_view", label: "Interior View", type: "iframe" },
    { key: "facility_view", label: "Facilities View", type: "iframe" },
    { key: "location_view", label: "Location View", type: "iframe" },
    { key: "ariel_view", label: "Aerial View", type: "video" },
  ];

  const formatCurrency = (value) => {
    if (typeof window.formatBalance === "function") {
      return window.formatBalance(Math.floor(value) || 0);
    }
    return new Intl.NumberFormat().format(Math.floor(value) || 0);
  };

  const formatBoolean = (value) => {
    if (value) {
      return `<span class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"><i class="bi bi-check-circle-fill"></i>Yes</span>`;
    }
    return `<span class="inline-flex items-center gap-2 text-sm font-medium text-destructive"><i class="bi bi-x-circle-fill"></i>No</span>`;
  };

  const renderMediaFrame = (url, fallback) => {
    if (!url) {
      return `<div class="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-xs text-muted-foreground">${fallback}</div>`;
    }
    return `<iframe src="${url}" class="h-full w-full rounded-xl border border-border" allowfullscreen loading="lazy"></iframe>`;
  };

  const createLoaderSlide = () => `
    <div class="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div class="aspect-video w-full animate-pulse rounded-xl bg-muted"></div>
      <div class="space-y-3">
        ${Array.from({ length: FIELD_CONFIG.length })
          .map(() => '<div class="h-3 w-full animate-pulse rounded bg-muted"></div>')
          .join("")}
      </div>
    </div>
  `;

  const createComparisonSlide = (item) => {
    const property = item?.property_info || {};
    const buildingLink = property.building_id
      ? `/building/details/${property.building_id}/`
      : "#";

    const metrics = FIELD_CONFIG.map((field) => {
      let content = "—";
      switch (field.type) {
        case "boolean":
          content = formatBoolean(property[field.key]);
          break;
        case "link":
          content = `<a href="/property/details/${property.id}/" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                       View details
                       <i class="bi bi-box-arrow-up-right text-xs"></i>
                     </a>`;
          break;
        case "iframe":
          content = `<div class="aspect-video">${renderMediaFrame(property[field.key], "Not available")}</div>`;
          break;
        case "video": {
          if (property[field.key]) {
            state.videoCounter += 1;
            const videoId = `comparison-video-${state.videoCounter}`;
            content = `
              <div class="aspect-video overflow-hidden rounded-xl border border-border bg-black/80">
                <video
                  id="${videoId}"
                  class="video-js h-full w-full"
                  controls
                  preload="auto"
                  data-setup="{}"
                >
                  <source src="${property[field.key]}" type="video/mp4" />
                  <p class="vjs-no-js">To view this video please enable JavaScript.</p>
                </video>
              </div>
            `;
            // Initialize after slide is mounted
            requestAnimationFrame(() => {
              try {
                window.videojs(videoId);
              } catch (error) {
                console.error(error);
              }
            });
          } else {
            content = `<div class="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-xs text-muted-foreground">
                         Not available
                       </div>`;
          }
          break;
        }
        default: {
          if (field.key === "project_name") {
            content = `<a href="${buildingLink}" class="text-sm font-semibold text-foreground hover:text-primary">${property.title || "-"}</a>`;
          } else if (field.key === "price") {
            content = property.price ? `฿ ${formatCurrency(property.price)}` : "—";
          } else if (field.key === "price_per_sqm") {
            content = property.price_per_sqm ? `฿ ${formatCurrency(property.price_per_sqm)} / sqm` : "—";
          } else if (field.key === "unit_area") {
            content = property.unit_area ? `${property.unit_area} sqm` : "—";
          } else {
            const value = property[field.key];
            content = value !== null && value !== undefined && value !== "" ? value : "—";
          }
        }
      }
      return `
        <li class="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2">
          <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">${field.label}</span>
          <span class="text-sm text-foreground text-right leading-relaxed">${content}</span>
        </li>
      `;
    }).join("");

    return `
      <li class="splide__slide comparison-slider-box">
        <article class="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div class="relative overflow-hidden rounded-xl border border-border bg-muted">
            <img src="${property.default_image || "/static/media/placeholder.png"}" alt="${property.title}" class="h-48 w-full object-cover" loading="lazy" />
            <button class="remove-from-comparison absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-border bg-black/60 text-white backdrop-blur transition hover:bg-black/80" data-property="${property.id}">
              <i class="bi bi-x-lg text-xs"></i>
              <span class="sr-only">Remove from comparison</span>
            </button>
          </div>
          <ul class="space-y-3 text-sm text-muted-foreground">
            ${metrics}
          </ul>
        </article>
      </li>
    `;
  };

  const updateFieldLabels = () => {
    fieldsElement.innerHTML = FIELD_CONFIG.map((field) => `<li>${field.label}</li>`).join("");
  };

  const removeLoaderSlides = () => {
    const loaders = listElement.querySelectorAll(".comparison-loader-slide");
    loaders.forEach((slide) => {
      try {
        state.splide?.remove(slide);
      } catch (error) {
        slide.remove();
      }
    });
  };

  const addLoaderSlides = (count) => {
    for (let i = 0; i < count; i += 1) {
      const loaderSlide = document.createElement("li");
      loaderSlide.className = "splide__slide comparison-loader-slide";
      loaderSlide.innerHTML = createLoaderSlide();
      listElement.appendChild(loaderSlide);
    }
    state.splide?.refresh();
  };

  const fetchComparisonList = async () => {
    if (state.loading) return;
    state.loading = true;

    const perPage = state.splide?.options?.perPage || 3;
    addLoaderSlides(perPage);

    try {
      const params = new URLSearchParams({
        page_size: perPage,
      });
      if (state.next) params.set("page", state.next);

      const response = await fetch(`${COMPARISON_API_URL}?${params.toString()}`, {
        headers: {
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      state.next = data?.next || null;

      const fragment = document.createDocumentFragment();
      (data?.results || []).forEach((result) => {
        const slideWrapper = document.createElement("div");
        slideWrapper.innerHTML = createComparisonSlide(result);
        fragment.appendChild(slideWrapper.firstElementChild);
      });

      listElement.appendChild(fragment);
      state.splide?.refresh();

      removeLoaderSlides();

      if (!data?.results?.length) {
        listElement.innerHTML = `
          <li class="splide__slide">
            <div class="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
              No properties in your comparison list yet. Add properties from search to begin.
            </div>
          </li>
        `;
        state.splide?.refresh();
      }
    } catch (error) {
      console.error("Failed to fetch comparison list", error);
      removeLoaderSlides();
      listElement.innerHTML = `
        <li class="splide__slide">
          <div class="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-destructive">
            Something went wrong while loading the comparison. Please try again.
          </div>
        </li>
      `;
      state.splide?.refresh();
    } finally {
      state.loading = false;
    }
  };

  const handleRemove = async (propertyId) => {
    if (!propertyId) return;
    try {
      const body = new URLSearchParams({ property: propertyId });
      const response = await fetch(COMPARISON_REMOVE_API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body,
      });
      if (!response.ok) throw new Error("Removal failed");

      listElement.innerHTML = "";
      state.next = 1;
      state.maxForwardIndex = 0;
      await fetchComparisonList();
    } catch (error) {
      console.error("Failed to remove property from comparison", error);
    }
  };

  document.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-from-comparison");
    if (removeButton) {
      event.preventDefault();
      handleRemove(removeButton.dataset.property);
    }
  });

  updateFieldLabels();

  state.splide = new Splide(sliderElement, {
    perPage: 3,
    gap: "1.5rem",
    pagination: false,
    arrows: true,
    breakpoints: {
      1280: {
        perPage: 2,
      },
      900: {
        perPage: 1,
      },
    },
  });

  state.splide.on("moved", (index) => {
    if (state.maxForwardIndex >= index) return;
    state.maxForwardIndex = index;
    if (state.next) {
      fetchComparisonList();
    }
  });

  state.splide.mount();
  fetchComparisonList();
})();


