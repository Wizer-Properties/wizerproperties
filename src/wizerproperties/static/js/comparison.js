"use strict";

/**
 * Modern Property Comparison Page
 * Rebuilt from scratch following search page design patterns
 * Features:
 * - Responsive comparison table (desktop) and slider (mobile)
 * - Sticky header with breadcrumbs
 * - Loading states and empty states
 * - Clean, intuitive UX
 */

(function () {
  // Configuration
  const CONFIG = {
    apiUrl: window.COMPARISON_API_URL || '/property/api/compare/list/',
    removeUrl: window.COMPARISON_REMOVE_API_URL || '/property/api/compare/delete/',
    maxProperties: 3,
  };

  // State
  const state = {
    properties: [],
    loading: false,
    splide: null,
    videoCounter: 0,
  };

  // DOM Elements
  const elements = {
    main: document.getElementById('comparison-main'),
    loading: document.getElementById('comparison-loading'),
    container: document.getElementById('comparison-container'),
    empty: document.getElementById('comparison-empty'),
    tableDesktop: document.getElementById('comparison-table-desktop'),
    tableBody: document.getElementById('comparison-table-body'),
    fieldsList: document.getElementById('comparison-fields-list'),
    listMobile: document.getElementById('comparison-list-mobile'),
    sliderMobile: document.getElementById('comparison-slider-mobile'),
    countHeader: document.getElementById('comparison-count-header'),
    clearAllBtn: document.getElementById('clear-all-comparison'),
  };

  // CSRF Token
  const csrf = typeof csrfToken !== "undefined" ? csrfToken : "";

  // Field Configuration
  const FIELD_CONFIG = [
    { key: "building_title", label: "Project Name", type: "text" },
    { key: "price", label: "Price", type: "currency" },
    { key: "price_per_sqm", label: "Price per sqm", type: "currency" },
    { key: "unit_area", label: "Unit Area", type: "area" },
    { key: "number_of_bedroom", label: "Bedrooms", type: "number" },
    { key: "number_of_bathroom", label: "Bathrooms", type: "number" },
    { key: "number_of_car_parking", label: "Parking", type: "number" },
    { key: "have_freehold", label: "Freehold", type: "boolean" },
    { key: "have_leasehold", label: "Leasehold", type: "boolean" },
    { key: "construction_year", label: "Completion Date", type: "text" },
    { key: "quota", label: "Quota", type: "text" },
    { key: "distance_from_location_to_BTS_or_MRT", label: "BTS/MRT Access", type: "distance" },
    { key: "distance_from_location_to_ARL", label: "ARL Access", type: "distance" },
    { key: "furnishing", label: "Furnishing", type: "text" },
    { key: "have_tenant_occupied", label: "Tenant Occupied", type: "boolean" },
    { key: "have_owner_occupied", label: "Owner Occupied", type: "boolean" },
    { key: "have_duplex", label: "Duplex", type: "boolean" },
    { key: "have_pets_allowed", label: "Pet Friendly", type: "boolean" },
    { key: "number_of_balcony", label: "Balcony", type: "number" },
    { key: "have_bathtub", label: "Bathtubs", type: "boolean" },
    { key: "view", label: "Primary View", type: "text" },
    { key: "have_infinity_pool", label: "Infinity Pool", type: "boolean" },
    { key: "have_fitness_area", label: "Gym", type: "boolean" },
    { key: "have_sky_lounge", label: "Sky Lounge", type: "boolean" },
    { key: "details_link", label: "Details", type: "link" },
    { key: "interior_view", label: "Interior View", type: "iframe" },
    { key: "facility_view", label: "Facilities View", type: "iframe" },
    { key: "location_view", label: "Location View", type: "iframe" },
    { key: "ariel_view", label: "Aerial View", type: "video" },
  ];

  // Utility Functions
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    if (typeof window.formatBalance === "function") {
      return `฿ ${window.formatBalance(Math.floor(value))}`;
    }
    return `฿ ${Math.floor(value).toLocaleString()}`;
  };

  const formatBoolean = (value) => {
    if (value) {
      return `<span class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
        <i class="bi bi-check-circle-fill"></i>Yes
      </span>`;
    }
    return `<span class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <i class="bi bi-x-circle text-muted-foreground/60"></i>No
    </span>`;
  };

  const formatValue = (property, field) => {
    const value = property[field.key];
    
      switch (field.type) {
      case "currency":
        return formatCurrency(value);
        case "boolean":
        return formatBoolean(value);
      case "area":
        return value ? `${value} sqm` : "—";
      case "distance":
        return value ? `${value} km` : "—";
      case "number":
        return value !== null && value !== undefined ? value : "—";
        case "link":
        return `<a href="/property/details/${property.id}/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:text-brand-purple/80 transition">
                       View details
                       <i class="bi bi-box-arrow-up-right text-xs"></i>
                     </a>`;
        case "iframe":
        if (!value) {
          return `<span class="text-xs text-muted-foreground">—</span>`;
        }
        try {
          new URL(value); // Validate URL
          // For comparison table, show link instead of iframe to save space
          return `<a href="${value}" target="_blank" rel="noopener noreferrer" class="text-xs text-brand-purple hover:underline">View ${field.label}</a>`;
        } catch {
          return `<span class="text-xs text-muted-foreground">—</span>`;
        }
      case "video":
        if (!value) {
          return `<span class="text-xs text-muted-foreground">—</span>`;
        }
        // For comparison table, show link instead of video player to save space
        return `<a href="${value}" target="_blank" rel="noopener noreferrer" class="text-xs text-brand-purple hover:underline">View Video</a>`;
      default:
        return value !== null && value !== undefined && value !== "" ? String(value) : "—";
    }
  };

  // Render Functions - Using table structure for proper alignment
  const renderDesktopTable = () => {
    if (!elements.tableDesktop || !elements.tableBody) return;
    
    // Clear existing content
    const thead = elements.tableDesktop.querySelector('thead tr');
    const existingHeaders = thead.querySelectorAll('th:not(:first-child)');
    existingHeaders.forEach(th => th.remove());
    elements.tableBody.innerHTML = '';
    
    // Add property headers
    state.properties.forEach((property) => {
      const propertyData = property?.property_info || property || {};
      const th = document.createElement('th');
      th.className = 'bg-card border-r border-border last:border-r-0 p-3 text-left align-top';
      th.innerHTML = renderPropertyHeader(propertyData);
      thead.appendChild(th);
    });
    
    // Add field rows
    FIELD_CONFIG.forEach(field => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-border/50 last:border-0';
      
      // Field label cell
      const labelCell = document.createElement('td');
      labelCell.className = 'sticky left-0 z-10 bg-card border-r border-border p-2 align-middle';
      labelCell.style.width = '200px';
      labelCell.innerHTML = `<span class="text-xs font-medium text-muted-foreground">${field.label}</span>`;
      tr.appendChild(labelCell);
      
      // Property value cells
      state.properties.forEach((property) => {
        const propertyData = property?.property_info || property || {};
        const value = formatValue(propertyData, field);
        const valueCell = document.createElement('td');
        valueCell.className = 'border-r border-border/50 last:border-r-0 p-2 align-middle';
        valueCell.innerHTML = `<div class="text-xs text-foreground leading-snug">${value}</div>`;
        tr.appendChild(valueCell);
      });
      
      elements.tableBody.appendChild(tr);
    });
    
    // Initialize videos
    initializeVideos();
  };

  const renderPropertyHeader = (propertyData) => {
    const buildingLink = propertyData.building_id
      ? `/building/details/${propertyData.building_id}/`
      : "#";

    return `
      <div class="space-y-2">
        <div class="relative">
          <div class="relative h-20 w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img 
              src="${propertyData.default_image || '/static/media/placeholder.png'}" 
              alt="${propertyData.title || 'Property'}" 
              class="h-full w-full object-cover"
              loading="lazy"
              onerror="this.src='/static/media/placeholder.png'"
            />
            <button 
              class="remove-property absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full border border-border bg-white/90 backdrop-blur-sm text-foreground transition hover:bg-white hover:text-destructive"
              data-property-id="${propertyData.id}"
              aria-label="Remove from comparison"
            >
              <i class="bi bi-x-lg text-xs"></i>
            </button>
          </div>
        </div>
        <h3 class="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
          <a href="${buildingLink}" class="hover:text-brand-purple transition">
            ${propertyData.building_title || propertyData.title || 'Untitled Property'}
          </a>
        </h3>
        <p class="text-base font-bold text-brand-purple">
          ${formatCurrency(propertyData.price)}
        </p>
        <a 
          href="/property/details/${propertyData.id}/" 
          class="inline-flex items-center gap-1 text-xs font-medium text-brand-purple hover:text-brand-purple/80 transition"
        >
          View details
          <i class="bi bi-arrow-right text-[10px]"></i>
        </a>
      </div>
    `;
  };

  const renderPropertyColumn = (property, index) => {
    const propertyData = property?.property_info || property || {};

    const headerHtml = renderPropertyHeader(propertyData);
    const fieldsHtml = FIELD_CONFIG.map(field => {
      const value = formatValue(propertyData, field);
      return `
        <div class="py-1.5 border-b border-border/50 last:border-0 h-[28px] flex items-center">
          <div class="text-xs text-foreground leading-snug w-full line-clamp-1">${value}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="p-3 border-r border-border last:border-r-0">
        <div class="space-y-0">
          ${headerHtml}
          ${fieldsHtml}
        </div>
      </div>
    `;
  };


  const renderMobileSlider = () => {
    if (!elements.listMobile) return;
    
    elements.listMobile.innerHTML = state.properties.map((property, index) => `
      <li class="splide__slide">
        ${renderPropertyColumn(property, index)}
      </li>
    `).join('');
    
    // Initialize Splide if not already initialized
    if (state.splide) {
      state.splide.destroy();
    }
    
    if (elements.sliderMobile && state.properties.length > 0) {
      state.splide = new Splide(elements.sliderMobile, {
        perPage: 1,
        gap: '1.5rem',
        pagination: true,
        arrows: state.properties.length > 1,
        breakpoints: {
          640: {
            perPage: 1,
          },
        },
      });
      state.splide.mount();
    }
    
    // Initialize videos
    initializeVideos();
  };

  const initializeVideos = () => {
    // Initialize video.js players
    requestAnimationFrame(() => {
      if (typeof window.videojs !== "undefined") {
        document.querySelectorAll('video.video-js').forEach(video => {
          if (!video.dataset.initialized) {
            try {
              window.videojs(video.id);
              video.dataset.initialized = 'true';
      } catch (error) {
              console.warn('Failed to initialize video player:', error);
            }
          }
        });
      }
    });
  };

  const updateUI = () => {
    const count = state.properties.length;
    
    // Update header count
    if (elements.countHeader) {
      elements.countHeader.textContent = count;
    }
    
    // Show/hide clear all button
    if (elements.clearAllBtn) {
      elements.clearAllBtn.classList.toggle('hidden', count === 0);
    }
    
    // Show/hide sections
    if (elements.loading) elements.loading.classList.add('hidden');
    
    if (count === 0) {
      if (elements.container) elements.container.classList.add('hidden');
      if (elements.empty) {
        elements.empty.classList.remove('hidden');
        // Ensure empty state is visible
        elements.empty.style.display = '';
      }
    } else {
      if (elements.container) elements.container.classList.remove('hidden');
      if (elements.empty) {
        elements.empty.classList.add('hidden');
        elements.empty.style.display = 'none';
      }
      
      // Render based on screen size
      if (window.innerWidth >= 1024) {
        renderDesktopTable();
      } else {
        renderMobileSlider();
      }
    }
  };

  // API Functions
  const fetchComparisonList = async () => {
    if (state.loading) return;
    state.loading = true;

    // Show loading state
    if (elements.loading) elements.loading.classList.remove('hidden');
    if (elements.container) elements.container.classList.add('hidden');
    if (elements.empty) elements.empty.classList.add('hidden');

    try {
      // Fetch all properties (request more than max to get all at once)
      const params = new URLSearchParams({ page_size: 10 });
      const response = await fetch(`${CONFIG.apiUrl}?${params.toString()}`, {
        headers: { "X-CSRFToken": csrf },
        credentials: "same-origin",
      });
      
      if (!response.ok) {
        // Handle 403/401 - user not authenticated (just show empty state, don't require login)
        if (response.status === 403 || response.status === 401) {
          state.properties = [];
          // Hide loading, show empty state (generic message, not sign-in required)
          if (elements.loading) elements.loading.classList.add('hidden');
          if (elements.container) elements.container.classList.add('hidden');
          // Show empty state - page is accessible to all, but adding properties requires auth
          state.loading = false;
          updateUI(); // This will show the default empty state
          return;
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      let allResults = [...(data?.results || [])];
      
      // Fetch remaining pages if paginated
      let nextPage = data?.next || null;
      while (nextPage && allResults.length < CONFIG.maxProperties) {
        const nextParams = new URLSearchParams({ page_size: 10, page: nextPage });
        const nextResponse = await fetch(`${CONFIG.apiUrl}?${nextParams.toString()}`, {
          headers: { "X-CSRFToken": csrf },
          credentials: "same-origin",
        });
        
        if (nextResponse.ok) {
          const nextData = await nextResponse.json();
          allResults = [...allResults, ...(nextData?.results || [])];
          nextPage = nextData?.next || null;
        } else {
          break;
        }
      }
      
      // Limit to max properties
      state.properties = allResults.slice(0, CONFIG.maxProperties);
      updateUI();
      
    } catch (error) {
      console.error("Failed to fetch comparison list:", error);
      // Show error state
      if (elements.empty) {
        elements.empty.innerHTML = `
          <div class="mx-auto max-w-md space-y-4 text-center">
            <div class="mx-auto size-16 flex items-center justify-center rounded-full bg-destructive/10">
              <i class="bi bi-exclamation-triangle text-3xl text-destructive"></i>
              </div>
              <div class="space-y-2">
              <h3 class="text-lg font-semibold text-foreground">Error loading comparison</h3>
              <p class="text-sm text-muted-foreground">${error.message || 'Something went wrong. Please try again.'}</p>
            </div>
            <button onclick="window.location.reload()" class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              <i class="bi bi-arrow-clockwise"></i>
              Reload page
            </button>
          </div>
        `;
        elements.empty.classList.remove('hidden');
      }
    } finally {
      state.loading = false;
    }
  };

  const removeProperty = async (propertyId) => {
    if (!propertyId) return;
    
    try {
      const body = new URLSearchParams({ property: propertyId });
      const response = await fetch(CONFIG.removeUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": csrf,
        },
        credentials: "same-origin",
        body,
      });
      
      if (!response.ok) throw new Error("Removal failed");

      // Emit event for comparison manager
      window.dispatchEvent(
        new CustomEvent("compare:removed", { detail: { propertyId } })
      );

      // Refresh list
      await fetchComparisonList();
      
    } catch (error) {
      console.error("Failed to remove property from comparison:", error);
      alert("Failed to remove property. Please try again.");
    }
  };

  const clearAll = async () => {
    if (state.properties.length === 0) return;
    if (!confirm(`Remove all ${state.properties.length} properties from comparison?`)) return;
    
    try {
      // Remove all properties
      await Promise.all(
        state.properties.map(prop => {
          const propertyId = prop?.property_info?.id || prop?.id;
          return propertyId ? removeProperty(propertyId) : Promise.resolve();
        })
      );
      
      // Refresh list
      await fetchComparisonList();
      
    } catch (error) {
      console.error("Failed to clear comparison:", error);
      alert("Failed to clear comparison. Please try again.");
    }
  };

  // Event Handlers
  const handleRemoveClick = (event) => {
    const button = event.target.closest('.remove-property');
    if (!button) return;
    
    const propertyId = button.dataset.propertyId;
    if (propertyId) {
      removeProperty(propertyId);
    }
  };

  const handleResize = () => {
    // Re-render on resize to switch between desktop/mobile views
    if (state.properties.length > 0) {
      updateUI();
    }
  };

  // Initialize
  const init = () => {
    // Check if required elements exist
    if (!elements.main) {
      console.warn("Comparison page elements not found");
      return;
    }
    
    // Attach event listeners
    document.addEventListener('click', handleRemoveClick);
    if (elements.clearAllBtn) {
      elements.clearAllBtn.addEventListener('click', clearAll);
    }
    window.addEventListener('resize', handleResize);
    
    // Listen for comparison events
    window.addEventListener('compare:added', fetchComparisonList);
    window.addEventListener('compare:removed', fetchComparisonList);
    
    // Fetch initial data
  fetchComparisonList();
  };

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
