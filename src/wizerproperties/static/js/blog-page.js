// filter icon //
$(document).ready(function () {
    $('.most-readed-filter, .most-liked-filter, .most-recent-filter').click(function () {
        var isActive = $(this).attr('active-filter') === 'true';
        $(this).attr('active-filter', isActive ? 'false' : 'true');
    });
});
