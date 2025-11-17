"use strict";

(function () {
  const CardFactory = window.PropertyCardFactory;
  if (!CardFactory || typeof CardFactory.createCard !== "function") return;

  const listNode = document.querySelector("#user-property-list");
  const totalNode = document.querySelector('[label-name="total"]');
  const emptyState = document.querySelector("[data-empty-state]");

  if (!listNode || !totalNode) return;

  const csrf = typeof csrfToken !== "undefined" ? csrfToken : "";
  const userType = typeof user_type !== "undefined" ? user_type : null;
  const perPageBreakpoints = () => {
    if (window.innerWidth <= 575) return 3;
    if (window.innerWidth <= 991) return 4;
    if (window.innerWidth <= 1400) return 6;
    return 8;
  };

  const state = {
    next: 1,
    loading: false,
    observer: null,
    pageSize: perPageBreakpoints(),
  };

  const addLoader = () => {
    const loader = document.createElement("div");
    loader.className = "animate-pulse rounded-2xl border border-border bg-card p-6 shadow-sm";
    loader.innerHTML = `
      <div class="aspect-video w-full rounded-xl bg-muted"></div>
      <div class="mt-4 space-y-3">
        <div class="h-4 w-3/4 rounded bg-muted"></div>
        <div class="h-4 w-1/2 rounded bg-muted"></div>
        <div class="h-3 w-full rounded bg-muted"></div>
      </div>
    `;
    loader.dataset.loader = "true";
    listNode.appendChild(loader);
  };

  const clearLoaders = () => {
    listNode.querySelectorAll("[data-loader]").forEach((node) => node.remove());
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

  const renderProperties = (items = []) => {
    const fragment = document.createDocumentFragment();
    items.forEach((property) => {
      const card = CardFactory.createCard(property, {
        showActions: !["agent", "developer"].includes(userType || ""),
        enableMediaButtons: false,
        scheduleUrl: (p) => `/schedule/create_schedule/?type=property&id=${p?.id ?? ""}`,
        contactEmail: (p) => p?.developer_email || null,
      });
      const wrapper = document.createElement("div");
      wrapper.className = "user-property-single-box";
      wrapper.appendChild(card);
      fragment.appendChild(wrapper);
      mountCard(card);
    });
    listNode.appendChild(fragment);
  };

  const updateEmptyState = (count, appended) => {
    if (!emptyState) return;
    if (count === 0 && !appended) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  };

  const fetchProperties = async () => {
    if (!state.next || state.loading) return;
    state.loading = true;

    for (let i = 0; i < Math.min(state.pageSize, 4); i += 1) addLoader();

    try {
      const params = new URLSearchParams({
        page_size: state.pageSize,
        page: state.next,
      });
      const response = await fetch(`/property/api/user-properties/${USER_ID}/?${params.toString()}`, {
        headers: { "X-CSRFToken": csrf },
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const data = await response.json();
      state.next = data?.next || null;
      totalNode.textContent = data?.count ?? "0";

      clearLoaders();
      renderProperties(data?.results || []);
      updateEmptyState(data?.count || 0, (data?.results || []).length > 0 || listNode.querySelectorAll(".user-property-single-box").length > 0);
    } catch (error) {
      console.error("Failed to load properties", error);
      clearLoaders();
      updateEmptyState(0, false);
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
        fetchProperties();
      }
    }, { rootMargin: "800px" });

    state.observer.observe(sentinel);
  };

  window.addEventListener("resize", () => {
    const newSize = perPageBreakpoints();
    if (newSize !== state.pageSize) {
      state.pageSize = newSize;
    }
  });

  document.addEventListener("click", (event) => {
    const toggleBtn = event.target.closest(".reel-see-more-see-less");
    if (!toggleBtn) return;
    event.preventDefault();
    const container = toggleBtn.closest("[view-type]");
    if (!container) return;
    const details = container.querySelector(".reel-details");
    if (!details) return;
    const expanded = container.getAttribute("view-type") === "more";
    if (expanded) {
      container.setAttribute("view-type", "less");
      toggleBtn.textContent = "See more";
      details.classList.add("max-h-24");
      details.classList.remove("max-h-none");
    } else {
      container.setAttribute("view-type", "more");
      toggleBtn.textContent = "See less";
      details.classList.remove("max-h-24");
      details.classList.add("max-h-none");
    }
  });

  initObserver();
  fetchProperties();
})();


