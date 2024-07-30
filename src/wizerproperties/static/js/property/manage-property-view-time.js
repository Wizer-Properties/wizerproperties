$(document).ready(function(){
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
        fetch(property_view_time_url, {
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
});
