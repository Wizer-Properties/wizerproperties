$(document).ready(function(){
    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    
    const adId = getUrlParameter('ad_id');
    
    if (adId) {
        let startTime;
        
        // Record the time when the user loads the page
        window.onload = function() {
            startTime = new Date().getTime();
        };

        // Send the time spent on the page to the server when the user leaves
        window.onbeforeunload = function() {
            const endTime = new Date().getTime();
            const timeSpent = endTime - startTime;
            console.log("timeSpent", timeSpent)
    
            // Send the data to the server using fetch
            fetch(`/advertise/api/advertisement/${adId}/manage-view-time/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: JSON.stringify({
                    time_spent: timeSpent
                })
            });
        };
    };
});
