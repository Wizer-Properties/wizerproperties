$(document).ready(function(){
    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Initialize TimeMe once
    TimeMe.initialize({
        idleTimeoutInSeconds: 120, // stop recording time due to inactivity
    });

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
            let timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
            
            
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
        });
    }
});
