import { LitElement, html, css } from "lit";
import { classMap } from "lit/directives/class-map.js";
import "./bar-chart.js";
import "./pie-chart.js";
import "lit-flatpickr";
import "./dataService.js";
import {
  startOfToday,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  subQuarters,
  format,
} from "date-fns";

const predefinedDates = {
  lastQuarter: "lastQuarter",
  last14: "last14",
  lastMonth: "lastMonth",
};

export class DashboardLayout extends LitElement {
  static properties = {
    dateRange: { type: Array },
    devTypeSummary: { type: Object },
    total: { type: Number },
    filters: { type: Array },
    activeFilter: { type: String },
    selectedRange: { type: String },
    loading: { type: Boolean },
    darkMode: { type: Boolean },
  };

  constructor() {
    super();

    this.devTypeSummary = null;
    this.total = 0;
    this.filters = [];
    this.activeFilter = "";
    this.selectedRange = "";
    this.loading = true;
    this.darkMode = false;
  }

  willUpdate(changedProps) {
    if (
      changedProps.has("activeFilter") &&
      this.activeFilter === "" &&
      this.#barChart
    ) {
      this.#barChart.toggleObservationVisibility(this.activeFilter);
    }
  }

  render() {
    return html`
      <header>
        <sl-switch size="small" @sl-change=${this._setViewMode}
              >
        ${!this.darkMode ? "Dark" : "Light"}
      </sl-switch>
      <h3>Observation Dashboard</h3>

      <sl-alert class="data-info" closable open>
  <sl-icon slot="icon" name="info-circle"></sl-icon>
 The dataset covers the period from December 2022 to the April 2023.
</sl-alert>
    </header>
  <div class="container">

     <div class="controls">
          <!-- <ui5-daterange-picker .firstDayOfWeek=3 ></i5-daterange-picker> -->
          <div class="date-range">
             <lit-flatpickr
            id="my-date-picker"
            mode="range"
            altFormat="F j, Y"
            dateFormat: "YYYY-MM-DD",
            theme="material_green"
            minDate="2022-12"
          >
            <sl-input
             class="${this.darkMode ? "dark" : ""}"
              @sl-change=${this.handleDateRangeSelect}
              pill
              type="text"
              placeholder="Select a custom date range"
            ></sl-input>
              </lit-flatpickr>
          </div>
                  <sl-button-group class="time-range-buttons" label="Time ranges">
          <sl-button variant="primary" @click=${this.lastQuarter}
          ?outline=${this.selectedRange !== predefinedDates.lastQuarter}
          size="medium" pill>Last quarter</sl-button>
  <sl-button variant="primary" @click=${this.lastMonth}
  size="medium" pill ?outline=${
    this.selectedRange !== predefinedDates.lastMonth
  }>Last month</sl-button>
  <sl-button variant="primary" @click=${this.last14days}
   ?outline=${this.selectedRange !== predefinedDates.last14}
  size="medium" pill>Last 14 days</sl-button>
</sl-button-group>
<div class="date-range-labels">
  ${
    this.dateRange?.length && this.dateRange.length === 2
      ? html` <label for="dates">From:</label>
          <sl-tag name="dates" size="large"
            >${format(new Date(this.dateRange[0]), "dd.MM.yyyy")}</sl-tag
          >
          <label for="dates">to:</label>
          <sl-tag name="dates" size="large"
            >${format(new Date(this.dateRange[1]), "dd.MM.yyyy")}</sl-tag
          >`
      : ""
  }

</div>
${
  this.filters?.length && this.filters.length > 1 ? this.getFilterButtons() : ""
}
        </div>
  <div class="pictograms">

  </div>
  <div class="overall-graph">
          <bar-chart .darkMode=${this.darkMode}  @data-changed=${(e) =>
      this.handleDataUpdates(e.detail)} .dateRange=${
      this.dateRange
    }></bar-chart>
  </div>
  <div class="secondary-graph"></div>
   <div class="pg-1">
    ${this.getMegaMetric(this.total, "total", "calendar-range", "all")}
        </div>
        <div class="pg-2">
        ${this.getMegaMetric(
          this.highObservations,
          "high",
          "exclamation-octagon",
          "high"
        )}
        </div>
        <div class="pg-3">
           ${this.getMegaMetric(
             this.criticalObservations,
             "critical",
             "radioactive",
             "critical"
           )}
        </div>

  <div class="pie-chart">
      <pie-chart .darkMode=${this.darkMode} .data=${
      this.devTypeSummary
    }></pie-chart>
  </div>
</div>
    `;
  }

  shouldShow() {
    return this.dateRange?.length === 2;
  }

  _setViewMode(e) {
    this.darkMode = e.target.checked;
    if (this.darkMode) {
      document.head.parentElement.classList.add("sl-theme-dark");
    } else {
      document.head.parentElement.classList.remove("sl-theme-dark");
    }
  }

  toggleObservationVisibility(e) {
    const filterType = e.target.id;
    if (this.activeFilter === filterType) {
      this.activeFilter = "";
    } else {
      this.activeFilter = filterType;
    }

    this.#barChart.toggleObservationVisibility(this.activeFilter);
    this.#pieChart.toggleObservationVisibility(this.activeFilter);
  }

  getFilterButtons() {
    return html`
      <sl-button-group
        class="filter-buttons"
        @click=${this.toggleObservationVisibility}
      >
        ${this.filters.map(
          (f) =>
            html` <sl-button
              ?outline=${this.activeFilter !== f}
              variant=${this.getVariantByType(f)}
              pill
              id=${f}
              >${f}</sl-button
            >`
        )}
      </sl-button-group>
    `;
  }

  getVariantByType(type) {
    switch (type) {
      case "CRITICAL":
        return "danger";
      case "HIGH":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "primary";
    }
  }

  getMegaMetric(value, type, iconName, header) {
    if (this.loading) {
      return html` <sl-skeleton effect="pulse"></sl-skeleton>`;
    }
    if (!this.shouldShow()) {
      return "";
    }

    const classes = {
      "metrics-tile mega-metric total": type === "total",
      "metrics-tile mega-metric critical": type === "critical",
      "metrics-tile mega-metric high": type === "high",
    };

    return html`<sl-card class=${classMap(classes)}>
      <sl-icon name=${iconName} class="metric-icon"></sl-icon>
      <span style="font-size: 18px;">${header.toUpperCase()}</span>
      <div style="font-weight: bold; text-align: center;">
        <span class="">${value}</span>
      </div>
      <div style="font-size: 16px; font-weight: normal; text-align: center;">
        in total
      </div>
    </sl-card>`;
  }

  handleDataUpdates(dataSummary) {
    this.devTypeSummary = dataSummary.types;
    this.total = dataSummary.total;

    this.criticalObservations = this.devTypeSummary["CRITICAL"] ?? 0;
    this.highObservations = this.devTypeSummary["HIGH"] ?? 0;
    this.filters = Object.keys(dataSummary.types);
  }

  firstUpdated() {
    this.#datePicker = this.shadowRoot.querySelector("lit-flatpickr");
    this.#barChart = this.shadowRoot.querySelector("bar-chart");
    this.#pieChart = this.shadowRoot.querySelector("pie-chart");
    setTimeout(() => {
      // initialize with last month's data
      this.loading = false;
      this.lastMonth();
    }, 1000);
  }

  #datePicker = null;
  #barChart = null;
  #pieChart = null;

  handleDateRangeSelect() {
    const values = this.#datePicker.getSelectedDates();
    if (values.length === 2) {
      if (values[0].getTime() === values[1].getTime()) {
        const date = new Date(values[1]).setHours(23, 59);
        values[1] = new Date(date);
      }
      this.selectedRange = "";
      this.dateRange = values;
    }
  }

  // last14days function
  last14days() {
    this.activeFilter = "";
    this.selectedRange = predefinedDates.last14;
    const today = startOfToday();
    const firstDay = subDays(today, 13);
    this.dateRange = [firstDay, today];
    this.#datePicker.setDate(this.dateRange, false);
  }

  // lastMonth function
  lastMonth() {
    this.activeFilter = "";
    this.selectedRange = predefinedDates.lastMonth;
    const start = startOfMonth(subMonths(startOfToday(), 1));
    const end = endOfMonth(subMonths(startOfToday(), 1));
    this.dateRange = [start, end];
    this.#datePicker.setDate(this.dateRange, false);
  }

  // lastQuarter function
  lastQuarter() {
    this.activeFilter = "";
    this.selectedRange = predefinedDates.lastQuarter;
    const start = startOfQuarter(subQuarters(startOfToday(), 1));
    const end = endOfQuarter(subQuarters(startOfToday(), 1));
    this.dateRange = [start, end];
    this.#datePicker.setDate(this.dateRange, false);
  }

  static styles = css`
    :root,
    :host,
    .sl-theme-light {
      /* your custom styles here */
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 400;

      // color-scheme: light dark;
      // color: rgba(255, 255, 255, 0.87);
      // background-color: #242424;

      // font-synthesis: none;
      // text-rendering: optimizeLegibility;
      // -webkit-font-smoothing: antialiased;
      // -moz-osx-font-smoothing: grayscale;
      // -webkit-text-size-adjust: 100%;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 0.9fr 1fr;
      grid-template-rows: 0.3fr 0.7fr 1.5fr;
      gap: 10px 10px;
      grid-auto-flow: row;
    }

    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 0px 4px;
      grid-auto-flow: row;
      grid-template-areas: ". . . .";
      grid-area: 1 / 1 / 2 / 4;
    }

    .pictograms {
      grid-area: 2 / 1 / 3 / 4;
    }

    .overall-graph {
      grid-area: 3 / 1 / 4 / 3;
    }

    .secondary-graph {
      display: grid;
      grid-auto-columns: 1fr;
      gap: 0px 0px;
      grid-auto-flow: row;
      grid-area: 3 / 3 / 4 / 4;
    }

    .pg-2 {
      grid-area: 2 / 2 / 3 / 3;
    }

    .pg-3 {
      grid-area: 2 / 3 / 3 / 4;
    }

    .pg-1 {
      grid-area: 2 / 1 / 3 / 2;
    }

    .pie-chart {
      grid-area: 3 / 3 / 4 / 4;
    }

    div[class^="pg-"] {
      padding: 10px;
    }

    lit-flatpickr {
      cursor: pointer;
      font-size: 38px;
    }

    sl-input {
      width: 20rem;
    }

    .dark {
      background: black;
    }

    sl-button-group.time-range-buttons,
    sl-button-group.filter-buttons {
      margin-top: 6px;
    }

    .time-range-buttons {
      float: right;
    }

    .button-group-toolbar sl-button-group:not(:last-of-type) {
      margin-right: var(--sl-spacing-x-small);
    }

    .card-header {
      max-width: 300px;
    }

    .card-header [slot="header"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-header h3 {
      margin: 0;
    }

    .card-header sl-icon-button {
      font-size: var(--sl-font-size-medium);
    }

    .date-range-picker {
      grid-area: 2 / 3 / 3 / 4;
    }

    .date-range-labels {
      margin-top: 6px;
      padding: 4px;
    }

    .date-range {
      margin-top: -6px;
    }

    .metrics-tile {
      width: 100%;
    }

    sl-card.critical::part(base) {
      background-color: var(--sl-color-danger-400);
    }
    sl-card.high::part(base) {
      background-color: var(--sl-color-warning-400);
    }
    sl-card.total::part(base) {
      background-color: var(--sl-color-primary-100);
    }

    .mega-metric {
      font-size: var(--sl-font-size-4x-large);
    }

    .metric-icon {
      font-size: 36px;
      position: relative;
      top: -25px;
      right: 5px;
    }

    .data-info::part(base) {
      position: absolute;
      top: -5px;
      right: 30%;
      background-color: white;
    }

    sl-skeleton {
      display: inline-block;
      width: 100%;
      height: 13rem;
      margin-right: 0.5rem;
      --border-radius: 0;
    }

    sl-switch {
      float: right;
    }
  `;
}

customElements.define("dashboard-layout", DashboardLayout);
