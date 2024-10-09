$(document).ready(function(){
    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Managing discount property view-time
    const discounted = getUrlParameter('discounted');
    const featured = getUrlParameter('featured');

    if (discounted) {
        property_view_time_url = property_view_time_url + '?discounted=True'
    } else if (featured) {
        property_view_time_url = property_view_time_url + '?featured=True'
    }
    // Managing property view time
    manageViewTime(property_view_time_url, 'PATCH')

    // Managing ad view-time
    const adId = getUrlParameter('ad_id');
    if (adId) {
        manageViewTime(`/advertise/api/advertisement/${adId}/manage-view-time/`, "PATCH")
    };

    function manageViewTime(url, request_method='POST') {
        TimeMe.initialize({
            idleTimeoutInSeconds: 120, // stop recording time due to inactivity
        });
    
        // Send the time spent on the page to the server when the user leaves
        window.addEventListener('beforeunload', function(event) {
            let timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
    
            // Create the request payload
            const payload = {
                time_spent: timeSpentOnPage,
                csrfmiddlewaretoken: CSRF_TOKEN
            };
    
            // Use fetch with keepalive option
            fetch(url, {
                method: request_method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: JSON.stringify(payload),
                keepalive: true // Ensure the request can complete during page unload
            }).catch((error) => {
                console.error('Error sending time spent:', error);
            });
        });
    };
});
