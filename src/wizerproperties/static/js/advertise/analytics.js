$(document).ready(function(){
    var property_dom = document.getElementById('property_view');
    var propertyChart = echarts.init(property_dom);
    var propertyOption;

    propertyOption = {
        title: {
            text: 'Property View'
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [],
                type: 'line'
            }
        ]
    };

    propertyOption && propertyChart.setOption(propertyOption);


    window.addEventListener('resize', function() {
        propertyChart.resize();
    });



    $(".dashboard-data-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });


    var analytic_params = {
        filter_type : 'weekly'
    }


    function get_visite_analytic_data(){
        $.ajax({
            url: VISITE_ANALYTCS,
            type: 'GET',
            data : analytic_params,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                
            },
            success: function (data) {
                propertyOption.series[0].data = data?.visit_data
                propertyOption.xAxis.data = data?.label_list
                propertyChart.setOption(propertyOption)

                if(analytic_params.previous) delete analytic_params.previous;
                if(analytic_params.next) delete analytic_params.next;

                $('[label-name="pagination"][name="next"]').val(data?.pagination?.next)
                $('[label-name="pagination"][name="previous"]').val(data?.pagination?.previous)
                $('[label-name="pagination"][name="next"]').attr('active', Boolean(data?.pagination?.next))
                $('[label-name="pagination"][name="previous"]').attr('active', Boolean(data?.pagination?.previous))

                var date_range = dayjs(data?.start_date).format('MMM D, YYYY') +' to '+ 
                                 dayjs(data?.end_date).format('MMM D, YYYY')
                $('[label-name="date-range"]').html(date_range)
            },
            error: function (error) {
                console.log(error)
            }
        });
    };

    get_visite_analytic_data();


    $(document).on('click', '.chart-filter-btn-area [label-name]', function(){
        var label_name = $(this).attr('label-name');
        var label_value = $(this).attr('value');
        if(
            label_name == "filter-type" &&
            analytic_params.filter_type != label_value
        ){
            analytic_params.filter_type = label_value;
            $('[label-name="filter-type"]').attr("active", false)
            $(this).attr("active", true)
            get_visite_analytic_data();
            return
        };

        if(
            label_name == "pagination" &&
            ![false, 'false', ''].includes(label_value)
        ){
            analytic_params[$(this).attr('name')] = label_value;
            get_visite_analytic_data();
            return
        };

        
    })
})