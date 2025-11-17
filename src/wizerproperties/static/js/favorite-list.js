"use strict";

(function () {
  const CardFactory = window.PropertyCardFactory;
  if (!CardFactory || typeof CardFactory.createCard !== "function") return;

  const listNode = document.querySelector("#favorite-list");
  const countNode = document.querySelector("[label='available-properties']");
  const emptyState = document.querySelector("[data-empty-state]");

  if (!listNode) return;

  const state = {
    next: 1,
    loading: false,
    observer: null,
    total: 0,
  };

  const csrf = typeof csrfToken !== "undefined" ? csrfToken : "";
  const perPage = 9;
  const userType = typeof user_type !== "undefined" ? user_type : null;
  const showActions = !["agent", "developer"].includes(userType || "");
  const favoriteEffect = localStorage.getItem("favorite-effect") || "pulse";

  const createLoader = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "property-single-box animate-pulse rounded-2xl border border-border bg-card p-6 shadow-sm";
    wrapper.innerHTML = `
      <div class="aspect-video w-full rounded-xl bg-muted"></div>
      <div class="mt-4 space-y-3">
        <div class="h-4 w-3/4 rounded bg-muted"></div>
        <div class="h-4 w-1/2 rounded bg-muted"></div>
        <div class="h-3 w-full rounded bg-muted"></div>
      </div>
    `;
    wrapper.dataset.loader = "true";
    return wrapper;
  };

  const mountCard = (card) => {
    const splideElement = card.querySelector(".splide");
    if (!splideElement || splideElement.dataset.splideMounted === "true") return;
    const splide = new Splide(splideElement, {
      perPage: 1,
      gap: "0.75rem",
      pagination: false,
      arrows: true,
    });
    splide.mount();
    splideElement.dataset.splideMounted = "true";
  };

  const renderFavorites = (items = []) => {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const property = item?.property_info;
      if (!property) return;
      const card = CardFactory.createCard(property, {
        showActions,
        favoriteEffect,
        enableMediaButtons: false,
        scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
        contactEmail: (p) => p?.developer_email || null,
      });
      const wrapper = document.createElement("div");
      wrapper.className = "property-single-box";
      wrapper.appendChild(card);
      fragment.appendChild(wrapper);
      mountCard(card);
    });
    listNode.appendChild(fragment);
  };

  const clearLoaders = () => {
    listNode.querySelectorAll("[data-loader]").forEach((node) => node.remove());
  };

  const addLoaders = () => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < Math.min(perPage, 4); i += 1) {
      fragment.appendChild(createLoader());
    }
    listNode.appendChild(fragment);
  };

  const updateEmptyState = () => {
    if (!emptyState) return;
    const hasCards = listNode.querySelectorAll(".property-single-box").length > 0;
    emptyState.classList.toggle("hidden", hasCards);
  };

  const fetchFavorites = async () => {
    if (!state.next || state.loading) return;
    state.loading = true;
    addLoaders();

    try {
      const params = new URLSearchParams({
        page_size: perPage,
        page: state.next,
      });
      const response = await fetch(`/property/api/prospect-favorite/list/?${params.toString()}`, {
        headers: { "X-CSRFToken": csrf },
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      state.next = data?.next || null;
      state.total = data?.count ?? 0;
      if (countNode) {
        countNode.textContent = state.total.toString();
      }

      clearLoaders();
      renderFavorites(data?.results || []);
      updateEmptyState();
    } catch (error) {
      console.error("Failed to load favorites", error);
      clearLoaders();
      updateEmptyState();
    } finally {
      state.loading = false;
    }
  };

  const initObserver = () => {
    const sentinel = document.createElement("div");
    sentinel.className = "h-1";
    listNode.appendChild(sentinel);

    state.observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && state.next) {
        fetchFavorites();
      }
    }, { rootMargin: "800px" });

    state.observer.observe(sentinel);
  };

  window.addEventListener("favorite:removed", () => {
    state.total = Math.max(state.total - 1, 0);
    if (countNode) {
      countNode.textContent = state.total.toString();
    }
    updateEmptyState();
    if (state.next && listNode.querySelectorAll(".property-single-box").length < perPage) {
      fetchFavorites();
    }
  });

  initObserver();
  fetchFavorites();
})();


