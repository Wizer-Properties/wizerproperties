$(document).ready(function(){
    $("#advertise-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });

    $("#location-table").DataTable({
        ordering: false,
        lengthChange: false,
        info: false,
    });
    

    $(document).on('click', '#advertise-table .view-button', function(){
        $('#analytics-details').modal('show');
    });

    $(document).on('click', '.close-analytics-modal', function(){
        $('#analytics-details').modal('hide');
    })


    // gender analytics data ============================
    var chartDom = document.getElementById('gender-analytics');
    var myChart = echarts.init(chartDom);
    var getnder_option;

    getnder_option = {
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
                { value: 484, name: 'Male' },
                { value: 100, name: 'Female' }
            ]
            }
        ]
    };

    getnder_option && myChart.setOption(getnder_option);


    // age analytics data ============================
    var age_chartDom = document.getElementById('age-analytics');
    var age_myChart = echarts.init(age_chartDom);
    var age_getnder_option;

    age_getnder_option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
            name: 'Age Analytics',
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
                    { value: 44, name: '30 year' },
                    { value: 20, name: '40 year' },
                    { value: 10, name: '50 year' },
                    { value: 20, name: '60 year' },
                ]
            }
        ]
    };

    age_getnder_option && age_myChart.setOption(age_getnder_option);

    window.addEventListener('resize', function() {
        myChart.resize();
        age_myChart.resize();
    });

});
