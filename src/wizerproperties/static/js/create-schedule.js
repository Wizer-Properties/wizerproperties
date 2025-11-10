const DATE_SLIDE_BASE_CLASSES = "date-field-box flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-background/70 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary";
const DATE_SLIDE_SELECTED_CLASSES = "border-primary bg-primary/10 text-primary shadow";
const TIME_SLIDE_BASE_CLASSES = "date-field-box flex h-16 w-full items-center justify-center rounded-2xl border border-border bg-background/70 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary";
const TIME_SLIDE_SELECTED_CLASSES = "border-primary bg-primary/10 text-primary shadow";

const ALERT_SUCCESS = (message) => `
  <div class="alert alert-success" role="status">
    ${message}
  </div>
`;

const ALERT_ERROR = (message) => `
  <div class="alert alert-danger" role="alert">
    ${message}
  </div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const dateRoot = document.querySelector(".date-picker-splide");
  const timeRoot = document.querySelector(".time-picker-splide");
  const confirmButton = document.querySelector(".create-schedule-btn");
  const summaryField = document.querySelector(".display-time");
  const alertsRegion = document.querySelector(".alert_messages");
  const propertyBox = document.querySelector(".property-single-box");
  const scheduleTitle = document.querySelector(".create-schedule-title");
  const editField = document.querySelector('[label-name="update-date-field"]');

  if (!dateRoot || !timeRoot || !confirmButton || !propertyBox) {
    return;
  }

  const url = new URL(window.location.href);
  const assetType = url.searchParams.get("type");
  const assetId = url.searchParams.get("id");
  const isEdit = url.searchParams.get("edit") === "true";
  const scheduleId = url.searchParams.get("schedule-id");

  scheduleTitle.textContent = isEdit ? "Update your visit" : "Schedule a property tour";
  confirmButton.textContent = isEdit ? "Update visit" : "Confirm visit";

  const state = {
    selectedDate: null,
    selectedTime: null,
    creating: false,
  };

  const dateSplide = new Splide(".date-picker-splide", {
    perPage: 4,
    gap: "16px",
    pagination: false,
    breakpoints: {
      1024: { perPage: 3 },
      768: { perPage: 2 },
    },
  }).mount();

  const timeSplide = new Splide(".time-picker-splide", {
    perPage: 5,
    gap: "16px",
    pagination: false,
    breakpoints: {
      1024: { perPage: 4 },
      768: { perPage: 3 },
    },
  }).mount();

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const generateUpcomingDays = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > 22 || (currentHour === 22 && currentMinute >= 0)) {
      now.setDate(now.getDate() + 1);
    }

    const days = [];
    for (let i = 0; i < 30; i += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      days.push({
        index: i,
        dayName: daysOfWeek[date.getDay()],
        day,
        monthName: monthsShort[date.getMonth()],
        year: date.getFullYear(),
        isoDate: `${date.getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
    }
    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setHours(21, 0, 0, 0);

    let cursor = now >= end || now < start ? new Date(start) : new Date(now);
    if (cursor.getMinutes() < 30) {
      cursor.setMinutes(30, 0, 0);
    } else {
      cursor.setHours(cursor.getHours() + 1, 0, 0, 0);
    }

    cursor = new Date(Math.max(cursor, start));

    while (cursor < end) {
      slots.push(cursor.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      cursor.setMinutes(cursor.getMinutes() + 30);
    }
    slots.push("9:00 PM");
    return slots;
  };

  const createDateSlide = (day) => `
    <div class="splide__slide">
      <button type="button" class="${DATE_SLIDE_BASE_CLASSES}" data-date-index="${day.index}" data-date-value="${day.isoDate}">
        <span class="text-xs uppercase tracking-[0.2em] text-muted-foreground">${day.dayName}</span>
        <span class="text-lg font-semibold text-foreground">${String(day.day).padStart(2, "0")}</span>
        <span class="text-xs uppercase tracking-[0.2em] text-muted-foreground">${day.monthName}</span>
      </button>
    </div>
  `;

  const createTimeSlide = (time, index) => `
    <div class="splide__slide">
      <button type="button" class="${TIME_SLIDE_BASE_CLASSES}" data-time-index="${index}" data-time-value="${time}">
        ${time}
      </button>
    </div>
  `;

  const refreshSelectionStyles = () => {
    dateRoot.querySelectorAll(".date-field-box").forEach((button) => {
      const isSelected = state.selectedDate && button.dataset.dateValue === state.selectedDate.isoDate;
      button.className = isSelected ? `${DATE_SLIDE_BASE_CLASSES} ${DATE_SLIDE_SELECTED_CLASSES}` : DATE_SLIDE_BASE_CLASSES;
    });

    timeRoot.querySelectorAll(".date-field-box").forEach((button) => {
      const isSelected = state.selectedTime && button.dataset.timeValue === state.selectedTime.label;
      button.className = isSelected ? `${TIME_SLIDE_BASE_CLASSES} ${TIME_SLIDE_SELECTED_CLASSES}` : TIME_SLIDE_BASE_CLASSES;
    });
  };

  const upcomingDays = generateUpcomingDays();
  upcomingDays.forEach((day) => dateSplide.add(createDateSlide(day)));

  const timeSlots = generateTimeSlots();
  timeSlots.forEach((slot, index) => timeSplide.add(createTimeSlide(slot, index)));

  const updateSummary = () => {
    if (!summaryField) return;
    if (state.selectedDate && state.selectedTime) {
      const { dayName, day, monthName, year } = state.selectedDate;
      summaryField.textContent = `${dayName} ${String(day).padStart(2, "0")} ${monthName}, ${state.selectedTime.label} (${year})`;
      confirmButton.classList.remove("hidden");
    } else {
      summaryField.textContent = "";
      confirmButton.classList.add("hidden");
    }
  };

  dateRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".date-field-box");
    if (!button) return;
    const index = Number(button.dataset.dateIndex);
    state.selectedDate = upcomingDays[index];
    refreshSelectionStyles();
    updateSummary();
  });

  timeRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".date-field-box");
    if (!button) return;
    const index = Number(button.dataset.timeIndex);
    state.selectedTime = {
      index,
      label: timeSlots[index],
    };
    refreshSelectionStyles();
    updateSummary();
  });

  const formatTimeForApi = (timeLabel) => {
    if (!timeLabel) return null;
    const parts = timeLabel.split(/:| /);
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const period = parts[2];

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };

  const renderFacilities = (data) => {
    const facilities = [];
    if (data?.building?.have_fitness_area) facilities.push("Fitness");
    if (data?.building?.have_grocery) facilities.push("Grocery");
    if (data?.building?.have_guard_house) facilities.push("Security");
    if (data?.building?.have_river_view) facilities.push("River view");
    if (data?.building?.have_sauna) facilities.push("Sauna");
    if (data?.building?.have_sky_lounge) facilities.push("Sky lounge");

    return facilities
      .map((item) => `<span class="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">${item}</span>`)
      .join("");
  };

  const renderPropertyCard = (data) => {
    const title = data?.title || data?.building?.title || "Untitled";
    const address = data?.building?.address || "";
    const image = data?.image_path || data?.building?.image_path || "/static/media/logo.png";
    const description = data?.description || "";

    return `
      <div class="space-y-5">
        <div class="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
          <img src="${image}" alt="${title}" loading="lazy" class="h-56 w-full object-cover" />
        </div>
        <div class="space-y-3">
          <h2 class="text-xl font-heading font-semibold text-foreground">${title}</h2>
          <p class="flex items-start gap-2 text-sm text-muted-foreground">
            <i class="bi bi-geo-alt text-base text-primary"></i>
            ${address}
          </p>
          ${
            assetType === "property"
              ? `
                <div class="space-y-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p class="text-sm text-muted-foreground">${description}</p>
                  <div class="grid grid-cols-2 gap-3 text-center text-xs text-muted-foreground sm:grid-cols-4">
                    <div class="rounded-xl border border-border/60 bg-card/80 p-3">
                      <p class="text-lg font-semibold text-foreground">${data?.number_of_bedroom ?? "-"}</p>
                      <p>Bedrooms</p>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-card/80 p-3">
                      <p class="text-lg font-semibold text-foreground">${data?.number_of_bathroom ?? "-"}</p>
                      <p>Bathrooms</p>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-card/80 p-3">
                      <p class="text-lg font-semibold text-foreground">${data?.unit_area ?? "-"}</p>
                      <p>Sqm</p>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-card/80 p-3">
                      <p class="text-lg font-semibold text-foreground">${data?.floor_number ?? "-"}</p>
                      <p>Floor</p>
                    </div>
                  </div>
                </div>
              `
              : ""
          }
          <div class="flex flex-wrap gap-2">${renderFacilities(data)}</div>
        </div>
      </div>
    `;
  };

  const assetEndpoint = assetType === "property"
    ? `/property/api/details/${assetId}/schedule/`
    : `/building/api/details/${assetId}/schedule/`;

  fetch(assetEndpoint, {
    headers: { "X-CSRFToken": typeof csrfToken !== "undefined" ? csrfToken : "" },
  })
    .then((response) => response.json())
    .then((payload) => {
      const data = assetType === "building" ? { building: payload } : payload;
      propertyBox.innerHTML = renderPropertyCard(data);
    })
    .catch(() => {
      propertyBox.innerHTML = `<p class="text-sm text-destructive">We couldn’t load the property details. Please try again later.</p>`;
    });

  if (isEdit && scheduleId) {
    fetch(`/schedule/api/${scheduleId}/`, {
      headers: { "X-CSRFToken": typeof csrfToken !== "undefined" ? csrfToken : "" },
    })
      .then((response) => response.json())
      .then((data) => {
        const raw = new Date(data?.visiting_time);
        raw.setHours(raw.getHours() - 7);
        if (editField) {
          editField.innerHTML = `<p class="rounded-xl border border-border/60 bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">Created schedule: ${dayjs(raw).format("dddd DD MMM, h:mm A (YYYY)")}</p>`;
        }
      })
      .catch(() => {
        if (editField) {
          editField.innerHTML = `<p class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">We couldn’t fetch the current booking details.</p>`;
        }
      });
  }

  const showMessage = (html) => {
    if (!alertsRegion) return;
    alertsRegion.innerHTML = html;
  };

  confirmButton.addEventListener("click", () => {
    if (!state.selectedDate || !state.selectedTime || state.creating) return;
    state.creating = true;
    confirmButton.setAttribute("disabled", "disabled");

    const visitingTime = `${state.selectedDate.isoDate}T${formatTimeForApi(state.selectedTime.label)}Z`;
    const endpoint = isEdit ? `/schedule/api/${scheduleId}/` : "/schedule/api/";
    const method = isEdit ? "PATCH" : "POST";

    const body = new URLSearchParams({
      object_id: assetId,
      content_type_name: assetType,
      visiting_time: visitingTime,
    });

    fetch(endpoint, {
      method,
      headers: {
        "X-CSRFToken": typeof csrfToken !== "undefined" ? csrfToken : "",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to create schedule");
        showMessage(ALERT_SUCCESS(`Successfully ${isEdit ? "updated" : "created"} your schedule.`));
        setTimeout(() => {
          window.location.href = "/dashboard/";
        }, 1400);
      })
      .catch(() => {
        showMessage(ALERT_ERROR("Something went wrong. Please try again."));
      })
      .finally(() => {
        state.creating = false;
        confirmButton.removeAttribute("disabled");
      });
  });
});