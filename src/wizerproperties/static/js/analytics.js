/**
 * Centralized Analytics Tracking Module
 * Handles Google Analytics 4, Meta Pixel, and PostHog event tracking
 * 
 * Usage:
 *   Analytics.track('event_name', { property: 'value' });
 *   Analytics.trackPageView('/page-path', 'Page Title');
 *   Analytics.trackPropertyView(propertyId, propertyData);
 */

(function(window) {
  'use strict';

  const Analytics = {
    // Configuration - will be set from Django template
    config: {
      ga4Id: null,
      metaPixelId: null,
      posthogKey: null,
      posthogHost: null,
      enabled: true
    },

    /**
     * Initialize analytics platforms
     */
    init: function(config) {
      if (!config) return;
      
      this.config = { ...this.config, ...config };
      
      // Initialize Google Analytics 4 (already loaded via gtag.js)
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('config', this.config.ga4Id, {
          page_path: window.location.pathname,
          page_title: document.title
        });
      }

      // Initialize Meta Pixel
      if (this.config.metaPixelId) {
        this.initMetaPixel();
      }

      // Initialize PostHog
      if (this.config.posthogKey && this.config.posthogHost) {
        this.initPostHog();
      }

      // Track initial page view
      this.trackPageView(window.location.pathname, document.title);
    },

    /**
     * Initialize Meta Pixel
     */
    initMetaPixel: function() {
      if (typeof fbq !== 'undefined') return; // Already initialized

      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', this.config.metaPixelId);
      fbq('track', 'PageView');
    },

    /**
     * Initialize PostHog
     */
    initPostHog: function() {
      if (typeof posthog !== 'undefined' && posthog.__loaded) return; // Already initialized

      // Use PostHog's official initialization snippet
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Rr Mr fi Cr Ar ci Tr Fr capture Mi calculateEventProperties Lr register register_once register_for_session unregister unregister_for_session Hr getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Ur jr createPersonProfile zr kr Br opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Dr debug M Nr getPageViewId captureTraceFeedback captureTraceMetric $r".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

      posthog.init(this.config.posthogKey, {
        api_host: this.config.posthogHost,
        defaults: '2025-05-24',
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        autocapture: true,
        capture_pageview: false, // We'll track manually
        capture_pageleave: true
      });
    },

    /**
     * Track a custom event across all platforms
     */
    track: function(eventName, properties = {}) {
      if (!this.config.enabled) return;

      // Google Analytics 4
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
      }

      // Meta Pixel
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        // Map custom events to Meta Pixel standard events where applicable
        const metaEvent = this.mapToMetaEvent(eventName);
        if (metaEvent) {
          fbq('track', metaEvent, properties);
        } else {
          fbq('trackCustom', eventName, properties);
        }
      }

      // PostHog
      if (this.config.posthogKey && typeof posthog !== 'undefined') {
        posthog.capture(eventName, properties);
      }
    },

    /**
     * Track page view
     */
    trackPageView: function(path, title) {
      if (!this.config.enabled) return;

      // Google Analytics 4
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('config', this.config.ga4Id, {
          page_path: path,
          page_title: title
        });
      }

      // Meta Pixel (already tracks PageView on init)
      // Additional page views can be tracked if needed
      if (this.config.metaPixelId && typeof fbq !== 'undefined' && path !== window.location.pathname) {
        fbq('track', 'PageView');
      }

      // PostHog
      if (this.config.posthogKey && typeof posthog !== 'undefined') {
        posthog.capture('$pageview', {
          $current_url: window.location.href,
          pathname: path
        });
      }
    },

    /**
     * Map custom events to Meta Pixel standard events
     */
    mapToMetaEvent: function(eventName) {
      const eventMap = {
        'property_view': 'ViewContent',
        'property_favorite': 'AddToWishlist',
        'property_compare': 'AddToCart', // Using AddToCart as closest match
        'property_contact': 'Lead',
        'property_schedule': 'Schedule',
        'user_signup': 'CompleteRegistration',
        'user_login': 'Login',
        'property_search': 'Search',
        'form_submit': 'Lead',
        'video_play': 'ViewContent'
      };
      return eventMap[eventName] || null;
    },

    /**
     * Track property view (ecommerce event)
     */
    trackPropertyView: function(propertyId, propertyData = {}) {
      const eventData = {
        content_type: 'product',
        content_ids: [propertyId],
        content_name: propertyData.name || propertyData.title || 'Property',
        value: propertyData.price || 0,
        currency: 'THB',
        ...propertyData
      };

      this.track('property_view', eventData);

      // GA4 ecommerce tracking
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
          currency: 'THB',
          value: propertyData.price || 0,
          items: [{
            item_id: propertyId,
            item_name: propertyData.name || propertyData.title,
            item_category: propertyData.category || 'Property',
            price: propertyData.price || 0,
            quantity: 1
          }]
        });
      }

      // Meta Pixel ViewContent
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
          content_name: propertyData.name || propertyData.title,
          content_ids: [propertyId],
          content_type: 'product',
          value: propertyData.price || 0,
          currency: 'THB'
        });
      }
    },

    /**
     * Track property favorite
     */
    trackPropertyFavorite: function(propertyId, propertyData = {}, isFavorite = true) {
      const eventName = isFavorite ? 'property_favorite' : 'property_unfavorite';
      const eventData = {
        content_type: 'product',
        content_ids: [propertyId],
        content_name: propertyData.name || propertyData.title || 'Property',
        value: propertyData.price || 0,
        currency: 'THB'
      };

      this.track(eventName, eventData);

      // Meta Pixel AddToWishlist
      if (this.config.metaPixelId && typeof fbq !== 'undefined' && isFavorite) {
        fbq('track', 'AddToWishlist', {
          content_name: propertyData.name || propertyData.title,
          content_ids: [propertyId],
          content_type: 'product',
          value: propertyData.price || 0,
          currency: 'THB'
        });
      }
    },

    /**
     * Track property comparison
     */
    trackPropertyCompare: function(propertyId, propertyData = {}, isAdded = true) {
      const eventName = isAdded ? 'property_compare' : 'property_uncompare';
      const eventData = {
        content_type: 'product',
        content_ids: [propertyId],
        content_name: propertyData.name || propertyData.title || 'Property',
        value: propertyData.price || 0,
        currency: 'THB'
      };

      this.track(eventName, eventData);
    },

    /**
     * Track property contact/schedule
     */
    trackPropertyContact: function(propertyId, propertyData = {}, contactType = 'contact') {
      const eventData = {
        content_type: 'product',
        content_ids: [propertyId],
        content_name: propertyData.name || propertyData.title || 'Property',
        value: propertyData.price || 0,
        currency: 'THB',
        contact_type: contactType
      };

      this.track('property_contact', eventData);

      // Meta Pixel Lead
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: propertyData.name || propertyData.title,
          content_ids: [propertyId],
          value: propertyData.price || 0,
          currency: 'THB'
        });
      }

      // GA4 conversion
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
          currency: 'THB',
          value: propertyData.price || 0
        });
      }
    },

    /**
     * Track search
     */
    trackSearch: function(searchTerm, filters = {}, resultCount = 0) {
      const eventData = {
        search_term: searchTerm,
        filters: filters,
        result_count: resultCount
      };

      this.track('property_search', eventData);

      // GA4 search tracking
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('event', 'search', {
          search_term: searchTerm
        });
      }
    },

    /**
     * Track user signup
     */
    trackSignup: function(userType = 'prospect', method = 'email') {
      const eventData = {
        user_type: userType,
        signup_method: method
      };

      this.track('user_signup', eventData);

      // Meta Pixel CompleteRegistration
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        fbq('track', 'CompleteRegistration', {
          content_name: 'User Registration',
          status: true
        });
      }
    },

    /**
     * Track user login
     */
    trackLogin: function(userType = 'prospect', method = 'email') {
      const eventData = {
        user_type: userType,
        login_method: method
      };

      this.track('user_login', eventData);

      // Meta Pixel Login
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        fbq('track', 'Login');
      }
    },

    /**
     * Track form submission
     */
    trackFormSubmit: function(formName, formData = {}) {
      const eventData = {
        form_name: formName,
        ...formData
      };

      this.track('form_submit', eventData);

      // Meta Pixel Lead
      if (this.config.metaPixelId && typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: formName
        });
      }
    },

    /**
     * Track video play
     */
    trackVideoPlay: function(videoId, videoTitle = '') {
      const eventData = {
        video_id: videoId,
        video_title: videoTitle
      };

      this.track('video_play', eventData);
    },

    /**
     * Set user properties (for authenticated users)
     */
    setUserProperties: function(userId, properties = {}) {
      // PostHog identify
      if (this.config.posthogKey && typeof posthog !== 'undefined') {
        posthog.identify(userId, properties);
      }

      // GA4 user properties
      if (this.config.ga4Id && typeof gtag !== 'undefined') {
        gtag('set', 'user_properties', properties);
      }
    },

    /**
     * Reset user (on logout)
     */
    resetUser: function() {
      // PostHog reset
      if (this.config.posthogKey && typeof posthog !== 'undefined') {
        posthog.reset();
      }
    }
  };

  // Expose to window
  window.Analytics = Analytics;

})(window);

