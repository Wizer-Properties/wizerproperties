// Modern Dashboard JavaScript - Updated for Tailwind CSS redesign
(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initializeDataTables();
        initializeScheduleTable();
        if (user_type === 'dev_agent') {
            initializeSharedReelsTable();
        }
    }

    // Initialize main data tables
    function initializeDataTables() {
        const tables = {
            '#building-table': 'Buildings',
            '#property-table': 'Properties',
            '#discount-property-table': 'Discount Properties',
            '#featured-property-table': 'Featured Properties'
        };

        Object.keys(tables).forEach(tableId => {
            const table = document.querySelector(tableId);
            if (!table) return;

            if (window.jQuery && window.jQuery.fn.DataTable) {
                window.jQuery(tableId).DataTable({
                    ordering: false,
                    lengthChange: false,
                    info: false,
                    dom: '<"flex items-center justify-between mb-4"<"text-lg font-semibold text-gray-900"l><"dataTables_filter">>rt<"flex items-center justify-between mt-4"<"dataTables_info"i><"dataTables_paginate"p>>',
                    language: {
                        search: '',
                        searchPlaceholder: 'Search...'
                    },
                    initComplete: function() {
                        const wrapper = this.api().table().container().closest('.overflow-x-auto');
                        const filterInput = wrapper.querySelector('.dataTables_filter input');
                        if (filterInput) {
                            filterInput.classList.add('w-full', 'max-w-xs', 'px-4', 'py-2', 'border', 'border-gray-300', 'rounded-lg', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
                        }
                    }
                });
            }
        });
    }

    // Initialize schedule table with dynamic data loading
    function initializeScheduleTable() {
        const scheduleTable = document.querySelector('#property-visit-schedule');
        if (!scheduleTable) return;

        if (!window.jQuery || !window.jQuery.fn.DataTable) {
            console.warn('jQuery DataTables not loaded');
            return;
        }

        const $scheduleTable = window.jQuery('#property-visit-schedule').DataTable({
            ordering: false,
            lengthChange: false,
            info: false,
            pageLength: 5,
            dom: '<"flex items-center justify-between mb-4"<"text-lg font-semibold text-gray-900"l><"dataTables_filter">>rt<"flex items-center justify-between mt-4"<"dataTables_info"i><"dataTables_paginate"p>>',
            language: {
                search: '',
                searchPlaceholder: 'Search schedules...'
            },
            initComplete: function() {
                const wrapper = this.api().table().container().closest('.overflow-x-auto');
                const filterInput = wrapper.querySelector('.dataTables_filter input');
                if (filterInput) {
                    filterInput.classList.add('w-full', 'max-w-xs', 'px-4', 'py-2', 'border', 'border-gray-300', 'rounded-lg', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
                }
            }
        });

        loadScheduleData($scheduleTable);
        setupScheduleEventHandlers($scheduleTable);
    }

    // Load schedule data from API
    function loadScheduleData(dataTable) {
        if (!window.jQuery) return;

        window.jQuery.ajax({
            url: '/schedule/api/',
            type: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function(data) {
                if (data && data.length > 0) {
                    data.forEach(function(schedule, index) {
                        const urlLink = schedule.content_type === 'building' 
                            ? `/building/details/${schedule.object_id}/` 
                            : `/property/details/${schedule.object_id}/`;

                        const visitingDate = new Date(schedule.visiting_time);
                        visitingDate.setHours(visitingDate.getHours() - 7);
                        const formattedDate = window.dayjs ? window.dayjs(visitingDate).format('dddd DD MMM, h:mm A (YYYY)') : visitingDate.toLocaleString();
                        
                        const now = new Date();
                        const hasVisitingTimePassed = now > visitingDate;

                        const buttonHtml = user_type === 'prospect'
                            ? generateProspectScheduleButtons(schedule, urlLink, index, hasVisitingTimePassed)
                            : generateDevAgentScheduleButtons(schedule, urlLink, index);

                        const statusBadge = getStatusBadge(schedule.status);

                        dataTable.row.add([
                            schedule.id,
                            schedule.title || '',
                            `<div class="text-sm text-gray-600">${schedule.address || ''}</div>`,
                            statusBadge,
                            `<span class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">${schedule.content_type}</span>`,
                            formattedDate,
                            buttonHtml
                        ]).draw(false);
                    });
                }
            },
            error: function(error) {
                console.error('Error loading schedule data:', error);
            }
        });
    }

    // Generate prospect schedule button HTML
    function generateProspectScheduleButtons(data, urlLink, index, hasVisitingTimePassed) {
        let buttons = '';
        
        if (data.status === 'Pending' && !hasVisitingTimePassed) {
            buttons += `<a href="/schedule/create_schedule/?type=${data.content_type}&id=${data.object_id}&edit=true&schedule-id=${data.id}" class="text-blue-600 hover:text-blue-900 mr-3">Edit</a>`;
        }
        
        if (data.status === 'Pending') {
            buttons += `<button cancel-schedule-id="${data.id}" class="text-red-600 hover:text-red-900 mr-3">Cancel</button>`;
        }
        
        buttons += `<a href="${urlLink}" class="text-gray-600 hover:text-gray-900">View</a>`;
        
        return `<div index="${index}" class="flex items-center justify-end gap-3">${buttons}</div>`;
    }

    // Generate dev/agent schedule button HTML
    function generateDevAgentScheduleButtons(data, urlLink, index) {
        let buttons = '';
        
        if (data.status === 'Pending') {
            buttons += `<button accept-schedule-id="${data.id}" class="text-green-600 hover:text-green-900 mr-3">Accept</button>`;
            buttons += `<button cancel-schedule-id="${data.id}" class="text-red-600 hover:text-red-900 mr-3">Cancel</button>`;
        }
        
        buttons += `<a href="${urlLink}" class="text-gray-600 hover:text-gray-900">View</a>`;
        
        return `<div index="${index}" class="flex items-center justify-end gap-3">${buttons}</div>`;
    }

    // Get status badge HTML
    function getStatusBadge(status) {
        const statusColors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Accepted': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'Completed': 'bg-blue-100 text-blue-800'
        };
        
        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
        return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${colorClass}">${status}</span>`;
    }

    // Setup schedule event handlers
    function setupScheduleEventHandlers(dataTable) {
        if (!window.jQuery) return;

        const $ = window.jQuery;
        let scheduleId, targetButton, rowIndex;

        // Accept schedule handler
        $(document).on('click', '[accept-schedule-id]', function() {
            scheduleId = $(this).attr('accept-schedule-id');
            targetButton = $(this);
            rowIndex = $(this).closest('[index]').attr('index');

            showConfirmationModal({
                title: 'Accept Schedule',
                message: 'Are you sure you want to accept this schedule?',
                confirmText: 'Accept',
                confirmType: 'success',
                onConfirm: function() {
                    acceptSchedule(scheduleId, dataTable, rowIndex);
                }
            });
        });

        // Cancel schedule handler
        $(document).on('click', '[cancel-schedule-id]', function() {
            scheduleId = $(this).attr('cancel-schedule-id');
            targetButton = $(this);
            rowIndex = $(this).closest('[index]').attr('index');

            showConfirmationModal({
                title: 'Cancel Schedule',
                message: 'Are you sure you want to cancel this schedule?',
                confirmText: 'Confirm',
                confirmType: 'danger',
                onConfirm: function() {
                    cancelSchedule(scheduleId, dataTable, rowIndex);
                }
            });
        });
    }

    // Accept schedule API call
    function acceptSchedule(scheduleId, dataTable, rowIndex) {
        if (!window.jQuery) return;

        window.jQuery.ajax({
            url: `/schedule/api/${scheduleId}/accept/`,
            type: 'PATCH',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function(data) {
                removeScheduleButtons(rowIndex);
                const statusBadge = getStatusBadge(data.status);
                dataTable.cell({ row: parseInt(rowIndex), column: 3 }).data(statusBadge);
                
                showSuccessMessage('Successfully accepted the schedule');
            },
            error: function(error) {
                const errorMsg = error.responseJSON?.status || error.statusText || 'An error occurred';
                showErrorMessage(errorMsg);
            }
        });
    }

    // Cancel schedule API call
    function cancelSchedule(scheduleId, dataTable, rowIndex) {
        if (!window.jQuery) return;

        window.jQuery.ajax({
            url: `/schedule/api/${scheduleId}/cancel/`,
            type: 'PATCH',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function(data) {
                removeScheduleButtons(rowIndex);
                const statusBadge = getStatusBadge(data.status);
                dataTable.cell({ row: parseInt(rowIndex), column: 3 }).data(statusBadge);
                
                showSuccessMessage('Successfully cancelled the schedule');
            },
            error: function(error) {
                const errorMsg = error.responseJSON?.status || error.statusText || 'An error occurred';
                showErrorMessage(errorMsg);
            }
        });
    }

    // Remove schedule action buttons
    function removeScheduleButtons(rowIndex) {
        if (!window.jQuery) return;
        const $ = window.jQuery;
        const row = $(`[index="${rowIndex}"]`);
        row.find('[accept-schedule-id], [cancel-schedule-id], .edit-schedule-id').remove();
    }

    // Initialize shared reels table (dev/agent only)
    function initializeSharedReelsTable() {
        const reelsTable = document.querySelector('#shared-reels-table');
        if (!reelsTable) return;

        if (!window.jQuery || !window.jQuery.fn.DataTable) return;

        const $reelsTable = window.jQuery('#shared-reels-table').DataTable({
            ordering: false,
            lengthChange: false,
            info: false,
            pageLength: 5,
            dom: '<"flex items-center justify-between mb-4"<"text-lg font-semibold text-gray-900"l><"dataTables_filter">>rt<"flex items-center justify-between mt-4"<"dataTables_info"i><"dataTables_paginate"p>>',
            language: {
                search: '',
                searchPlaceholder: 'Search reels...'
            }
        });

        loadSharedReelsData($reelsTable);
        setupReelsEventHandlers($reelsTable);
    }

    // Load shared reels data
    function loadSharedReelsData(dataTable) {
        if (!window.jQuery) return;

        window.jQuery.ajax({
            url: '/advertise/api/reel/',
            type: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function(data) {
                if (data && data.length > 0) {
                    data.forEach(function(reel) {
                        const socialMediaIcon = getSocialMediaIcon(reel.social_media);
                        const statusToggle = getReelsToggle(reel);
                        const buttonHtml = getReelsButtons(reel);

                        const rowNode = dataTable.row.add([
                            reel.id,
                            socialMediaIcon,
                            reel.category,
                            `<div class="text-sm text-gray-900">${reel.property_title || ''}</div>`,
                            `<textarea readonly class="w-full max-w-xs resize-none border-0 bg-transparent text-sm text-gray-600 focus:outline-none">${reel.url || ''}</textarea>`,
                            `<div class="flex justify-center">${statusToggle}</div>`,
                            buttonHtml
                        ]).draw(false).node();

                        if (rowNode) {
                            rowNode.id = `shared-reel-${reel.id}`;
                        }
                    });
                }
            },
            error: function(error) {
                console.error('Error loading shared reels:', error);
            }
        });
    }

    // Get social media icon HTML
    function getSocialMediaIcon(platform) {
        const icons = {
            'youtube': '<div class="flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>',
            'titTok': '<div class="flex h-8 w-8 items-center justify-center rounded bg-black text-white"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></div>',
            'instagram': '<div class="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div>'
        };
        return icons[platform] || '<div class="h-8 w-8 rounded bg-gray-200"></div>';
    }

    // Get reels toggle HTML
    function getReelsToggle(reel) {
        const checked = reel.status === 'active' ? 'checked' : '';
        return `<label class="toggle-switch">
            <input type="checkbox" class="toggle-active" data-id="${reel.id}" data-item="reels" data-api-url="/advertise/api/reel/${reel.id}/" ${checked}>
            <span class="toggle-slider"></span>
        </label>`;
    }

    // Get reels buttons HTML
    function getReelsButtons(reel) {
        return `<div class="flex items-center justify-end gap-3">
            <a href="/advertise/edit-reels/${reel.id}/" class="text-blue-600 hover:text-blue-900">Edit</a>
            <button class="delete-shared-reels text-red-600 hover:text-red-900" data-id="${reel.id}" data-api-url="/advertise/api/reel/${reel.id}/">Delete</button>
        </div>`;
    }

    // Setup reels event handlers
    function setupReelsEventHandlers(dataTable) {
        if (!window.jQuery) return;
        const $ = window.jQuery;
        let deleteReelsId, deleteReelsUrl;

        $(document).on('click', '.delete-shared-reels', function() {
            deleteReelsId = $(this).data('id');
            deleteReelsUrl = $(this).data('api-url');

            showConfirmationModal({
                title: 'Delete Reels',
                message: 'Are you sure you want to delete this reel?',
                confirmText: 'Delete',
                confirmType: 'danger',
                onConfirm: function() {
                    deleteSharedReel(deleteReelsId, deleteReelsUrl, dataTable);
                }
            });
        });
    }

    // Delete shared reel
    function deleteSharedReel(reelId, apiUrl, dataTable) {
        if (!window.jQuery) return;

        window.jQuery.ajax({
            url: apiUrl,
            type: 'DELETE',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function() {
                const rowId = `#shared-reel-${reelId}`;
                dataTable.row(rowId).remove().draw(false);
                showSuccessMessage('Reel deleted successfully');
            },
            error: function(error) {
                const errorMsg = error.responseJSON?.detail || error.responseJSON?.status || 'An error occurred';
                showErrorMessage(errorMsg);
            }
        });
    }

    // Utility functions
    function getCsrfToken() {
        const cookie = document.cookie.match(/csrftoken=([^;]+)/);
        return cookie ? cookie[1] : '';
    }

    function showConfirmationModal(options) {
        if (typeof showModal === 'function') {
            showModal({
                modalTitle: options.title,
                modalBody: options.message,
                confirmButtonLabel: options.confirmText,
                confirmButtonType: options.confirmType || 'success',
                parentClass: options.parentClass || 'confirmation-modal',
                onConfirm: options.onConfirm
            });
        } else {
            if (confirm(options.message)) {
                options.onConfirm();
            }
        }
    }

    function showSuccessMessage(message) {
        if (typeof showModal === 'function') {
            showModal({
                modalTitle: '<div class="success-title">Success</div>',
                modalBody: message,
                confirmButtonType: 'hidden',
                hide_dismiss_button: true
            });
            setTimeout(() => {
                if (typeof hideModal === 'function') {
                    hideModal();
                }
            }, 1500);
        } else {
            alert(message);
        }
    }

    function showErrorMessage(message) {
        if (typeof showModal === 'function') {
            showModal({
                modalTitle: '<div class="error-title">Error</div>',
                modalBody: message,
                confirmButtonType: 'hidden'
            });
        } else {
            alert('Error: ' + message);
        }
    }
})();
