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
      return `฿ ${window.formatBalance(Number(value))}`;
    }
    return `฿ ${Number(value).toLocaleString()}`;
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB");
  };

  const buildBadges = (property, container) => {
    container.innerHTML = "";
    if (!property) {
      container.classList.add("hidden");
      return;
    }
    const fragments = document.createDocumentFragment();

    if (property.tag === "spotlight") {
      const badge = document.createElement("span");
      badge.className = "rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white";
      badge.textContent = "Flash Sale";
      fragments.appendChild(badge);
    }
    if (property.tag === "feature") {
      const badge = document.createElement("span");
      badge.className = "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white";
      badge.textContent = "Featured Listing";
      fragments.appendChild(badge);
    }
    if (property.discount_period) {
      const countdown = document.createElement("div");
      countdown.className = "rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur";
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
      chip.className = "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground";
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
    if (splideElement) {
      splideElement.dataset.splideId = property.id || "";
    }
    populateGallery(galleryList, property, config.loaderThreshold);

    const priceElement = card.querySelector("[data-card-price]");
    const priceSqmElement = card.querySelector("[data-card-price-sqm]");
    if (priceElement) priceElement.textContent = formatCurrency(property.price);
    if (priceSqmElement) priceSqmElement.textContent = property.price_per_sqm ? `${formatCurrency(property.price_per_sqm)} / sqm` : "—";

    const link = card.querySelector("[data-card-link]");
    if (link) {
      let detailUrl = `/property/details/${property.id ?? ""}/`;
      if (property.tag === "spotlight") detailUrl += "?discounted=True";
      else if (property.tag === "feature") detailUrl += "?featured=True";
      link.href = detailUrl;
    }

    const title = card.querySelector("[data-card-title]");
    if (title) title.textContent = property.building_title || property.title || "Untitled property";

    const address = card.querySelector("[data-card-address]");
    if (address) address.textContent = property.address || "N/A";

    const beds = card.querySelector("[data-card-beds]");
    if (beds) beds.textContent = property.number_of_bedroom || "—";

    const baths = card.querySelector("[data-card-baths]");
    if (baths) baths.textContent = property.number_of_bathroom || "—";

    const size = card.querySelector("[data-card-size]");
    if (size) size.textContent = property.unit_area ? `${property.unit_area} sqm` : "— sqm";

    const floor = card.querySelector("[data-card-floor]");
    if (floor) floor.textContent = property.floor_number || "—";

    const features = card.querySelector("[data-card-features]");
    if (features) buildFeatures(property, features);

    const buttonContainer = card.querySelector("[data-card-action-buttons]");
    const threeDButton = card.querySelector("[data-card-3d]");
    const droneButton = card.querySelector("[data-card-drone]");
    if (threeDButton) {
      if (property.interior_view) {
        threeDButton.classList.remove("hidden");
        threeDButton.dataset.card3d = property.interior_view;
        threeDButton.setAttribute("data-3d-view", property.interior_view);
      } else {
        threeDButton.classList.add("hidden");
      }
    }
    if (droneButton) {
      if (property.ariel_view) {
        droneButton.classList.remove("hidden");
        droneButton.dataset.cardDrone = property.ariel_view;
        droneButton.setAttribute("data-drone-view", property.ariel_view);
      } else {
        droneButton.classList.add("hidden");
      }
    }
    if (buttonContainer && !buttonContainer.querySelector("button:not(.hidden)")) {
      buttonContainer.classList.add("hidden");
    } else {
      buttonContainer?.classList.remove("hidden");
    }

    const developerImage = card.querySelector("[data-card-developer-image]");
    if (developerImage) {
      developerImage.src = property.developer_image || defaultAvatar;
      withImageFallback(developerImage, defaultAvatar);
    }

    const developerName = card.querySelector("[data-card-developer-name]");
    if (developerName) developerName.textContent = property.developer_company_name || "N/A";

    const created = card.querySelector("[data-card-created]");
    if (created) created.textContent = formatDate(property.created_at);

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
