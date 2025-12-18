/**
 * Analytics Modal JavaScript
 * Handles the display and interaction of advertisement analytics modal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    /** @type {HTMLElement} */
    const modal = (/** @type {any} */ (document.getElementById('analyticsModal')));
    const closeBtn = document.querySelector('.analytics-close');
    /** @type {HTMLElement} */
    const loadingDiv = (/** @type {any} */ (document.querySelector('.analytics-loading')));
    /** @type {HTMLElement} */
    const contentDiv = (/** @type {any} */ (document.querySelector('.analytics-content')));
    /** @type {HTMLElement} */
    const errorDiv = (/** @type {any} */ (document.querySelector('.analytics-error')));

    // Function to show modal
    function showModal() {
        if (modal) modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Function to hide modal
    function hideModal() {
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        resetModalState();
    }

    // Function to reset modal state
    function resetModalState() {
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (contentDiv) contentDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    // Function to show loading state
    function showLoading() {
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (contentDiv) contentDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    // Function to show content
    function showContent() {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    // Function to show error
    function showError() {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
    }

    // Function to populate analytics data
    function populateAnalyticsData(data) {
        // Basic statistics
        document.getElementById('property-title').textContent = data.property_title;
        document.getElementById('ad-clicks').textContent = data.number_of_clicked;
        document.getElementById('view-time').textContent = data.formatted_view_time;
        document.getElementById('conversion-rate').textContent = data.conversion_rate;

        // Demographics
        document.getElementById('male-visitors').textContent = data.addemography.male_visitors;
        document.getElementById('female-visitors').textContent = data.addemography.female_visitors;

        // Location analytics
        const locationTableBody = document.getElementById('location-data');
        locationTableBody.innerHTML = '';

        if (data.adviewerlocation && data.adviewerlocation.length > 0) {
            data.adviewerlocation.forEach(function(location) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${location.address || 'Unknown Location'}</td>
                    <td>${location.view_from_this_location}</td>
                `;
                locationTableBody.appendChild(row);
            });
        } else {
            locationTableBody.innerHTML = '<tr><td colspan="2" class="no-data">No location data available</td></tr>';
        }
    }

    // Function to fetch analytics data
    function fetchAnalyticsData(adId) {
        showLoading();
        
        // Get the current URL and construct the analytics data URL
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('/admin/')[0];
        const analyticsUrl = `${baseUrl}/admin/advertise/advertisement/analytics-data/${adId}/`;

        fetch(analyticsUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            populateAnalyticsData(data);
            showContent();
        })
        .catch(error => {
            console.error('Error fetching analytics data:', error);
            showError();
        });
    }

    // Event listener for analytics buttons
    document.addEventListener('click', function(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        if (target && target.classList.contains('analytics-btn')) {
            e.preventDefault();
            const adId = target.getAttribute('data-ad-id');
            if (adId) {
                showModal();
                fetchAnalyticsData(adId);
            }
        }
    });

    // Event listener for close button
    if (closeBtn) {
        closeBtn.addEventListener('click', hideModal);
    }

    // Event listener for clicking outside modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Event listener for escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            hideModal();
        }
    });
});