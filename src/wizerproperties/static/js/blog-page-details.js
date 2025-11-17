$(function () {
  const likeButton = $(".blog-like-btn");
  const dislikeButton = $(".blog-unlike-btn");
  const relatedContainer = $(".related-blogs");
  const csrfTokenValue = typeof csrfToken !== "undefined" && csrfToken ? csrfToken : (document.querySelector('input[name="csrfmiddlewaretoken"]')?.value || "");
  const postId = relatedContainer.attr("post-id");
  const categoriesRaw = relatedContainer.data("post-categories");
  const postCategories = typeof categoriesRaw === "string" && categoriesRaw.length
    ? categoriesRaw.split("|").map((item) => item.trim()).filter(Boolean)
    : [];

  function toggleIcons(button, isActive) {
    button.find('[data-icon="default"]').toggleClass("hidden", isActive);
    button.find('[data-icon="active"]').toggleClass("hidden", !isActive);
  }

  function updateIcons() {
    toggleIcons(likeButton, likeButton.attr("like-done") === "true");
    toggleIcons(dislikeButton, dislikeButton.attr("unlike-done") === "true");
  }

  likeButton.on("click", function () {
    const isLiked = $(this).attr("like-done") === "true";
    $(this).attr("like-done", isLiked ? "false" : "true");
    if (!isLiked) {
      dislikeButton.attr("unlike-done", "false");
    }
    updateIcons();

    $.ajax({
      url: `/blogs/api/posts/post-like-dislike/`,
      type: "POST",
      headers: { "X-CSRFToken": csrfTokenValue },
      data: { interaction_type: isLiked ? "undo" : "like", post_id: postId },
    });
  });

  dislikeButton.on("click", function () {
    const isDisliked = $(this).attr("unlike-done") === "true";
    $(this).attr("unlike-done", isDisliked ? "false" : "true");
    if (!isDisliked) {
      likeButton.attr("like-done", "false");
    }
    updateIcons();

    $.ajax({
      url: `/blogs/api/posts/post-like-dislike/`,
      type: "POST",
      headers: { "X-CSRFToken": csrfTokenValue },
      data: { interaction_type: isDisliked ? "undo" : "dislike", post_id: postId },
    });
  });

  updateIcons();

  function renderRelatedPosts(posts = []) {
    const list = relatedContainer.find(".related-blog-list");
    if (!list.length) return;

    const cards = posts
      .map((post) => {
        const banner = post.banner_image || "/static/media/logo.png";
        const readTime = post.estimated_read_time ? `${post.estimated_read_time} min read` : "";
        const likes = typeof post.total_likes === "number" ? `${post.total_likes} likes` : "";
        const views = typeof post.total_read_count === "number" ? `${post.total_read_count} views` : "";

        const categories = (post.categories || [])
          .map(
            (category) =>
              `<span class="rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">${category}</span>`
          )
          .join("");

        return `
          <a href="/blogs/${post.slug}/" class="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card/95 p-4 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <div class="aspect-[4/3] w-32 overflow-hidden rounded-xl bg-muted/50">
              <img src="${banner}" alt="${post.title}" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
            </div>
            <div class="flex flex-1 flex-col gap-3">
              <div class="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
                ${categories}
              </div>
              <h3 class="text-sm font-semibold text-foreground transition group-hover:text-primary">${post.title}</h3>
              <div class="mt-auto flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                ${likes ? `<span class="inline-flex items-center gap-1"><i class="bi bi-hand-thumbs-up"></i>${likes}</span>` : ""}
                ${views ? `<span class="inline-flex items-center gap-1"><i class="bi bi-eye"></i>${views}</span>` : ""}
                ${readTime ? `<span class="inline-flex items-center gap-1"><i class="bi bi-clock-history"></i>${readTime}</span>` : ""}
              </div>
            </div>
          </a>
        `;
      })
      .join("");

    list.html(cards || `<p class="text-sm text-muted-foreground">No related posts yet—check back soon.</p>`);
  }

  function fetchRelatedPosts() {
    if (!relatedContainer.length) return;

    const readPosts = JSON.parse(localStorage.getItem("read_posts_id") || "[]");
    const categories = JSON.parse(localStorage.getItem("post_categories_name") || "[]");

    $.ajax({
      url: `/blogs/api/posts/related-posts/`,
      type: "GET",
      data: {
        current_post_id: postId,
        read_posts_id: readPosts,
        post_categories_name: categories,
      },
      success: renderRelatedPosts,
    });
  }

  function storeReaderContext(postIdValue, postCategoriesValue) {
    const readPosts = JSON.parse(localStorage.getItem("read_posts_id") || "[]");
    const storedCategories = JSON.parse(localStorage.getItem("post_categories_name") || "[]");

    if (postIdValue && !readPosts.includes(postIdValue)) readPosts.push(postIdValue);
    postCategoriesValue.forEach((category) => {
      if (!storedCategories.includes(category)) storedCategories.push(category);
    });

    while (readPosts.length > 10) readPosts.shift();
    while (storedCategories.length > 10) storedCategories.shift();

    localStorage.setItem("read_posts_id", JSON.stringify(readPosts));
    localStorage.setItem("post_categories_name", JSON.stringify(storedCategories));
  }

  storeReaderContext(postId, postCategories);
  fetchRelatedPosts();

  const startTime = new Date().getTime();

  function calculateTimeSpent() {
    const endTime = new Date().getTime();
    return Math.round((endTime - startTime) / 1000);
  }

  window.addEventListener("beforeunload", function () {
    const timeSpent = calculateTimeSpent();

    if (!postId) return;

    $.ajax({
      url: `/blogs/api/posts/save-read-time/`,
      type: "POST",
      headers: { "X-CSRFToken": csrfTokenValue },
      data: {
        time_spent: timeSpent,
        post_id: postId,
      },
    });
  });
});