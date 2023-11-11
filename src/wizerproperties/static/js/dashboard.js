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
    

    function prospect_schedule_button_tmp (data, url_link){
        return '<div class="td-edit-delete-see" style="min-width: '+(data?.status == "Pending" ? '255' : '95')+'px;">' +
                    (
                        data?.status == "Pending" ?
                        '<a href="schedule/create_schedule/?type='+data?.content_type+'&id='+data?.object_id+'&edit=true&schedule-id='+data?.id+'"'+
                            'class="link link-succes-btn" edit-schedule-id> Edit </a>' : ''
                    )+
                    (data?.status == "Pending" ? '<button cancel-schedule-id="'+data?.id+'" class="link delete-building delete-button"> Cancel </button>' : '') +
                    '<a class="link" href="'+url_link+'"> See More </a>' +
                '</div'
    };

    function dev_agent_schedule_button_tmp (data, url_link){
        return '<div class="td-edit-delete-see" style="min-width: '+(data?.status == "Pending" ? '255' : '95')+'px;">' +
                    (data?.status == "Pending" ? '<button accept-schedule-id="'+data?.id+'" class="link link-succes-btn"> Accept </button>' : '') +
                    (data?.status == "Pending" ? '<button cancel-schedule-id="'+data?.id+'" class="link delete-building delete-button"> Cancel </button>' : '') +
                    '<a class="link" href="'+url_link+'"> See More </a>' +
                '</div'
    };

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

                        var button_tmp = user_type == 'prospect' ?
                                            prospect_schedule_button_tmp(the_results[i], url_link) :
                                            dev_agent_schedule_button_tmp(the_results[i], url_link);

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


    $(document).on('click', '[accept-schedule-id]', function(){
        var get_schedule_id = $(this).attr('accept-schedule-id');
        var _this = $(this)
        
        $.ajax({
            url: '/schedule/api/'+get_schedule_id+'/accept/',
            type: 'PATCH',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                if(_this.parents('.td-edit-delete-see').find('[cancel-schedule-id]').length > 0){
                    _this.parents('.td-edit-delete-see').find('[cancel-schedule-id]').remove()
                }
                _this.remove()
            },
            error: function (error) {
                console.log("error")
            }
        });
    });


    $(document).on('click', '[cancel-schedule-id]', function(){
        var get_schedule_id = $(this).attr('cancel-schedule-id');
        var _this = $(this)
        
        $.ajax({
            url: '/schedule/api/'+get_schedule_id+'/cancel/',
            type: 'PATCH',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                if( _this.parents('.td-edit-delete-see').find('[accept-schedule-id]').length > 0){
                    _this.parents('.td-edit-delete-see').find('[accept-schedule-id]').remove()
                };
                if( _this.parents('.td-edit-delete-see').find('[edit-schedule-id]').length > 0){
                    _this.parents('.td-edit-delete-see').find('[edit-schedule-id]').remove()
                }
                _this.remove()
            },
            error: function (error) {
                console.log("error")
            }
        });
    });



});
