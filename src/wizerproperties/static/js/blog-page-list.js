document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-blog-grid]");
  const loader = document.querySelector("[data-blog-loader]");
  const emptyState = document.querySelector("[data-blog-empty]");
  const loadMoreButton = document.querySelector("[data-blog-load]");
  const categorySelect = document.querySelector(".blog-category-select-filter");
  const toggleButtons = document.querySelectorAll("[data-blog-toggle]");

  if (!grid) return;

  const state = {
    page: 1,
    loading: false,
    hasNext: true,
    category: categorySelect ? categorySelect.value : "",
    most_read: initialBlogFilters?.most_read || false,
    most_liked: initialBlogFilters?.most_liked || false,
    most_recent: initialBlogFilters?.most_recent || false,
  };

  const updateToggleAppearance = () => {
    toggleButtons.forEach((button) => {
      const key = button.getAttribute("data-blog-toggle");
      const isActive = state[key];
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("btn", isActive);
      button.classList.toggle("btn-secondary", !isActive);
    });
  };

  const showLoader = (visible) => {
    if (!loader) return;
    loader.classList.toggle("hidden", !visible);
  };

  const setEmptyState = (visible) => {
    if (!emptyState) return;
    emptyState.classList.toggle("hidden", !visible);
  };

  const updateLoadMoreVisibility = () => {
    if (!loadMoreButton) return;
    loadMoreButton.classList.toggle("hidden", !state.hasNext);
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("page", state.page);
    if (state.category) params.set("category", state.category);
    if (state.most_read) params.set("most_read", "true");
    if (state.most_liked) params.set("most_liked", "true");
    if (state.most_recent) params.set("most_recent", "true");
    return params.toString();
  };

  const formatCategories = (categories = []) =>
    categories
      .map(
        (category) =>
          `<span class="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">${category}</span>`
      )
      .join("");

  const renderCard = (post) => {
    const banner = post.banner_image || "/static/media/logo.png";
    const title = post.title || "Untitled";
    const subtitle = post.subtitle || "";
    const created = post.created_at || "";
    const readTime = post.estimated_read_time ? `${post.estimated_read_time} min read` : "";
    const likes = typeof post.total_likes === "number" ? `${post.total_likes} likes` : "";
    const views = typeof post.total_read_count === "number" ? `${post.total_read_count} views` : "";

    return `
      <article class="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
        <a href="/blogs/${post.slug}" class="relative block overflow-hidden">
          <img src="${banner}" alt="${title}" class="h-52 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          <div class="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
            ${formatCategories(post.categories || [])}
          </div>
        </a>
        <div class="flex flex-1 flex-col gap-4 p-6">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">${created}</p>
            <a href="/blogs/${post.slug}" class="text-lg font-semibold text-foreground transition hover:text-primary">${title}</a>
            <p class="text-sm text-muted-foreground line-clamp-3">${subtitle}</p>
          </div>
          <div class="mt-auto flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            ${likes ? `<span class="inline-flex items-center gap-1"><i class="bi bi-hand-thumbs-up"></i>${likes}</span>` : ""}
            ${views ? `<span class="inline-flex items-center gap-1"><i class="bi bi-eye"></i>${views}</span>` : ""}
            ${readTime ? `<span class="inline-flex items-center gap-1"><i class="bi bi-clock-history"></i>${readTime}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  };

  const fetchPosts = async ({ reset = false } = {}) => {
    if (state.loading || (!state.hasNext && !reset)) return;

    state.loading = true;
    showLoader(true);
    if (reset) {
      state.page = 1;
      state.hasNext = true;
      grid.innerHTML = "";
      setEmptyState(false);
    }

    try {
      const response = await fetch(`/blogs/api/posts/?${buildQueryParams()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      const cards = data.results?.map(renderCard).join("") || "";
      if (state.page === 1 && !cards) {
        setEmptyState(true);
      } else {
        grid.insertAdjacentHTML("beforeend", cards);
      }

      state.page += 1;
      state.hasNext = Boolean(data.links?.next);
      updateLoadMoreVisibility();
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setEmptyState(true);
      state.hasNext = false;
      updateLoadMoreVisibility();
    } finally {
      state.loading = false;
      showLoader(false);
    }
  };

  if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
      state.category = event.target.value;
      fetchPosts({ reset: true });
    });
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-blog-toggle");
      state[key] = !state[key];
      updateToggleAppearance();
      fetchPosts({ reset: true });
    });
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
      fetchPosts();
    });
  }

  updateToggleAppearance();
  fetchPosts({ reset: true });
});
