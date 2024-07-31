$(document).ready(function(){
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
        fetch(property_view_time_url, {
            method: 'PATCH',
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
});
