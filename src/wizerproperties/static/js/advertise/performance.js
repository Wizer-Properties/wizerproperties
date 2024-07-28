$(document).ready(function(){
    var advertise_list = $("#advertise-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });


    
    function get_advertisement_list(){
        $.ajax({
            url: ADS_LIST,
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                for (let i = 0; i < data.length; i++) {
                    // const element = data[i];
                    var created_at = data[i]?.created_at ? dayjs(data[i]?.created_at).format('MMM D, YYYY h:mm A') : '--';
                    var end_at = data[i]?.end_at ? dayjs(data[i]?.end_at).format('MMM D, YYYY h:mm A') : '--';

                    advertise_list.row.add([
                        data[i]?.property_title,
                        data[i]?.ad_location,
                        created_at,
                        end_at,
                        '<div class="td-edit-delete-see">'+
                            '<button class="link view-button border-0" ads-id="'+data[i]?.id+'">'+
                                'Details'+
                            '</button>'+
                        '</div>'
                    ]).draw(false).node();
                }


                // $(rowNode).attr('id', 'shared-reel-' + the_results[i]?.id);
            },
            error: function (error) {
                console.log(error)
            }
        });
    };

    get_advertisement_list();


    var location_table = $("#location-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });
    

    $(document).on('click', '#advertise-table .view-button', function(){
        $('#analytics-details').modal('show');
        get_ads_details($(this).attr("ads-id"))
    });

    $(document).on('click', '.close-analytics-modal', function(){
        $('#analytics-details').modal('hide');
    })


    // gender analytics data ============================
    var gender_analytics_chart_dom = document.getElementById('gender-analytics');
    var gender_analytics_chart = echarts.init(gender_analytics_chart_dom);
    var gender_option;

    gender_option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: 'Gender',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                    show: true,
                    fontSize: 18,
                    fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 0, name: 'Male' },
                    { value: 0, name: 'Female' }
                ]
            }
        ]
    };

    gender_option && gender_analytics_chart.setOption(gender_option);


    function modal_preloader(){
        return  '<div class="modal-preloader">'+
                    '<img src="/static/media/loader.gif" alt="loading">'+
                '</div>'
    }


    function get_ads_details(id){
        $.ajax({
            url: ADS_ANALYTICS(id),
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                location_table.clear().draw();
                $('#analytics-details .modal-content').prepend(modal_preloader())
            },
            success: function (data) {
                $('[label-name="number_of_clicked"]').html(data?.number_of_clicked)
                $('[label-name="view_time"]').html(data?.view_time)
                $('[label-name="conversion_rate"]').html(data?.conversion_rate+' %')

                var addemography_value = [
                    { value: data?.addemography?.male_visitors || 0, name: 'Male' },
                    { value: data?.addemography?.female_visitors || 0, name: 'Female' }
                ];

                gender_option.series[0].data = addemography_value;
                gender_analytics_chart.setOption(gender_option);

                var adslocation = data?.adviewerlocation;

                for (let i = 0; i < adslocation.length; i++) {
                    location_table.row.add([
                        adslocation[i]?.address,
                        adslocation[i]?.view_from_this_location,
                    ]).draw(false).node();
                };
            },
            error: function (error) {
                console.log(error)
            },
            complete: function(){
                $('#analytics-details .modal-preloader').remove()
            }
        });
    };
});
