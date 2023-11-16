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
        pageLength : 5
    });
    

    function prospect_schedule_button_tmp (data, url_link, index){
        return '<div index='+index+' class="td-edit-delete-see">' +
                    (
                        data?.status == "Pending" ?
                        '<a href="schedule/create_schedule/?type='+data?.content_type+'&id='+data?.object_id+'&edit=true&schedule-id='+data?.id+'"'+
                            'class="link link-succes-btn  edit-schedule-id"> Edit </a>' : ''
                    )+
                    (data?.status == "Pending" ? '<button cancel-schedule-id="'+data?.id+'" class="link delete-building delete-button"> Cancel </button>' : '') +
                    '<a class="link" href="'+url_link+'"> See More </a>' +
                '</div'
    };

    function dev_agent_schedule_button_tmp (data, url_link, index){
        return '<div index='+index+' class="td-edit-delete-see">' +
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
                var the_results = data;
                
                if(the_results.length > 0){
                    for (let i = 0; i < the_results.length; i++) {
                        var url_link = the_results[i]?.content_type == 'building' ?
                                    '/building/details/'+the_results[i]?.object_id+'/' : 
                                    '/property/details/'+ the_results[i]?.object_id+'/';

                        var button_tmp = user_type == 'prospect' ?
                                            prospect_schedule_button_tmp(the_results[i], url_link, i) :
                                            dev_agent_schedule_button_tmp(the_results[i], url_link, i);

                        var visition_date = new Date(the_results[i]?.visiting_time)
                        visition_date.setHours(visition_date.getHours() - 7);
                        var edited_date = dayjs(visition_date).format('dddd DD MMM, h:mm A (YYYY)');

                        schedule_table.row.add([
                            the_results[i]?.id,
                            the_results[i]?.title || '',
                            '<div class="address-line">'+(the_results[i]?.address || '')+'</div>',
                            the_results[i]?.status,
                            the_results[i]?.content_type,
                            edited_date,
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


    var schedule_target_button;
    var get_schedule_id;
    var get_row_index;

    $(document).on('click', '[accept-schedule-id]', function(){
        var modalTitle = "Accept Schedule";
        var modalBody = "Are you sure you want to accept this schedule?";

        var modal_option = {
            modalTitle : modalTitle, // modal title text
            modalBody : modalBody, // modal body text
            confirmButtonLabel : "Accept", // action button text
            parentClass : 'accept-schedule-modal', // adding a class with #confirmationModal
            confirmButtonType : 'success'
        };

        showModal(modal_option);
        get_schedule_id = $(this).attr('accept-schedule-id');
        schedule_target_button = $(this)
        get_row_index = $(this).parents('.td-edit-delete-see').attr('index');
    });


    $(document).on('click', '[cancel-schedule-id]', function(){
        var modalTitle = "Cancel Schedule";
        var modalBody = "Are you sure you want to cancel this schedule?";

        var modal_option = {
            modalTitle : modalTitle, // modal title text
            modalBody : modalBody, // modal body text
            confirmButtonLabel : "Confirm", // action button text
            parentClass : 'cancel-schedule-modal', // adding a class with #confirmationModal
            confirmButtonType : 'danger'
        };

        showModal(modal_option);
        get_schedule_id = $(this).attr('cancel-schedule-id');
        schedule_target_button = $(this);
        get_row_index = $(this).parents('.td-edit-delete-see').attr('index');
    });


    $(document).on('click', '.accept-schedule-modal #confirmButton', function(){
        $(this).parents('.accept-schedule-modal').removeClass('accept-schedule-modal');
        $.ajax({
            url: '/schedule/api/'+get_schedule_id+'/accept/',
            type: 'PATCH',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function(){
                var modal_option = {
                    confirmButtonLabel : '<img width="20" src="/static/media/loader.svg" alt="loader">',
                    confirmButtonType : 'success'
                };

                showModal(modal_option);
            },
            success: function (data) {
                remove_accept_cancel_btn();

                var modal_option = {
                    modalTitle : '<div class="success-title">Success Message</div>', // modal title text
                    modalBody : 'Successfully accept the schedule', // modal body text
                    confirmButtonType : 'hidden',
                    hide_dismiss_button : true
                };

                showModal(modal_option);
                setTimeout(() => {
                    $('#confirmationModal').modal("hide");
                }, 1500);

                var schedule_table_cell = schedule_table.cell({ row: parseInt(get_row_index), column: 3 });
                schedule_table_cell.data(data?.status)
            },
            error: function (error) {
                var modal_option = {
                    modalTitle : '<div class="error-title">Error Message</div>', // modal title text
                    modalBody : error?.responseJSON?.status || error?.statusText, // modal body text
                    confirmButtonType : 'hidden',
                };

                showModal(modal_option);
            }
        });
    })

    $(document).on('click', '.cancel-schedule-modal #confirmButton', function(){
        $(this).parents('.cancel-schedule-modal').removeClass('cancel-schedule-modal');
        $.ajax({
            url: '/schedule/api/'+get_schedule_id+'/cancel/',
            type: 'PATCH',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function(){
                var modal_option = {
                    confirmButtonLabel : '<img width="20" src="/static/media/loader.svg" alt="loader">',
                    confirmButtonType : 'danger'
                };

                showModal(modal_option);
            },
            success: function (data) {
                remove_accept_cancel_btn()

                var modal_option = {
                    modalTitle : '<div class="success-title">Success Message</div>', // modal title text
                    modalBody : 'Successfully cancel the schedule', // modal body text
                    confirmButtonType : 'hidden',
                    hide_dismiss_button : true
                };

                showModal(modal_option);
                setTimeout(() => {
                    $('#confirmationModal').modal("hide");
                }, 1500);

                var schedule_table_cell = schedule_table.cell({ row: parseInt(get_row_index), column: 3 });
                schedule_table_cell.data(data?.status)
            },
            error: function (error) {
                var modal_option = {
                    modalTitle : 'Error Message', // modal title text
                    modalBody : error?.responseJSON?.status || error?.statusText, // modal body text
                    confirmButtonType : 'hidden',
                };

                showModal(modal_option);
            }
        });
    })


    function remove_accept_cancel_btn(){
        schedule_target_button.parents('.td-edit-delete-see').find('.edit-schedule-id').remove();
        schedule_target_button.parents('.td-edit-delete-see').find('button').remove();
        schedule_target_button.parents('.td-edit-delete-see').find('[accept-schedule-id]').remove();
    };


});
