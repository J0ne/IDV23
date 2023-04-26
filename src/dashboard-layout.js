import { LitElement, html, css } from "lit";
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
} from "date-fns";

export class DashboardLayout extends LitElement {
  static styles = css`
    .container {
      display: grid;
      grid-template-columns: 1fr 0.9fr 1fr;
      grid-template-rows: 0.3fr 1fr 1.5fr 1.4fr 1fr;
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

    .pg-4 {
      grid-area: 2 / 3 / 3 / 4;
    }

    .pg-1 {
      grid-area: 2 / 1 / 3 / 2;
    }

    .pie-chart {
      grid-area: 3 / 3 / 4 / 4;
    }

    lit-flatpickr {
      cursor: pointer;
      font-size: 38px;
    }

    sl-input {
      width: 20rem;
    }

    sl-button-group.time-range-buttons {
      margin-top: 6px;
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
  `;

  static properties = {
    dateRange: { type: Array },
    devTypeSummary: { type: Object },
    total: { type: Number },
  };

  constructor() {
    super();

    this.devTypeSummary = null;
    this.total = 0;
  }

  render() {
    return html`
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
              @sl-change=${this.handleDateRangeSelect}
              pill
              type="text"
              placeholder="Select date range"
            ></sl-input>
              </lit-flatpickr>
          </div>

          <sl-button-group class="time-range-buttons" label="Time ranges">
  <sl-button @click=${
    this.lastQuarter
  } size="medium" pill>Last quarter</sl-button>
  <sl-button @click=${this.lastMonth} size="medium" pill>Last month</sl-button>
  <sl-button @click=${
    this.last14days
  } size="medium" pill>Last 14 days</sl-button>
</sl-button-group>
          <div class="button-group-toolbar">
            <sl-button-group label="History">
              <sl-tooltip content="Undo">
                <sl-button
                  ><sl-icon name="arrow-counterclockwise" label="Undo"></sl-icon
                ></sl-button>
              </sl-tooltip>
              <sl-tooltip content="Redo">
                <sl-button
                  ><sl-icon name="arrow-clockwise" label="Redo"></sl-icon
                ></sl-button>
              </sl-tooltip>
          </div>
        </div>
  <div class="pictograms">

  </div>
  <div class="overall-graph">
          <bar-chart @data-changed=${(e) =>
            this.handleDataUpdates(e.detail)} .dateRange=${
      this.dateRange
    }></bar-chart>
  </div>
  <div class="secondary-graph"></div>
   <div class="pg-1">
<sl-card style="width: 275px; height: 275px; position: relative;">
  <sl-icon name="graph-up" style="font-size: 36px; position: absolute; top: 10px; right: 10px;"></sl-icon>
  <div style="font-size: 48px; font-weight: bold; text-align: center;">
    <span style="font-size: 24px; font-weight: normal;">
  ${this.total}
  </span>
  </div>
  <div style="font-size: 16px; font-weight: normal; text-align: center;">
    in total
  </div>
</sl-card>
        </div>
        <div class="pg-2">
        ${
          this.devTypeSummary
            ? this.getSummaryFromEntries(this.devTypeSummary)
            : ""
        }
        </div>
        <div class="pg-3"></div>
  <div class="pg-4"></div>
  <div class="pie-chart">
      <pie-chart .data=${this.devTypeSummary}></pie-chart>
  </div>
</div>


    `;
  }

  handleDataUpdates(dataSummary) {
    this.devTypeSummary = dataSummary.types;
    this.total = dataSummary.total;

    console.log(this.devTypeSummary);
  }

  firstUpdated() {
    this.#datePicker = this.shadowRoot.querySelector("lit-flatpickr");
  }

  #datePicker = null;

  handleDateRangeSelect() {
    const values = this.#datePicker.getSelectedDates();
    if (values.length === 2) {
      this.dateRange = values;
    }
  }

  // last14days function
  last14days() {
    const today = startOfToday();

    const firstDay = subDays(today, 13);

    this.dateRange = [firstDay, today];

    this.#datePicker.setDate(this.dateRange, false);
  }

  // lastMonth function
  lastMonth() {
    const start = startOfMonth(subMonths(startOfToday(), 1));
    const end = endOfMonth(subMonths(startOfToday(), 1));
    this.dateRange = [start, end];
    this.#datePicker.setDate(this.dateRange, false);
  }

  // lastQuarter function
  lastQuarter() {
    const start = startOfQuarter(subQuarters(startOfToday(), 1));
    const end = endOfQuarter(subQuarters(startOfToday(), 1));
    this.dateRange = [start, end];
    this.#datePicker.setDate(this.dateRange, false);
  }

  getSummaryFromEntries(obj) {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      result.push(html`<sl-tag>${key}: ${value}</sl-tag`);
    }
    return result;
  }
}

customElements.define("dashboard-layout", DashboardLayout);
