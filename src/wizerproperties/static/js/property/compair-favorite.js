/**
 * Modern Compare/Favorite Property Actions
 * Handles adding/removing properties from compare and favorite lists
 * Uses fetch API, no jQuery dependencies
 * Integrates with card factory button states
 */

(function () {
  "use strict";

  // Get CSRF token from global or meta tag
  const getCSRFToken = () => {
    if (typeof csrfToken !== "undefined") return csrfToken;
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : "";
  };

  const csrf = getCSRFToken();

  // Loading state management
  let compareRequestInFlight = false;
  let favoriteRequestInFlight = false;

  // Loader SVG (inline for performance)
  const loaderSVG = `<img src="/static/media/loader.svg" alt="Loading..." class="size-4 animate-spin" />`;

  /**
   * Show loading state on button
   */
  const showLoader = (button) => {
    const originalHTML = button.innerHTML;
    button.dataset.originalHtml = originalHTML;
    button.disabled = true;
    button.innerHTML = loaderSVG;
    button.setAttribute("aria-busy", "true");
  };

  /**
   * Restore button to original state
   */
  const restoreButton = (button, isAdded) => {
    const originalHTML = button.dataset.originalHtml || button.innerHTML;
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.setAttribute("added", isAdded ? "true" : "false");
    
    // Update icon based on button type and state
    const isFavorite = button.classList.contains("add-to-favorite");
    const isCompare = button.classList.contains("add-to-compare");
    
    if (isFavorite) {
      button.innerHTML = `<i class="bi bi-${isAdded ? "heart-fill" : "heart"}"></i><span class="sr-only">Favorite</span>`;
    } else if (isCompare) {
      button.innerHTML = `<i class="bi bi-${isAdded ? "check2" : "arrow-left-right"}"></i><span class="sr-only">Compare</span>`;
    } else {
      button.innerHTML = originalHTML;
    }
  };

  /**
   * Handle API errors with user feedback
   */
  const handleError = (button, error, action) => {
    console.error(`Failed to ${action} property:`, error);
    const wasAdded = button.getAttribute("added") === "true";
    restoreButton(button, wasAdded);
    
    // Optional: Show toast/alert notification
    // You can integrate with a notification system here
  };

  /**
   * Add property to compare list
   */
  const addToCompare = async (button) => {
    if (compareRequestInFlight) return;
    
    const propertyId = button.getAttribute("index");
    if (!propertyId) {
      console.error("Property ID missing from compare button");
      return;
    }

    // Check if already at max (3 properties)
    if (window.ComparisonManager && window.ComparisonManager.count >= 3) {
      if (window.ComparisonManager) {
        window.ComparisonManager.showToast("Maximum 3 properties can be compared. Remove one to add another.", "warning");
      }
      return;
    }

    compareRequestInFlight = true;
    showLoader(button);

    try {
      const response = await fetch("/property/api/compare/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body: JSON.stringify({ property: propertyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        
        // Handle limit exceeded error
        if (response.status === 400 && (errorMessage.includes("Maximum") || errorMessage.includes("3") || errorMessage.includes("limit"))) {
          if (window.ComparisonManager) {
            window.ComparisonManager.showToast(errorMessage, "warning");
          }
          restoreButton(button, false);
          compareRequestInFlight = false;
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json().catch(() => ({}));
      
      // Update button state
      restoreButton(button, true);
      
      // Update card visual state (darker style)
      const card = button.closest("[data-property-card]");
      if (card) {
        card.classList.add("property-compared");
      }
      
      // Track analytics
      if (window.Analytics) {
        const propertyData = button.dataset;
        window.Analytics.trackPropertyCompare(propertyId, {
          name: propertyData.name || propertyData.title || 'Property',
          title: propertyData.title || 'Property',
          price: parseFloat(propertyData.price) || 0
        }, true);
      }
      
      // Emit event for count syncing
      window.dispatchEvent(
        new CustomEvent("compare:added", {
          detail: { propertyId },
        })
      );

      // Optional: Add visual feedback effect
      const effect = button.getAttribute("effect") || "pulse";
      if (effect === "pulse") {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 1000);
      }
    } catch (error) {
      handleError(button, error, "add to compare");
    } finally {
      compareRequestInFlight = false;
    }
  };

  /**
   * Remove property from compare list
   */
  const removeFromCompare = async (button) => {
    if (compareRequestInFlight) return;
    
    const propertyId = button.getAttribute("index");
    if (!propertyId) {
      console.error("Property ID missing from compare button");
      return;
    }

    compareRequestInFlight = true;
    showLoader(button);

    try {
      const response = await fetch("/property/api/compare/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body: JSON.stringify({ property: propertyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Update button state
      restoreButton(button, false);
      
      // Update card visual state (remove darker style)
      const card = button.closest("[data-property-card]");
      if (card) {
        card.classList.remove("property-compared");
      }
      
      // Track analytics
      if (window.Analytics) {
        const propertyData = button.dataset;
        window.Analytics.trackPropertyCompare(propertyId, {
          name: propertyData.name || propertyData.title || 'Property',
          title: propertyData.title || 'Property',
          price: parseFloat(propertyData.price) || 0
        }, false);
      }
      
      // Emit event for count syncing
      window.dispatchEvent(
        new CustomEvent("compare:removed", {
          detail: { propertyId },
        })
      );
    } catch (error) {
      handleError(button, error, "remove from compare");
    } finally {
      compareRequestInFlight = false;
    }
  };

  /**
   * Add property to favorites
   */
  const addToFavorite = async (button) => {
    if (favoriteRequestInFlight) return;
    
    const propertyId = button.getAttribute("index");
    if (!propertyId) {
      console.error("Property ID missing from favorite button");
      return;
    }

    favoriteRequestInFlight = true;
    showLoader(button);

    try {
      const response = await fetch("/property/api/prospect-favorite/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body: JSON.stringify({ property: propertyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      
      // Update button state
      restoreButton(button, true);
      
      // Track analytics
      if (window.Analytics) {
        const propertyData = button.dataset;
        window.Analytics.trackPropertyFavorite(propertyId, {
          name: propertyData.name || propertyData.title || 'Property',
          title: propertyData.title || 'Property',
          price: parseFloat(propertyData.price) || 0
        }, true);
      }
      
      // Emit event for count syncing
      window.dispatchEvent(
        new CustomEvent("favorite:added", {
          detail: { propertyId },
        })
      );

      // Optional: Add visual feedback effect
      const effect = button.getAttribute("effect") || "pulse";
      if (effect === "pulse") {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 1000);
      }
    } catch (error) {
      handleError(button, error, "add to favorites");
    } finally {
      favoriteRequestInFlight = false;
    }
  };

  /**
   * Remove property from favorites
   */
  const removeFromFavorite = async (button) => {
    if (favoriteRequestInFlight) return;
    
    const propertyId = button.getAttribute("index");
    if (!propertyId) {
      console.error("Property ID missing from favorite button");
      return;
    }

    favoriteRequestInFlight = true;
    showLoader(button);

    try {
      const response = await fetch("/property/api/prospect-favorite/remove/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body: JSON.stringify({ property: propertyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Update button state
      restoreButton(button, false);
      
      // Track analytics
      if (window.Analytics) {
        const propertyData = button.dataset;
        window.Analytics.trackPropertyFavorite(propertyId, {
          name: propertyData.name || propertyData.title || 'Property',
          title: propertyData.title || 'Property',
          price: parseFloat(propertyData.price) || 0
        }, false);
      }
      
      // Emit event for count syncing and card removal
      window.dispatchEvent(
        new CustomEvent("favorite:removed", {
          detail: { propertyId },
        })
      );

      // Remove card from favorites list if on favorites page
      // This maintains backward compatibility with favorite-list.js
      const cardContainer = button.closest("[data-property-card]") || 
                           button.closest(".property-single-box");
      if (cardContainer && typeof favorite_removable !== "undefined" && favorite_removable) {
        cardContainer.remove();
      }
    } catch (error) {
      handleError(button, error, "remove from favorites");
    } finally {
      favoriteRequestInFlight = false;
    }
  };

  /**
   * Handle button clicks with event delegation
   */
  const handleButtonClick = (event) => {
    const button = event.target.closest(".add-to-favorite, .add-to-compare");
    if (!button) return;

    // Check if user is authenticated
    const addedAttr = button.getAttribute("added");
    if ([undefined, null, "null", "undefined"].includes(addedAttr)) {
      // Use global login_url if available, otherwise fallback to default
      const loginUrl = typeof login_url !== "undefined" ? login_url : "/user/login/";
      window.location.href = loginUrl;
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const isAdded = addedAttr === "true";
    const isFavorite = button.classList.contains("add-to-favorite");
    const isCompare = button.classList.contains("add-to-compare");

    if (isFavorite) {
      if (isAdded) {
        removeFromFavorite(button);
      } else {
        addToFavorite(button);
      }
    } else if (isCompare) {
      if (isAdded) {
        removeFromCompare(button);
      } else {
        addToCompare(button);
      }
    }
  };

  // Initialize event listeners when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.addEventListener("click", handleButtonClick);
    });
  } else {
    document.addEventListener("click", handleButtonClick);
  }

  // Export functions for potential external use
  window.PropertyCompareFavorite = {
    addToCompare,
    removeFromCompare,
    addToFavorite,
    removeFromFavorite,
  };
})();
