$(document).ready(function(){
    var property_dom = document.getElementById('property_view');
    var propertyChart = echarts.init(property_dom);
    var propertyOption;

    propertyOption = {
        title: {
            text: 'Property View'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
            saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Email',
                type: 'line',
                stack: 'Total',
                data: [120, 132, 101, 134]
            },
            {
                name: 'Union Ads',
                type: 'line',
                stack: 'Total',
                data: [220, 182, 191, 234, 290, 330, 310]
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
})