$(document).ready(function(){

    function time_convert(seconds ){
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor((seconds % 86400) / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = Math.floor(seconds % 60);

        // Format the output
        return days+'d : '+hours+'h : '+minutes+'m : '+secs+'s';
    }

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
            type: 'value',
            minInterval: 1,
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

    var analytic_params = {
        filter_type : 'weekly'
    }

    function modal_preloader(){
        return  '<div class="modal-preloader">'+
                    '<img src="/static/media/loader.gif" alt="loading">'+
                '</div>'
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
                $('[label-name="visit-analytics"]').append(modal_preloader())
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
            },
            complete : function(){
                $('[label-name="visit-analytics"] .modal-preloader').remove()
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
    });



    // ================================== chart end
    // ================================== chart end
    // ================================== chart end
    // ================================== chart end
    // ================================== chart end


    function analytic_table_data({
        url, target_table, data_table_void
    }){
        
        var init_table = target_table.DataTable({
            ordering: false,
            lengthChange: false,
            info: false,
            pageLength: 5,
        });

        $.ajax({
            url,
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
            },
            success: function (data) {
                console.log(url)
                console.log(data)
                data_table_void({
                    data, 
                    init_table,
                })
            },
            error: function (error) {
                console.log(error)
            },
            complete : function(){
                // $('[label-name="visit-analytics"] .modal-preloader').remove()
            }
        });
    };

    analytic_table_data({
        url : MAXIMUM_VIEWING_TIME_PROPERTIES,
        target_table : $('[table-name="maximum_viewing_time_properties"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.title,
                    time_convert(e.data[i]?.view_time),
                ]).draw(false).node();
            };
        }
    });

    analytic_table_data({
        url : POPULAR_SEARCH_LOCATION_PROPERTIES,
        target_table : $('[table-name="popular_search_location_properties"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.address,
                    e.data[i]?.view_from_this_location,
                ]).draw(false).node();
            };
        }
    });

    analytic_table_data({
        url : HIGHEST_SEARCH_APPEARANCES_PROPERTIES,
        target_table : $('[table-name="highest_search_appearances_properties"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.title,
                    e.data[i]?.search_appearance,
                ]).draw(false).node();
            };
        }
    });

    // analytic_table_data({
    //     url : USER_ANALYTICS_PROPERTIES,
    //     target_table : $('[table-name="user_analytics_properties"]') // left
    // });

    analytic_table_data({
        url : MOST_IN_DEMAND_PRICE_RANGE,
        target_table : $('[table-name="most_in_demand_price_range"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.range,
                    e.data[i]?.search_appearance,
                ]).draw(false).node();
            };
        }
    });

    analytic_table_data({
        url : TOP_RATED_BUILDINGS,
        target_table : $('[table-name="top_rated_buildings"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.title,
                    e.data[i]?.average_rating,
                ]).draw(false).node();
            };
        }
    });

    analytic_table_data({
        url : MOST_FAVORITE_PROPERTIES,
        target_table : $('[table-name="most_favorite_properties"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.title,
                    e.data[i]?.favorite_count,
                ]).draw(false).node();
            };
        }
    });

    analytic_table_data({
        url : MOST_APPEARED_ON_THE_COMPARE_LIST,
        target_table : $('[table-name="most_appeared_on_the_compare_list"]'),
        data_table_void : function (e){
            for (let i = 0; i < e.data.length; i++) {
                e.init_table.row.add([
                    e.data[i]?.title,
                    e.data[i]?.compare_count,
                ]).draw(false).node();
            };
        }
    });

})