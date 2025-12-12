"use strict";

/**
 * Map Manager for Property Search
 * Handles map markers, bounds-based searching, and map interactions
 */
(function () {
  class MapManager {
    constructor() {
      this.map = null;
      this.markers = [];
      this.infoWindow = null;
      this.boundsListener = null;
      this.isUpdatingFromSearch = false;
      this.lastBounds = null;
      this.debounceTimeout = null;
      this.markerClusterer = null;
      
      // Configuration
      this.config = {
        debounceDelay: 500, // ms to wait after map movement before searching
        minZoomForSearch: 10, // Minimum zoom level to trigger search
        defaultCenter: { lat: 13.7563309, lng: 100.5017651 },
        defaultZoom: 12,
      };
    }

    /**
     * Initialize the map
     * @param {HTMLElement} container - Map container element
     * @param {Object} options - Map options
     */
    async init(container, options = {}) {
      if (!container) {
        console.warn("MapManager: Container element not found");
        return;
      }

      const center = options.center || this.config.defaultCenter;
      const zoom = options.zoom || this.config.defaultZoom;
      const mapType = options.mapType || "terrain";

      // Initialize map
      this.map = new google.maps.Map(container, {
        center: center,
        zoom: zoom,
        mapTypeId: mapType,
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      });

      // Initialize info window
      this.infoWindow = new google.maps.InfoWindow();

      // Set up map event listeners
      this.setupMapListeners();

      return this.map;
    }

    /**
     * Set up map event listeners for bounds changes
     */
    setupMapListeners() {
      if (!this.map) return;

      // Debounced bounds change handler
      const handleBoundsChange = () => {
        if (this.isUpdatingFromSearch) return;
        
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          const currentZoom = this.map.getZoom();
          if (currentZoom >= this.config.minZoomForSearch) {
            const bounds = this.map.getBounds();
            if (bounds) {
              this.onBoundsChanged(bounds);
            }
          }
        }, this.config.debounceDelay);
      };

      // Listen to bounds changes (idle event fires after pan/zoom completes)
      this.boundsListener = this.map.addListener("idle", handleBoundsChange);
    }

    /**
     * Handle bounds changed event
     * @param {google.maps.LatLngBounds} bounds - Map bounds
     */
    onBoundsChanged(bounds) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const newBounds = {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };

      // Only trigger if bounds actually changed significantly
      if (this.shouldTriggerSearch(newBounds)) {
        this.lastBounds = newBounds;
        
        // Dispatch custom event for search manager to handle
        document.dispatchEvent(new CustomEvent("mapBounds:changed", {
          detail: { bounds: newBounds }
        }));
      }
    }

    /**
     * Check if bounds changed enough to trigger a new search
     * @param {Object} newBounds - New bounds object
     * @returns {boolean}
     */
    shouldTriggerSearch(newBounds) {
      if (!this.lastBounds) return true;
      
      // Calculate if bounds changed significantly (more than 10% difference)
      const latDiff = Math.abs(newBounds.north - newBounds.south);
      const lngDiff = Math.abs(newBounds.east - newBounds.west);
      const oldLatDiff = Math.abs(this.lastBounds.north - this.lastBounds.south);
      const oldLngDiff = Math.abs(this.lastBounds.east - this.lastBounds.west);
      
      // Guard against division by zero
      if (oldLatDiff === 0 || oldLngDiff === 0) return true;
      
      const latChange = Math.abs(latDiff - oldLatDiff) / oldLatDiff;
      const lngChange = Math.abs(lngDiff - oldLngDiff) / oldLngDiff;
      
      return latChange > 0.1 || lngChange > 0.1 ||
             Math.abs(newBounds.north - this.lastBounds.north) > latDiff * 0.1 ||
             Math.abs(newBounds.south - this.lastBounds.south) > latDiff * 0.1 ||
             Math.abs(newBounds.east - this.lastBounds.east) > lngDiff * 0.1 ||
             Math.abs(newBounds.west - this.lastBounds.west) > lngDiff * 0.1;
    }

    /**
     * Clear all markers from the map
     */
    clearMarkers() {
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
      
      if (this.markerClusterer) {
        this.markerClusterer.clearMarkers();
      }
    }

    /**
     * Add property markers to the map
     * @param {Array} properties - Array of property objects with latitude/longitude
     */
    addPropertyMarkers(properties) {
      if (!this.map) {
        console.warn("MapManager: Cannot add markers - map not initialized");
        return;
      }

      // Clear existing markers
      this.clearMarkers();

      // Debug: Log all properties received
      console.log(`MapManager: Received ${properties.length} properties`);

      // Filter properties with valid coordinates
      const validProperties = properties.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(parseFloat(p.latitude)) && 
        !isNaN(parseFloat(p.longitude))
      );

      // Debug: Log filtering results
      console.log(`MapManager: ${validProperties.length} properties have valid coordinates`);
      if (validProperties.length === 0) {
        console.warn("MapManager: No properties with valid coordinates. Sample property:", properties[0] || "No properties");
        return;
      }

      // Create markers for each property
      let markersCreated = 0;
      validProperties.forEach(property => {
        const marker = this.createPropertyMarker(property);
        if (marker) {
          this.markers.push(marker);
          markersCreated++;
        } else {
          console.warn("MapManager: Failed to create marker for property:", property.id, property.building_title);
        }
      });

      console.log(`MapManager: Created ${markersCreated} markers`);

      // Fit map bounds to show all markers
      if (this.markers.length > 0) {
        this.fitBoundsToMarkers();
      } else {
        console.warn("MapManager: No markers were created");
      }
    }

    /**
     * Create a marker for a property
     * @param {Object} property - Property object
     * @returns {google.maps.Marker}
     */
    createPropertyMarker(property) {
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`MapManager: Invalid coordinates for property ${property.id}: lat=${property.latitude}, lng=${property.longitude}`);
        return null;
      }

      const position = { lat, lng };

      // Custom marker icon based on property tag
      // Brand purple: #7f1377
      let icon = null;
      if (property.tag === "spotlight") {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };
      } else if (property.tag === "feature") {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#7f1377", // Brand purple
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };
      } else {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12, // Increased from 8 to 12 for better visibility
          fillColor: "#7f1377", // Brand purple instead of blue
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };
      }

      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: icon,
        title: property.building_title || property.title || "Property",
        property: property, // Store property data on marker
      });

      // Add click listener to show info window
      marker.addListener("click", () => {
        this.showPropertyInfo(property, marker);
      });

      return marker;
    }

    /**
     * Show property info in info window
     * @param {Object} property - Property object
     * @param {google.maps.Marker} marker - Marker that was clicked
     */
    showPropertyInfo(property, marker) {
      const price = property.price 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(property.price)
        : "Price on request";
      
      const pricePerSqm = property.price_per_sqm 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(property.price_per_sqm)
        : null;
      
      const beds = property.number_of_bedroom || "—";
      const baths = property.number_of_bathroom || "—";
      const area = property.unit_area ? `${property.unit_area} sqm` : "—";
      
      // Get first image if available
      const firstImage = property.default_images && property.default_images.length > 0 
        ? property.default_images[0].file 
        : null;
      
      // Brand colors
      const brandPurple = "#7f1377";
      const brandTeal = "#15c1b9";
      const textDark = "#262637";
      const textMuted = "#53535fcc";
      const bgMuted = "#f2f3f4";
      
      const content = `
        <div style="min-width: 280px; max-width: 320px; font-family: 'Effra', sans-serif; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          ${firstImage ? `
          <!-- Image Section -->
          <div style="position: relative; width: 100%; height: 160px; overflow: hidden; background: ${bgMuted};">
            <img src="${firstImage}" alt="${this.escapeHtml(property.building_title || property.title || "Property")}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 onerror="this.style.display='none'; this.parentElement.style.background='${bgMuted}';">
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);"></div>
            
            <!-- Price Overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); line-height: 1;">
                    ${price}
                  </p>
                </div>
                ${pricePerSqm ? `
                <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.9); text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                  ${pricePerSqm} / sqm
                </p>
                ` : ''}
              </div>
            </div>
          </div>
          ` : `
          <!-- No Image - Show Price Section -->
          <div style="padding: 16px; background: ${bgMuted}; border-bottom: 1px solid rgba(83,83,95,0.2);">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandPurple}; line-height: 1;">
            ${price}
          </p>
            ${pricePerSqm ? `
            <p style="margin: 4px 0 0 0; font-size: 12px; color: ${textMuted};">
              ${pricePerSqm} / sqm
            </p>
            ` : ''}
          </div>
          `}
          
          <!-- Content Section -->
          <div style="padding: 16px; background: white;">
            <!-- Title & Location -->
            <div style="margin-bottom: 12px;">
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: ${textDark}; line-height: 1.4;">
                ${this.escapeHtml(property.building_title || property.title || "Property")}
              </h3>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: ${textMuted};">
                <span style="color: ${brandTeal}; font-size: 14px;">📍</span>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${this.escapeHtml(property.address || "Address not available")}
                </span>
              </div>
            </div>
            
            <!-- Stats Section -->
            <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 12px 0; border-top: 1px solid rgba(83,83,95,0.1); border-bottom: 1px solid rgba(83,83,95,0.1); margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: ${textMuted};">
                <span style="color: ${brandTeal}; font-size: 14px;">🛏️</span>
                <span style="font-weight: 600; color: ${textDark};">${beds}</span>
                <span>bed</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: ${textMuted};">
                <span style="color: ${brandTeal}; font-size: 14px;">🚿</span>
                <span style="font-weight: 600; color: ${textDark};">${baths}</span>
                <span>bath</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: ${textMuted};">
                <span style="color: ${brandTeal}; font-size: 14px;">📐</span>
                <span style="font-weight: 600; color: ${textDark};">${area}</span>
              </div>
            </div>
            
            <!-- CTA Button -->
          <a href="/property/details/${property.id}/" 
               style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px 16px; background: ${brandPurple}; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(127,19,119,0.2);"
               onmouseover="this.style.background='#6d0f66'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(127,19,119,0.3)';"
               onmouseout="this.style.background='${brandPurple}'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(127,19,119,0.2)';">
            View Details
              <span style="font-size: 12px;">→</span>
          </a>
          </div>
        </div>
      `;

      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map, marker);

      // Dispatch event for analytics/tracking
      document.dispatchEvent(new CustomEvent("mapMarker:clicked", {
        detail: { propertyId: property.id }
      }));
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Fit map bounds to show all markers
     */
    fitBoundsToMarkers() {
      if (this.markers.length === 0 || !this.map) return;

      const bounds = new google.maps.LatLngBounds();
      this.markers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });

      // Don't update if we're already showing these bounds (prevent infinite loop)
      this.isUpdatingFromSearch = true;
      this.map.fitBounds(bounds);
      
      // Add padding to bounds
      const padding = 50; // pixels
      setTimeout(() => {
        this.isUpdatingFromSearch = false;
      }, 1000);
    }

    /**
     * Update map center and zoom without triggering search
     * @param {Object} center - Center coordinates {lat, lng}
     * @param {number} zoom - Zoom level
     */
    updateMapView(center, zoom) {
      if (!this.map) return;
      
      this.isUpdatingFromSearch = true;
      this.map.setCenter(center);
      if (zoom) {
        this.map.setZoom(zoom);
      }
      
      setTimeout(() => {
        this.isUpdatingFromSearch = false;
      }, 500);
    }

    /**
     * Get current map bounds
     * @returns {Object|null}
     */
    getBounds() {
      if (!this.map) return null;
      
      const bounds = this.map.getBounds();
      if (!bounds) return null;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      return {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };
    }

    /**
     * Set map bounds (used when updating from search results)
     * @param {Object} bounds - Bounds object {north, south, east, west}
     */
    setBounds(bounds) {
      if (!this.map || !bounds) return;

      this.isUpdatingFromSearch = true;
      const googleBounds = new google.maps.LatLngBounds(
        { lat: bounds.south, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east }
      );
      
      this.map.fitBounds(googleBounds);
      
      setTimeout(() => {
        this.isUpdatingFromSearch = false;
      }, 1000);
    }

    /**
     * Destroy the map manager and clean up
     */
    destroy() {
      if (this.boundsListener) {
        google.maps.event.removeListener(this.boundsListener);
      }
      this.clearMarkers();
      this.map = null;
      this.infoWindow = null;
    }
  }

  // Export globally
  window.MapManager = MapManager;
})();

