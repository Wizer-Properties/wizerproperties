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


    var schedule_table = $('#property-visit-schedule').DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });
    

    function display_schedule_list(){
        $.ajax({
            url: '/schedule/api/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var the_results = data?.results;
                
                if(the_results.length > 0){
                    for (let i = 0; i < the_results.length; i++) {

                        var url_link = the_results[i]?.content_type == 'building' ?
                                    '/building/details/'+the_results[i]?.object_id+'/' : 
                                    '/property/details/'+ the_results[i]?.object_id+'/';

                                    console.log(url_link)
                        // var button_tmp = '<div class="td-edit-delete-see" style="min-width: 180px;">' +
                        //                     '<button schedule-id="'+the_results[i]?.id+'" class="link delete-building delete-button"> Cancel </button>' +
                        //                     '<a class="link" href="'+url_link+'"> See More </a>' +
                        //                 '</div'

                        var button_tmp = '<div class="td-edit-delete-see" style="min-width: 120px;">' +
                                            '<a class="link" href="'+url_link+'"> See More </a>' +
                                        '</div'

                        schedule_table.row.add([
                            the_results[i]?.id,
                            the_results[i]?.title || '',
                            '<div class="address-line">'+(the_results[i]?.address || '')+'</div>',
                            the_results[i]?.status,
                            the_results[i]?.content_type,
                            the_results[i]?.visiting_time,
                            button_tmp
                        ]).draw(false);
                    }
                }
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    display_schedule_list();

});
