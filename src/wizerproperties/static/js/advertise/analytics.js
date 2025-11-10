$(function () {
  var $body = $("body");

  function openModal(name) {
    var $modal = $('[modal-name="' + name + '"]');
    if (!$modal.length) return;
    $modal.removeClass("hidden").attr("aria-hidden", "false");
    $body.addClass("overflow-hidden");
  }

  function closeModal($modal) {
    if (!$modal || !$modal.length) return;
    $modal.addClass("hidden").attr("aria-hidden", "true");
    if ($('[modal-name]:visible').length === 0) {
      $body.removeClass("overflow-hidden");
    }
  }

  $(document).on("click", "[target-modal]", function () {
    openModal($(this).attr("target-modal"));
  });

  $(document).on("click", "[data-modal-close]", function () {
    closeModal($(this).closest("[modal-name]"));
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal($("[modal-name]").filter(":visible").last());
    }
  });

  function formatDuration(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return "--";
    var total = Math.max(0, Number(seconds));
    var hours = Math.floor(total / 3600);
    var minutes = Math.floor((total % 3600) / 60);
    var secs = Math.floor(total % 60);
    return hours + "h " + minutes + "m " + secs + "s";
  }

  var chartElement = document.getElementById("property_view");
  if (!chartElement) return;

  var propertyChart = echarts.init(chartElement);
  var propertyOption = {
    title: {
      text: "Property View",
      left: "left",
      textStyle: {
        fontSize: 14,
        fontFamily: "var(--font-sans)",
        color: "currentColor",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderWidth: 0,
      textStyle: { color: "#fff" },
    },
    grid: { left: "3%", right: "3%", bottom: "5%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.35)" } },
      axisLabel: { color: "rgba(148, 163, 184, 0.9)" },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.2)" } },
      axisLabel: { color: "rgba(148, 163, 184, 0.9)" },
    },
    series: [
      {
        data: [],
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { width: 3, color: "#0ea5e9" },
        itemStyle: { color: "#2563eb" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(14, 165, 233, 0.25)" },
            { offset: 1, color: "rgba(37, 99, 235, 0.05)" },
          ]),
        },
      },
    ],
  };

  propertyChart.setOption(propertyOption);
  window.addEventListener("resize", function () {
    propertyChart.resize();
  });

  var analyticParams = { filter_type: "weekly" };
  var $chartLoader = $("[data-chart-loader]");

  function togglePaginationButtons(pagination) {
    var nextValue = pagination && pagination.next ? pagination.next : false;
    var prevValue = pagination && pagination.previous ? pagination.previous : false;

    var $nextButton = $('[label-name="pagination"][name="next"]');
    var $prevButton = $('[label-name="pagination"][name="previous"]');

    $nextButton
      .val(nextValue || false)
      .attr("aria-disabled", !nextValue)
      .prop("disabled", !nextValue);

    $prevButton
      .val(prevValue || false)
      .attr("aria-disabled", !prevValue)
      .prop("disabled", !prevValue);
  }

  function setFilterActive($button) {
    var group = $button.closest(".chart-filter-btn-area");
    group.find('[label-name="filter-type"]').attr("aria-pressed", "false");
    $button.attr("aria-pressed", "true");
  }

  function getVisitAnalytics() {
    $.ajax({
      url: VISITE_ANALYTCS,
      type: "GET",
      data: analyticParams,
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        $chartLoader.removeClass("hidden");
      },
      success: function (data) {
        if (data && Array.isArray(data.visit_data) && data.visit_data.length) {
          propertyChart.resize();
          $("#property_view").removeClass("hidden");
          $('[data-empty-state="chart"]').remove();
          propertyOption.series[0].data = data.visit_data;
          propertyOption.xAxis.data = data.label_list ? data.label_list : [];
          propertyChart.setOption(propertyOption);
        } else {
          propertyChart.clear();
          if (!$('[data-empty-state="chart"]').length) {
            $("#property_view")
              .addClass("hidden")
              .after(
                '<div data-empty-state="chart" class="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 text-sm text-muted-foreground">No visit data available yet.</div>'
              );
          }
        }

        delete analyticParams.previous;
        delete analyticParams.next;

        togglePaginationButtons(data && data.pagination ? data.pagination : null);

        if (data && data.start_date && data.end_date) {
          var dateRange =
            dayjs(data.start_date).format("MMM D, YYYY") +
            " to " +
            dayjs(data.end_date).format("MMM D, YYYY");
          $('[label-name="date-range"]').text(dateRange);
        }
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        $chartLoader.addClass("hidden");
      },
    });
  }

  getVisitAnalytics();

  $(document).on("click", '.chart-filter-btn-area [label-name="filter-type"]', function () {
    var value = $(this).attr("value");
    if (!value || analyticParams.filter_type === value) return;
    analyticParams.filter_type = value;
    setFilterActive($(this));
    getVisitAnalytics();
  });

  $(document).on("click", '.chart-filter-btn-area [label-name="pagination"]', function () {
    var value = $(this).val();
    var name = $(this).attr("name");
    if (!value || value === "false" || !name || $(this).prop("disabled")) return;
    analyticParams[name] = value;
    getVisitAnalytics();
  });

  function renderLoader() {
    return (
      '<div class="table-loader absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm">' +
      '<span class="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>' +
      '<span class="sr-only">Loading report</span>' +
      "</div>"
    );
  }

  function analyticsTableData(config) {
    var $table = $('[table-name="' + config.targetName + '"]');
    if (!$table.length) return;

    var dataTable = $table.DataTable({
      ordering: false,
      lengthChange: false,
      info: false,
      pageLength: 5,
      language: {
        search: "",
        searchPlaceholder: "Search…",
      },
      dom: '<"flex flex-col gap-3 md:flex-row md:items-center md:justify-between"f><"overflow-x-auto">rt<"mt-4 flex items-center justify-between gap-3"p>',
      initComplete: function () {
        var title = $table.attr("table-title");
        if (title) {
          var $filter = $table.parents(".table-area").find(".dataTables_filter");
          if ($filter.length) {
            $filter
              .addClass("flex items-center gap-3")
              .prepend('<h3 class="text-base font-semibold text-foreground">' + title + "</h3>");
            $filter.find("input").addClass("input h-9 w-40");
          }
        }
      },
    });

    $.ajax({
      url: config.url,
      type: "GET",
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        var $container = $table.parents(".table-area");
        if ($container.find(".table-loader").length === 0) {
          $container.append(renderLoader());
        }
      },
      success: function (data) {
        if (Array.isArray(data) && data.length) {
          config.onPopulate({ rows: data, dataTable: dataTable });
          $('[target-modal="' + config.targetName + '"] [label-name="total-data"]').text(
            "Total data : " + data.length
          );
          $table.parents(".table-area").find('[data-empty-state="table"]').remove();
        } else {
          dataTable.clear().draw();
          $('[target-modal="' + config.targetName + '"] [label-name="total-data"]').text("Total data : 0");
          if (!$table.parents(".table-area").find('[data-empty-state="table"]').length) {
            $table.after(
              '<div data-empty-state="table" class="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">No data available.</div>'
            );
          }
        }
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        $table.parents(".table-area").find(".table-loader").remove();
      },
    });
  }

  analyticsTableData({
    url: TOP_PERFORMING_PROPERTIES_BY_CONVERSION,
    targetName: "top_performing_properties_by_conversion",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          (row && row.conversion_rate ? row.conversion_rate : "--") + " %",
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: MAXIMUM_VIEWING_TIME_PROPERTIES,
    targetName: "maximum_viewing_time_properties",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          formatDuration(row && row.view_time ? row.view_time : 0),
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: POPULAR_SEARCH_LOCATION_PROPERTIES,
    targetName: "popular_search_location_properties",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.address ? row.address : "--",
          row && row.view_from_this_location ? row.view_from_this_location : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: HIGHEST_SEARCH_APPEARANCES_PROPERTIES,
    targetName: "highest_search_appearances_properties",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          row && row.search_appearance ? row.search_appearance : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: MOST_IN_DEMAND_PRICE_RANGE,
    targetName: "most_in_demand_price_range",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.range ? row.range : "--",
          row && row.search_appearance ? row.search_appearance : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: TOP_RANKED_PROPERTIES,
    targetName: "top_ranked_properties",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          row && row.visit_count ? row.visit_count : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: TOP_RATED_BUILDINGS,
    targetName: "top_rated_buildings",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.address ? row.address : "--",
          row && row.average_rating ? row.average_rating : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: MOST_FAVORITE_PROPERTIES,
    targetName: "most_favorite_properties",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          row && row.favorite_count ? row.favorite_count : 0,
        ]);
      });
      payload.dataTable.draw(false);
    },
  });

  analyticsTableData({
    url: MOST_APPEARED_ON_THE_COMPARE_LIST,
    targetName: "most_appeared_on_the_compare_list",
    onPopulate: function (payload) {
      payload.rows.forEach(function (row) {
        payload.dataTable.row.add([
          row && row.title ? row.title : "--",
          row && row.building_name ? row.building_name : "--",
          row && row.building_location ? row.building_location : "--",
          row && row.compare_count ? row.compare_count : 0,
        ]);
      });
      payload.dataTable.draw(false);
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

  function fetchGenderAnalytics() {
    $.ajax({
      url: USER_GENDER_RATIO,
      type: "GET",
      headers: { "X-CSRFToken": csrfToken },
      beforeSend: function () {
        genderLoader.removeClass("hidden");
      },
      success: function (data) {
        genderOption.series[0].data = [
          { value: data && data.male ? data.male : 0, name: "Male" },
          { value: data && data.female ? data.female : 0, name: "Female" },
        ];
        genderChart.setOption(genderOption);
      },
      error: function (error) {
        console.error(error);
      },
      complete: function () {
        genderLoader.addClass("hidden");
      },
    });
  }

  fetchGenderAnalytics();
});
