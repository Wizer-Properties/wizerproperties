$(document).ready(function () {
    $(".dashboard-data-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });

    function table_height(_table) {
        var table_tr = _table.find("tbody tr");
        var table_head = _table.find("thead");
        var total_height = 0;
        for (let i = 0; i < table_tr.length; i++) {
            var get_height = table_tr[i] && window.getComputedStyle(table_tr[i]);
            var get_int_value = parseInt(get_height?.getPropertyValue("height"));

            total_height = total_height + get_int_value;
        }

        var get_table_head_height = table_head[0] && window.getComputedStyle(table_head[0]);
        var get_table_head_int_value = parseInt(
            get_table_head_height?.getPropertyValue("height")
        );
        total_height = total_height + get_table_head_int_value;

        _table.parent().css({
            "min-height": total_height + 70,
        });
    }

    table_height($("#property-table"));
    table_height($("#building-table"));
    table_height($("#property-visit-schedule"));

    $(window).resize(function () {
        table_height($("#property-table"));
        table_height($("#building-table"));
        table_height($("#property-visit-schedule"));
    });
});
