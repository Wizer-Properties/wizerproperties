// Simple time tracking implementation (fallback if TimeMe is not available)
var SimpleTimeTracker = {
    startTime: null,
    isActive: false,
    idleTimeout: null,
    idleTimeoutDuration: 120000, // 120 seconds in milliseconds
    
    initialize: function(config) {
        this.idleTimeoutDuration = (config.idleTimeoutInSeconds || 120) * 1000;
        this.startTime = Date.now();
        this.isActive = true;
        this.resetIdleTimer();
        
        // Reset idle timer on user activity
        var self = this;
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(event) {
            document.addEventListener(event, function() {
                if (!self.isActive) {
                    self.startTime = Date.now();
                    self.isActive = true;
                }
                self.resetIdleTimer();
            }, true);
        });
    },
    
    resetIdleTimer: function() {
        var self = this;
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }
        this.idleTimeout = setTimeout(function() {
            self.isActive = false;
        }, this.idleTimeoutDuration);
    },
    
    getTimeOnCurrentPageInSeconds: function() {
        if (!this.startTime) return 0;
        var endTime = Date.now();
        var timeSpent = (endTime - this.startTime) / 1000; // Convert to seconds
        return Math.round(timeSpent);
    }
};

$(document).ready(function(){
    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Use TimeMe if available, otherwise use fallback
    var timeTracker;
    if (typeof TimeMe !== 'undefined') {
        console.log('Using TimeMe library for time tracking');
        timeTracker = TimeMe;
    TimeMe.initialize({
            idleTimeoutInSeconds: 120
        });
    } else {
        console.log('Using SimpleTimeTracker fallback for time tracking');
        timeTracker = SimpleTimeTracker;
        SimpleTimeTracker.initialize({
            idleTimeoutInSeconds: 120
        });
    }

    // Collect URLs to track
    var trackingUrls = [];

    // Managing property view-time
    if (typeof property_view_time_url !== 'undefined' && property_view_time_url) {
        // Managing discount property view-time
        const discounted = getUrlParameter('discounted');
        const featured = getUrlParameter('featured');

        if (discounted) {
            property_view_time_url = property_view_time_url + '?discounted=True'
        } else if (featured) {
            property_view_time_url = property_view_time_url + '?featured=True'
        }
        // Add property tracking
        trackingUrls.push({
            url: property_view_time_url,
            method: 'PATCH',
            type: 'property'
        });
    }

    // Managing ad view-time
    const adId = getUrlParameter('ad_id');
    if (adId) {
        trackingUrls.push({
            url: `/advertise/api/advertisement/${adId}/manage-view-time/`,
            method: 'PATCH',
            type: 'ad'
        });
    }

    // Send time spent data for all tracked URLs when user leaves
    if (trackingUrls.length > 0) {
        window.addEventListener('beforeunload', function(event) {
            try {
                let timeSpentOnPage = timeTracker.getTimeOnCurrentPageInSeconds();
            
                console.log("Time spent on page:", timeSpentOnPage, "seconds");
            
                // Only send if time spent is greater than 0
                if (timeSpentOnPage > 0) {
            // Send requests for all tracked URLs
            trackingUrls.forEach(function(tracking) {
                const payload = {
                    time_spent: timeSpentOnPage,
                    csrfmiddlewaretoken: CSRF_TOKEN
                };

                // Use fetch with keepalive option
                fetch(tracking.url, {
                    method: tracking.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': CSRF_TOKEN
                    },
                    body: JSON.stringify(payload),
                    keepalive: true // Ensure the request can complete during page unload
                }).catch((error) => {
                    console.error('Error sending time spent to ' + tracking.type + ':', error);
                });
            });
                }
            } catch (error) {
                console.error('Error in beforeunload handler:', error);
            }
        });
    } else {
        console.log("No tracking URLs found. View time tracking is inactive.");
    }
});
