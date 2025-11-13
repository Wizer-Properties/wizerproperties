"use strict";

/**
 * Property Filter Initialization Module
 * 
 * Provides a reusable filter system for property search views.
 * Usage: initPropertyFilters({ container: document.querySelector('#search-filter-box') })
 * 
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.container - Container element for the filter panel (default: #search-filter-box)
 * @param {Object} options.initialState - Initial filter state (default: parsed from URL params)
 * @param {Function} options.onChange - Callback when filters change (default: dispatches propertyFilters:changed event)
 */
(function () {
  const RESIDENCE_SUB_TYPES = [
    { value: "bungalow_villa", label: "Bungalow / Villa" },
    { value: "apartment_condo_service_residence", label: "Apartment / Condo / Service Residence" },
    { value: "semi_detached_house", label: "Semi-detached House" },
    { value: "terrace_link_house", label: "Terrace / Link House" },
    { value: "residential_land", label: "Residential Land" },
  ];

  const COMMERCIAL_SUB_TYPES = [
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "agricultural_land", label: "Agricultural Land" },
    { value: "other", label: "Other" },
  ];

  class FilterData {
    constructor(initial = {}) {
      this.min_price = this.#normalize(initial.min_price);
      this.max_price = this.#normalize(initial.max_price);
      this.min_number_of_bedroom = this.#normalize(initial.min_number_of_bedroom);
      this.max_number_of_bedroom = this.#normalize(initial.max_number_of_bedroom);
      this.nearby = this.#normalize(initial.nearby);
      this.min_unit_area = this.#normalize(initial.min_unit_area);
      this.max_unit_area = this.#normalize(initial.max_unit_area);
      this.number_of_bathroom = this.#normalize(initial.number_of_bathroom);
      this.building__quota = this.#normalize(initial.building__quota);
      this.building__furnishing = this.#normalize(initial.building__furnishing);
      this.building__status = this.#normalize(initial.building__status);
      this.building__have_freehold = Boolean(initial.building__have_freehold);
      this.building__have_leasehold = Boolean(initial.building__have_leasehold);
      this.building__type = initial.building__type || "";
      this.building__sub_type = Array.isArray(initial.building__sub_type)
        ? [...initial.building__sub_type]
        : [];
      this.platform = window.innerWidth >= 768 ? "web" : "";
    }

    #normalize(value) {
      return value === null || value === undefined || value === "" ? null : String(value);
    }

    setValue(key, value) {
      if (key === "building__type") {
        this.building__type = value || "";
        this.building__sub_type = [];
        return;
      }

      if (key === "building__sub_type") {
        if (!value) {
          this.building__sub_type = [];
        }
        return;
      }

      if (key === "building__have_freehold" || key === "building__have_leasehold") {
        this.toggleOwnership(key);
        return;
      }

      this[key] = this.#normalize(value);
    }

    toggleSubtype(value, allowMultiple) {
      if (!value) return;
      if (!allowMultiple) {
        this.building__sub_type = [value];
            return;
      }
      const exists = this.building__sub_type.includes(value);
      if (exists) {
        this.building__sub_type = this.building__sub_type.filter((item) => item !== value);
      } else {
        this.building__sub_type = [...this.building__sub_type, value];
      }
    }

    toggleButton(key, value) {
      if (this[key] === value) {
        this[key] = null;
        return false;
      }
      this[key] = value;
      return true;
    }

    toggleOwnership(key) {
      if (key === "building__have_freehold") {
        this.building__have_freehold = !this.building__have_freehold;
        if (this.building__have_freehold) this.building__have_leasehold = false;
      }
      if (key === "building__have_leasehold") {
        this.building__have_leasehold = !this.building__have_leasehold;
        if (this.building__have_leasehold) this.building__have_freehold = false;
      }
    }

    clearGroup(group) {
      switch (group) {
        case "price":
          this.min_price = null;
          this.max_price = null;
          break;
        case "bedrooms":
          this.min_number_of_bedroom = null;
          this.max_number_of_bedroom = null;
                break;
        case "property-type":
          this.building__type = "";
          this.building__sub_type = [];
                break;
        default:
                break;
      }
    }

    clearAll() {
      Object.keys(this).forEach((key) => {
        if (key === "platform") {
          this.platform = window.innerWidth >= 768 ? "web" : "";
        } else if (key === "building__sub_type") {
          this.building__sub_type = [];
        } else if (typeof this[key] === "boolean") {
          this[key] = false;
        } else {
          this[key] = null;
        }
      });
      this.building__type = "";
    }

    only_has_value() {
      const result = {};
      Object.entries(this).forEach(([key, value]) => {
        if (key === "platform") return;
        if (Array.isArray(value) && value.length) {
          result[key] = value.join(",");
        } else if (typeof value === "boolean") {
          if (value) result[key] = "true";
        } else if (value !== null && value !== undefined && value !== "") {
          result[key] = value;
        }
      });
      if (window.innerWidth >= 768) {
        result.platform = "web";
      }
      return result;
    }
  }

  class FilterController {
    constructor(data, container, onChange) {
      this.data = data;
      this.container = container;
      this.onChange = onChange || this.defaultOnChange.bind(this);
      this.activePopover = null;
      this.activeTrigger = null;
      this.subTypeContainer = null;
      this.modalOpen = false;
      this.modalTrigger = null;
      this.previousFocus = null;
      this.dialogElement = null;
      this.focusTrapHandler = null;
      this.modalFocusable = [];
      this.firstFocusable = null;
      this.lastFocusable = null;
      this.dom = {};
    }

    defaultOnChange(trigger, filters) {
      document.dispatchEvent(
        new CustomEvent("propertyFilters:changed", {
          detail: {
            trigger,
            filters,
          },
        })
      );
    }

    init() {
      this.initDOM();
      if (!this.dom.triggerGroup) {
        console.warn("Property filter panel not found in container");
        return;
      }
      this.renderSubTypes(this.data.building__type || "residence");
      this.restoreSelections();
      this.attachEvents();
      this.updateUI();
    }

    initDOM() {
      this.dom = {
        triggerGroup: this.container.querySelector("[data-filter-trigger-group]"),
        popoverWrapper: this.container.querySelector("[data-filter-popovers]"),
        popovers: this.container.querySelectorAll("[data-filter-popover]") || [],
        modal: this.container.querySelector("[data-filter-modal]") || null,
        activeChips: this.container.querySelector("[data-active-filter-chips]") || null,
        filterLabels: this.container.querySelectorAll("[data-filter-label]") || [],
        locationClear: this.container.querySelector("[data-filter-clear-location]") || null,
        locationInput: this.container.querySelector("#gm-search-input") || document.getElementById("gm-search-input"),
        resetButtons: this.container.querySelectorAll("[data-filter-reset]") || [],
      };
      this.subTypeContainer = this.container.querySelector("[data-filter-subtype-list]");
    }

    attachEvents() {
      if (this.dom.triggerGroup) {
        this.dom.triggerGroup.addEventListener("click", (event) => {
          const trigger = event.target.closest("[data-filter-trigger]");
          if (!trigger) return;
          const targetName = trigger.getAttribute("data-filter-trigger");
          if (targetName === "more") {
            this.openModal(trigger);
            return;
          }
          this.togglePopover(targetName, trigger);
        });
      }

      if (this.dom.popoverWrapper) {
        this.dom.popoverWrapper.addEventListener("change", (event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
          if (!target.hasAttribute("data-filter-input")) return;
          this.handleInputChange(target);
        });

        this.dom.popoverWrapper.addEventListener("click", (event) => {
          const closeButton = event.target.closest("[data-filter-close]");
          if (closeButton) {
            this.closeActivePopover(true);
          }
          const clearButton = event.target.closest("[data-filter-clear]");
          if (clearButton) {
            const group = clearButton.getAttribute("data-filter-clear");
            this.data.clearGroup(group);
            this.restoreSelections();
            this.updateUI();
            this.notifyChange(group);
          }
          const applyButton = event.target.closest("[data-filter-apply]");
          if (applyButton) {
            this.closeActivePopover(true);
            this.notifyChange("apply");
          }
        });
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          if (this.modalOpen) {
            event.preventDefault();
            this.closeModal();
            return;
          }
          if (this.activePopover) {
            event.preventDefault();
            this.closeActivePopover(true);
          }
        }
      });

      document.addEventListener("click", (event) => {
        if (!this.activePopover) return;
        const isInsidePopover = event.target.closest("[data-filter-popover]");
        const isTrigger = event.target.closest("[data-filter-trigger]");
        if (!isInsidePopover && !isTrigger) {
          this.closeActivePopover();
        }
      });

      if (this.dom.modal) {
        this.dom.modal.addEventListener("click", (event) => {
          const close = event.target.closest("[data-filter-close]");
          if (close && this.modalOpen) {
            this.closeModal();
          }
          const toggleButton = event.target.closest("[data-filter-toggle]");
          if (toggleButton) {
            this.handleToggle(toggleButton);
          }
          const applyButton = event.target.closest("[data-filter-apply]");
          if (applyButton) {
            this.closeModal();
            this.notifyChange("apply");
          }
          const resetButton = event.target.closest("[data-filter-reset]");
          if (resetButton) {
            this.data.clearAll();
            this.restoreSelections();
            this.updateUI();
            this.notifyChange("reset");
          }
        });

        this.dom.modal.querySelectorAll("[data-filter-input]").forEach((input) => {
          input.addEventListener("change", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLSelectElement)) return;
            this.handleInputChange(target);
          });
        });
      }

      if (this.dom.activeChips) {
        this.dom.activeChips.addEventListener("click", (event) => {
          const chip = event.target.closest("button[data-remove-filter]");
          if (!chip) return;
          const key = chip.getAttribute("data-remove-filter");
          this.removeFilterByKey(key);
          this.restoreSelections();
          this.updateUI();
          this.notifyChange("chip-remove");
        });
      }

      this.dom.resetButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.data.clearAll();
          this.restoreSelections();
          this.updateUI();
          this.notifyChange("reset");
        });
      });

      if (this.dom.locationClear && this.dom.locationInput) {
        this.dom.locationClear.addEventListener("click", () => {
          this.dom.locationInput.value = "";
          this.dom.locationInput.dispatchEvent(new Event("change"));
        });
      }

      window.addEventListener("resize", () => {
        this.data.platform = window.innerWidth >= 768 ? "web" : "";
      });
    }

    handleInputChange(target) {
      const { name, value, type } = target;
      if (name === "building__type") {
        this.data.setValue(name, value);
        this.renderSubTypes(value || "residence");
        this.restoreSubTypeSelection();
      } else if (name === "building__sub_type") {
        const allowMultiple = this.data.building__type === "commercial";
        const selectedValue = target.value;
        this.data.toggleSubtype(selectedValue, allowMultiple);
        if (!allowMultiple) {
          this.subTypeContainer.querySelectorAll("input[name='building__sub_type']").forEach((input) => {
            input.checked = input.value === selectedValue;
          });
        }
      } else if (name === "min_price" || name === "max_price" || name === "min_number_of_bedroom" || name === "max_number_of_bedroom" || name === "nearby" || name === "min_unit_area" || name === "max_unit_area" || name === "number_of_bathroom") {
        this.data.setValue(name, value);
      } else if (name === "building__have_freehold" || name === "building__have_leasehold") {
        this.data.setValue(name, value);
      }
      if (type !== "radio" && name !== "building__sub_type") {
        this.notifyChange(name);
      }
      this.updateUI();
    }

    handleToggle(button) {
      const key = button.getAttribute("name");
      const value = button.getAttribute("value");
      if (!key) return;
      if (key === "building__have_freehold" || key === "building__have_leasehold") {
        this.data.setValue(key, value);
      } else {
        this.data.toggleButton(key, value);
      }
      this.updateToggleStates();
      this.notifyChange(key);
    }

    removeFilterByKey(key) {
      switch (key) {
        case "min_price":
        case "max_price":
          this.data.min_price = null;
          this.data.max_price = null;
          break;
        case "nearby":
          this.data.nearby = null;
          break;
        case "bedrooms":
          this.data.min_number_of_bedroom = null;
          this.data.max_number_of_bedroom = null;
          break;
        case "property":
          this.data.building__type = "";
          this.data.building__sub_type = [];
          break;
        case "unit_area":
          this.data.min_unit_area = null;
          this.data.max_unit_area = null;
          break;
        default:
          if (key in this.data) {
            if (typeof this.data[key] === "boolean") this.data[key] = false;
            else this.data[key] = null;
          }
          break;
      }
    }

    togglePopover(name, trigger) {
      if (this.activePopover && this.activePopover.dataset.filterPopover === name) {
        this.closeActivePopover();
        return;
      }
      this.closeActivePopover();
      const popover = this.getPopoverByName(name);
      if (!popover) return;
      popover.hidden = false;
      popover.setAttribute("aria-hidden", "false");
      trigger?.classList.add("border-primary", "text-primary");
      trigger?.setAttribute("aria-expanded", "true");
      this.activePopover = popover;
      this.activeTrigger = trigger;
      const focusTarget = popover.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      focusTarget?.focus();
    }

    closeActivePopover(restoreFocus = false) {
      if (!this.activePopover) return;
      this.activePopover.hidden = true;
      this.activePopover.setAttribute("aria-hidden", "true");
      if (this.activeTrigger) {
        this.activeTrigger.classList.remove("border-primary", "text-primary");
        this.activeTrigger.setAttribute("aria-expanded", "false");
        if (restoreFocus) {
          this.activeTrigger.focus();
        }
      }
      this.activePopover = null;
      this.activeTrigger = null;
    }

    getPopoverByName(name) {
      return Array.from(this.dom.popovers).find((popover) => popover.dataset.filterPopover === name) || null;
    }

    openModal(trigger) {
      if (!this.dom.modal || this.modalOpen) return;
      this.dom.modal.hidden = false;
      this.dom.modal.classList.remove("hidden");
      this.dom.modal.classList.add("flex");
      const dialog = this.dom.modal.querySelector("[role='dialog'][tabindex='-1']") || this.dom.modal;
      this.previousFocus = document.activeElement;
      this.dialogElement = dialog;
      const focusableSelectors = "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
      this.modalFocusable = Array.from(dialog.querySelectorAll(focusableSelectors));
      this.firstFocusable = this.modalFocusable[0] || dialog;
      this.lastFocusable = this.modalFocusable[this.modalFocusable.length - 1] || dialog;
      this.firstFocusable.focus({ preventScroll: true });
      this.focusTrapHandler = (event) => {
        if (event.key !== "Tab") return;
        if (this.modalFocusable.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (event.shiftKey) {
          if (document.activeElement === this.firstFocusable) {
            event.preventDefault();
            this.lastFocusable.focus();
          }
        } else if (document.activeElement === this.lastFocusable) {
          event.preventDefault();
          this.firstFocusable.focus();
        }
      };
      dialog.addEventListener("keydown", this.focusTrapHandler);
      document.body.classList.add("overflow-hidden");
      this.dom.modal.setAttribute("aria-hidden", "false");
      if (trigger) {
        this.modalTrigger = trigger;
        trigger.setAttribute("aria-expanded", "true");
      }
      this.modalOpen = true;
    }

    closeModal() {
      if (!this.dom.modal || !this.modalOpen) return;
      this.dom.modal.classList.remove("flex");
      this.dom.modal.classList.add("hidden");
      this.dom.modal.hidden = true;
      this.dom.modal.setAttribute("aria-hidden", "true");
      const dialog = this.dialogElement;
      if (dialog && this.focusTrapHandler) {
        dialog.removeEventListener("keydown", this.focusTrapHandler);
      }
      document.body.classList.remove("overflow-hidden");
      this.modalOpen = false;
      if (this.modalTrigger) {
        this.modalTrigger.setAttribute("aria-expanded", "false");
      }
      const focusTarget = this.previousFocus || this.modalTrigger;
      focusTarget?.focus({ preventScroll: true });
      this.previousFocus = null;
      this.modalTrigger = null;
      this.dialogElement = null;
    }

    renderSubTypes(type) {
      if (!this.subTypeContainer) return;
      const items = type === "commercial" ? COMMERCIAL_SUB_TYPES : RESIDENCE_SUB_TYPES;
      const allowMultiple = type === "commercial";
      const inputType = allowMultiple ? "checkbox" : "radio";
      this.subTypeContainer.innerHTML = items
        .map(
          ({ value, label }) => `
            <label class="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                <input type="${inputType}" name="building__sub_type" value="${value}" class="size-4 border-border text-primary focus:ring-primary/40" data-filter-input>
                <span>${label}</span>
            </label>
          `
        )
        .join("");
    }

    restoreSubTypeSelection() {
      if (!this.subTypeContainer) return;
      const allowMultiple = this.data.building__type === "commercial";
      this.subTypeContainer.querySelectorAll("input[name='building__sub_type']").forEach((input) => {
        const isChecked = allowMultiple
          ? this.data.building__sub_type.includes(input.value)
          : this.data.building__sub_type[0] === input.value;
        input.checked = isChecked;
      });
    }

    restoreSelections() {
      if (!this.dom.popoverWrapper) return;
      this.dom.popoverWrapper.querySelectorAll("[data-filter-input]").forEach((input) => {
        if (!(input instanceof HTMLSelectElement || input instanceof HTMLInputElement)) return;
        const { name, type } = input;
        if (name === "building__type") {
          input.checked = this.data.building__type === input.value;
        } else if (name === "building__sub_type") {
          // handled separately after render
        } else if (typeof this.data[name] === "boolean") {
          if (name === "building__have_freehold") {
            input.checked = this.data.building__have_freehold;
          }
          if (name === "building__have_leasehold") {
            input.checked = this.data.building__have_leasehold;
          }
        } else {
          input.value = this.data[name] ?? "";
        }
      });

      if (this.dom.modal) {
        this.dom.modal.querySelectorAll("[data-filter-input]").forEach((input) => {
          if (!(input instanceof HTMLSelectElement)) return;
          input.value = this.data[input.name] ?? "";
        });
      }

      this.restoreSubTypeSelection();
      this.updateToggleStates();
    }

    updateToggleStates() {
      if (!this.dom.modal) return;
      this.dom.modal.querySelectorAll("[data-filter-toggle]").forEach((button) => {
        const key = button.getAttribute("name");
        const value = button.getAttribute("value");
        let isActive = false;
        if (key === "building__have_freehold") {
          isActive = this.data.building__have_freehold;
        } else if (key === "building__have_leasehold") {
          isActive = this.data.building__have_leasehold;
        } else if (key && value) {
          isActive = this.data[key] === value;
        }
        button.classList.toggle("border-primary", isActive);
        button.classList.toggle("text-primary", isActive);
        button.classList.toggle("bg-primary/10", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    updateUI() {
      this.updateLabels();
      this.updateActiveChips();
      this.updateToggleStates();
    }

    updateLabels() {
      this.dom.filterLabels.forEach((label) => {
        const key = label.getAttribute("data-filter-label");
        if (!key) return;
        switch (key) {
          case "radius":
            label.textContent = this.data.nearby ? `Within ${this.data.nearby} km` : "Radius";
            break;
          case "price":
            label.textContent = this.formatPriceLabel();
            break;
          case "bedrooms":
            label.textContent = this.formatBedroomLabel();
            break;
          case "property-type":
            label.textContent = this.data.building__type ? this.data.building__type.replace("_", " ").replace(/\b\w/g, (chr) => chr.toUpperCase()) : "Property type";
            break;
          default:
            break;
        }
      });
    }

    formatPriceLabel() {
      if (!this.data.min_price && !this.data.max_price) return "Price";
      const min = this.data.min_price ? this.formatCurrency(this.data.min_price) : "Min";
      const max = this.data.max_price ? this.formatCurrency(this.data.max_price) : "Max";
      return `${min} - ${max}`;
    }

    formatBedroomLabel() {
      if (!this.data.min_number_of_bedroom && !this.data.max_number_of_bedroom) return "Bedrooms";
      const min = this.data.min_number_of_bedroom || "Any";
      const max = this.data.max_number_of_bedroom || "Any";
      return `${min} - ${max}`;
    }

    formatCurrency(value) {
      const number = Number(value || 0);
      if (!number) return "฿ 0";
      if (number >= 1000000000) return `฿ ${(number / 1000000000).toFixed(1)}B`;
      if (number >= 1000000) return `฿ ${(number / 1000000).toFixed(1)}M`;
      if (number >= 1000) return `฿ ${(number / 1000).toFixed(1)}k`;
      return `฿ ${number.toLocaleString()}`;
    }

    updateActiveChips() {
      if (!this.dom.activeChips) return;
      const fragments = document.createDocumentFragment();
      const filters = this.data.only_has_value();

      const addChip = (key, label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive";
        button.setAttribute("data-remove-filter", key);
        button.innerHTML = `${label} <i class="bi bi-x-circle"></i>`;
        fragments.appendChild(button);
      };

      if (filters.nearby) addChip("nearby", `Within ${filters.nearby} km`);
      if (filters.min_price || filters.max_price) addChip("min_price", this.formatPriceLabel());
      if (filters.min_number_of_bedroom || filters.max_number_of_bedroom) addChip("bedrooms", this.formatBedroomLabel());
      if (filters.building__type) addChip("property", `Type: ${filters.building__type}`);
      if (filters.min_unit_area || filters.max_unit_area) addChip("unit_area", `Unit: ${(filters.min_unit_area || "Min")} - ${(filters.max_unit_area || "Max")} sqm`);
      if (filters.number_of_bathroom) addChip("number_of_bathroom", `${filters.number_of_bathroom}+ baths`);
      if (filters.building__quota) addChip("building__quota", `Quota: ${filters.building__quota}`);
      if (filters.building__furnishing) addChip("building__furnishing", `Furnishing: ${filters.building__furnishing}`);
      if (filters.building__status) addChip("building__status", `Status: ${filters.building__status}`);
      if (filters.building__have_freehold) addChip("building__have_freehold", "Freehold");
      if (filters.building__have_leasehold) addChip("building__have_leasehold", "Leasehold");

      this.dom.activeChips.innerHTML = "";
      this.dom.activeChips.appendChild(fragments);
    }

    notifyChange(trigger) {
      this.onChange(trigger, this.data.only_has_value());
    }

    getFilters() {
      return this.data.only_has_value();
    }

    getFilterData() {
      return this.data;
    }
  }

  /**
   * Initialize property filters
   * @param {Object} options - Configuration options
   * @returns {FilterController} - The filter controller instance
   */
  function initPropertyFilters(options = {}) {
    const container = options.container || document.getElementById("search-filter-box");
    if (!container) {
      console.warn("Property filter container not found");
      return null;
    }

    // Parse initial state from URL or use provided state
    let initialState = options.initialState;
    if (!initialState) {
      const urlParams = new URL(window.location.href).searchParams;
      const initialSubType = urlParams.get("building__sub_type");
      initialState = {
        min_price: urlParams.get("min_price"),
        max_price: urlParams.get("max_price"),
        min_number_of_bedroom: urlParams.get("min_number_of_bedroom"),
        max_number_of_bedroom: urlParams.get("max_number_of_bedroom"),
        building__type: urlParams.get("building__type") || "",
        building__sub_type: initialSubType ? initialSubType.split(",") : [],
        nearby: urlParams.get("nearby"),
        min_unit_area: urlParams.get("min_unit_area"),
        max_unit_area: urlParams.get("max_unit_area"),
        number_of_bathroom: urlParams.get("number_of_bathroom"),
        building__quota: urlParams.get("building__quota"),
        building__furnishing: urlParams.get("building__furnishing"),
        building__status: urlParams.get("building__status"),
        building__have_freehold: urlParams.get("building__have_freehold") === "true",
        building__have_leasehold: urlParams.get("building__have_leasehold") === "true",
      };
    }

    const filterData = new FilterData(initialState);
    const controller = new FilterController(filterData, container, options.onChange);
    controller.init();

    // Expose filter data globally for backward compatibility
    window.filter_data = filterData;

    return controller;
  }

  // Auto-initialize if filter panel exists (backward compatibility)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("search-filter-box");
      if (container) {
        initPropertyFilters({ container });
      }
    });
  } else {
    const container = document.getElementById("search-filter-box");
    if (container) {
      initPropertyFilters({ container });
    }
  }

  // Export for use in other modules
  window.initPropertyFilters = initPropertyFilters;
})();

