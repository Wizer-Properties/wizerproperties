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
      if (!this.map) return;

      // Clear existing markers
      this.clearMarkers();

      // Filter properties with valid coordinates
      const validProperties = properties.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(parseFloat(p.latitude)) && 
        !isNaN(parseFloat(p.longitude))
      );

      if (validProperties.length === 0) return;

      // Create markers for each property
      validProperties.forEach(property => {
        const marker = this.createPropertyMarker(property);
        if (marker) {
          this.markers.push(marker);
        }
      });

      // Fit map bounds to show all markers
      if (this.markers.length > 0) {
        this.fitBoundsToMarkers();
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

      if (isNaN(lat) || isNaN(lng)) return null;

      const position = { lat, lng };

      // Custom marker icon based on property tag
      let icon = null;
      if (property.tag === "spotlight") {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };
      } else if (property.tag === "feature") {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#810FCB",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        };
      } else {
        icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
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
      
      const beds = property.number_of_bedroom || "—";
      const baths = property.number_of_bathroom || "—";
      const area = property.unit_area ? `${property.unit_area} sqm` : "—";
      
      const content = `
        <div style="min-width: 200px; max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
            ${this.escapeHtml(property.building_title || property.title || "Property")}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
            ${this.escapeHtml(property.address || "")}
          </p>
          <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
            <div style="display: flex; gap: 16px; font-size: 12px; color: #666;">
              <span>🛏️ ${beds}</span>
              <span>🚿 ${baths}</span>
              <span>📐 ${area}</span>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #4285F4;">
            ${price}
          </p>
          <a href="/property/details/${property.id}/" 
             style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #4285F4; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
            View Details
          </a>
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

