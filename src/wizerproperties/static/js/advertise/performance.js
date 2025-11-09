$(function () {
  var $body = $("body");
  var adsTable = $("#advertise-table").DataTable({
    order: [],
    lengthChange: false,
    info: false,
    pageLength: 10,
    language: { search: "", searchPlaceholder: "Search campaigns…" },
    dom: '<"flex flex-col gap-3 md:flex-row md:items-center md:justify-between"f><"overflow-x-auto">rt<"mt-4 flex items-center justify-between gap-3"p>',
    initComplete: function () {
      var $filter = $("#advertise-table").parents(".table-area").find(".dataTables_filter");
      if ($filter.length) {
        $filter.addClass("flex items-center gap-3");
        $filter.find("input").addClass("input h-9 w-48");
      }
    },
  });

  function openModal() {
    var $modal = $('[modal-name="analytics-details"]');
    $modal.removeClass("hidden").attr("aria-hidden", "false");
    $body.addClass("overflow-hidden");
  }

  function closeModal() {
    var $modal = $('[modal-name="analytics-details"]');
    $modal.addClass("hidden").attr("aria-hidden", "true");
    $body.removeClass("overflow-hidden");
  }

  $(document).on("click", "[data-modal-close]", function () {
    closeModal();
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });

  function renderLoader() {
    return (
      '<div class="modal-preloader absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm">' +
      '<span class="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>' +
      '<span class="sr-only">Loading analytics</span>' +
      "</div>"
    );
  }

  function addCampaignRow(campaign) {
    var createdAt = campaign && campaign.created_at ? dayjs(campaign.created_at).format("MMM D, YYYY h:mm A") : "--";
    var endAt = campaign && campaign.end_at ? dayjs(campaign.end_at).format("MMM D, YYYY h:mm A") : "--";
    var actionButton =
      '<button type="button" class="inline-flex items-center justify-end text-sm font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" data-ads-id="' +
      campaign.id +
      '">' +
      'View analytics' +
      '<svg class="ml-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
      "</button>";

    adsTable.row.add([
      campaign && campaign.property_title ? campaign.property_title : "--",
      campaign && campaign.ad_location ? campaign.ad_location : "--",
      createdAt,
      endAt,
      '<div class="flex justify-end">' + actionButton + "</div>",
    ]);
  }

  function fetchCampaigns() {
    $.ajax({
      url: ADS_LIST,
      type: "GET",
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        if (!$(".table-area .table-loader").length) {
          $(".table-area").append(renderLoader());
        }
      },
      success: function (data) {
        if (Array.isArray(data)) {
          data.forEach(function (campaign) {
            addCampaignRow(campaign);
          });
          adsTable.draw(false);
        }
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        $(".table-area .table-loader").remove();
      },
    });
  }

  fetchCampaigns();

  var locationTable = $("#location-table").DataTable({
    ordering: false,
    lengthChange: false,
    info: false,
    pageLength: 6,
    language: { search: "", searchPlaceholder: "Filter locations…" },
    dom: '<"flex flex-col gap-3 md:flex-row md:items-center md:justify-between"f><"overflow-x-auto">rt<"mt-4 flex items-center justify-between gap-3"p>',
    initComplete: function () {
      var $filter = $("#location-table").parents(".table-area").find(".dataTables_filter");
      if ($filter.length) {
        $filter.addClass("flex items-center gap-3");
        $filter.find("input").addClass("input h-9 w-48");
      }
    },
  });

  var genderElement = document.getElementById("gender-analytics");
  var genderChart = echarts.init(genderElement);
  var genderLoader = $("[data-gender-loader]");
  var genderOption = {
    tooltip: { trigger: "item" },
    legend: {
      top: "5%",
      left: "center",
      textStyle: { fontFamily: "var(--font-sans)", color: "currentColor" },
    },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: 18, fontWeight: "bold" } },
        labelLine: { show: false },
        data: [
          { value: 0, name: "Male" },
          { value: 0, name: "Female" },
        ],
      },
    ],
  };

  function updateAnalyticsSummary(data) {
    $('[label-name="number_of_clicked"]').text(data && data.number_of_clicked ? data.number_of_clicked : "--");
    $('[label-name="formatted_view_time"]').text(data && data.formatted_view_time ? data.formatted_view_time : "--");
    $('[label-name="conversion_rate"]').text(
      data && data.conversion_rate !== undefined && data.conversion_rate !== null
        ? data.conversion_rate + " %"
        : "--"
    );
  }

  function fetchCampaignAnalytics(campaignId) {
    $.ajax({
      url: ADS_ANALYTICS(campaignId),
      type: "GET",
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        locationTable.clear().draw();
        var $modalContent = $('[modal-name="analytics-details"] > div > div');
        if ($modalContent.find(".modal-preloader").length === 0) {
          $modalContent.prepend(renderLoader());
        }
        genderLoader.removeClass("hidden");
      },
      success: function (data) {
        updateAnalyticsSummary(data);

        var demographic = data && data.addemography ? data.addemography : {};
        genderOption.series[0].data = [
          { value: demographic.male_visitors || 0, name: "Male" },
          { value: demographic.female_visitors || 0, name: "Female" },
        ];
        genderChart.setOption(genderOption);

        var locations = data && data.adviewerlocation ? data.adviewerlocation : [];
        locations.forEach(function (item) {
          locationTable.row.add([
            item && item.address ? item.address : "--",
            item && item.view_from_this_location ? item.view_from_this_location : 0,
          ]);
        });
        locationTable.draw(false);
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        $('[modal-name="analytics-details"] .modal-preloader').remove();
        genderLoader.addClass("hidden");
      },
    });
  }

  $(document).on("click", '#advertise-table button[data-ads-id]', function () {
    var campaignId = $(this).data("ads-id");
    if (!campaignId) return;
    openModal();
    fetchCampaignAnalytics(campaignId);
  });
});
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
                $('[label-name="formatted_view_time"]').html(data?.formatted_view_time)
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
