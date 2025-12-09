/**
 * Comparison Manager
 * Manages comparison count, floating bar, and notifications
 */

(function () {
  "use strict";

  class ComparisonManager {
    constructor() {
      this.count = 0;
      this.maxCount = 3;
      this.bar = null;
      this.badge = null;
      this.init();
    }

    init() {
      this.createFloatingBar();
      this.createBadge();
      this.fetchCount();
      this.listenToEvents();
    }

    createFloatingBar() {
      // Check if bar already exists
      if (document.getElementById("comparison-floating-bar")) return;

      const bar = document.createElement("div");
      bar.id = "comparison-floating-bar";
      bar.className = "fixed bottom-0 left-0 right-0 z-50 hidden translate-y-full transition-transform duration-300 ease-in-out";
      bar.innerHTML = `
        <div class="container mx-auto px-4 pb-4">
          <div class="flex items-center justify-between gap-4 rounded-2xl border-2 border-primary bg-card p-4 shadow-2xl backdrop-blur-sm">
            <div class="flex items-center gap-4">
              <div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <i class="bi bi-arrow-left-right text-xl text-primary"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-foreground">
                  <span id="comparison-count-display">0</span> of ${this.maxCount} properties selected
                </p>
                <p class="text-xs text-muted-foreground">Compare properties side-by-side</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button 
                id="comparison-clear-btn" 
                class="hidden inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                title="Clear all"
              >
                <i class="bi bi-x-lg"></i>
                <span class="hidden sm:inline">Clear</span>
              </button>
              <a 
                href="/property/comparison/" 
                class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <span>View Comparison</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(bar);
      this.bar = bar;

      // Clear button handler
      const clearBtn = bar.querySelector("#comparison-clear-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => this.clearAll());
      }
    }

    createBadge() {
      // Add badge to comparison links in navigation if they exist
      const comparisonLinks = document.querySelectorAll('a[href*="comparison"]');
      this.badges = [];
      
      comparisonLinks.forEach(link => {
        let badge = link.querySelector(".comparison-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "comparison-badge ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white";
          badge.textContent = "0";
          badge.style.display = "none";
          link.appendChild(badge);
        }
        this.badges.push(badge);
      });
    }

    async fetchCount() {
      try {
        const response = await fetch("/property/api/compare/list/?page_size=1", {
          headers: {
            "X-CSRFToken": window.csrfToken || "",
          },
          credentials: "same-origin",
        });

        if (response.ok) {
          const data = await response.json();
          // Handle both paginated and non-paginated responses
          if (data.count !== undefined) {
            this.count = data.count;
          } else if (Array.isArray(data)) {
            this.count = data.length;
          } else if (data.results) {
            this.count = data.count || data.results.length;
          } else {
            this.count = 0;
          }
          this.updateUI();
        }
      } catch (error) {
        console.error("Failed to fetch comparison count:", error);
      }
    }

    increment() {
      if (this.count < this.maxCount) {
        this.count++;
        this.updateUI();
        this.showToast("Property added to comparison", "success");
      } else {
        this.showToast(`Maximum ${this.maxCount} properties can be compared`, "warning");
      }
    }

    decrement() {
      if (this.count > 0) {
        this.count--;
        this.updateUI();
        this.showToast("Property removed from comparison", "info");
      }
    }

    updateUI() {
      // Update floating bar
      if (this.bar) {
        const countDisplay = this.bar.querySelector("#comparison-count-display");
        if (countDisplay) {
          countDisplay.textContent = this.count;
        }

        const clearBtn = this.bar.querySelector("#comparison-clear-btn");
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", this.count === 0);
        }

        // Show/hide bar
        if (this.count > 0) {
          this.bar.classList.remove("hidden", "translate-y-full");
          this.bar.classList.add("translate-y-0");
        } else {
          this.bar.classList.remove("translate-y-0");
          this.bar.classList.add("translate-y-full");
          setTimeout(() => {
            if (this.count === 0) {
              this.bar.classList.add("hidden");
            }
          }, 300);
        }
      }

      // Update all badges
      if (this.badges && this.badges.length > 0) {
        this.badges.forEach(badge => {
          if (this.count > 0) {
            badge.textContent = this.count;
            badge.style.display = "inline-flex";
          } else {
            badge.style.display = "none";
          }
        });
      }
    }

    async clearAll() {
      if (this.count === 0) return;
      
      if (!confirm(`Remove all ${this.count} properties from comparison?`)) {
        return;
      }

      try {
        // Fetch all comparison items
        const response = await fetch("/property/api/compare/list/", {
          headers: {
            "X-CSRFToken": window.csrfToken || "",
          },
          credentials: "same-origin",
        });

        if (response.ok) {
          const data = await response.json();
          const items = data.results || [];
          
          // Remove each item
          for (const item of items) {
            await fetch("/property/api/compare/delete/", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRFToken": window.csrfToken || "",
              },
              credentials: "same-origin",
              body: new URLSearchParams({ property: item.property_info?.id || item.property }),
            });
          }

          this.count = 0;
          this.updateUI();
          this.showToast("All properties removed from comparison", "info");
          
          // Update all compare buttons on page
          document.querySelectorAll(".add-to-compare[added='true']").forEach(btn => {
            btn.setAttribute("added", "false");
            btn.innerHTML = `<i class="bi bi-arrow-left-right"></i><span class="sr-only">Compare</span>`;
          });
        }
      } catch (error) {
        console.error("Failed to clear comparison:", error);
        this.showToast("Failed to clear comparison", "error");
      }
    }

    showToast(message, type = "info") {
      // Remove existing toast
      const existing = document.getElementById("comparison-toast");
      if (existing) {
        existing.remove();
      }

      const toast = document.createElement("div");
      toast.id = "comparison-toast";
      const bgColor = {
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        error: "bg-red-500",
        info: "bg-primary"
      }[type] || "bg-primary";

      toast.className = `fixed top-20 right-4 z-50 flex items-center gap-3 rounded-lg ${bgColor} px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 translate-x-full`;
      toast.innerHTML = `
        <i class="bi bi-${type === "success" ? "check-circle" : type === "warning" ? "exclamation-triangle" : type === "error" ? "x-circle" : "info-circle"}"></i>
        <span>${message}</span>
      `;
      document.body.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.classList.remove("translate-x-full");
      });

      // Remove after 3 seconds
      setTimeout(() => {
        toast.classList.add("translate-x-full");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    listenToEvents() {
      // Listen to compare events
      window.addEventListener("compare:added", () => {
        this.increment();
      });

      window.addEventListener("compare:removed", () => {
        this.decrement();
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.ComparisonManager = new ComparisonManager();
    });
  } else {
    window.ComparisonManager = new ComparisonManager();
  }
})();

