import { LitElement, html, css } from "lit";
import "./bar-chart.js";
import "@ui5/webcomponents/dist/DateRangePicker.js";
import "lit-flatpickr";

export class DashboardLayout extends LitElement {
  static properties = {
    dateRange: { type: Array },
  };

  render() {
    return html`
      <div class="container">
        <div class="controls">
          <!-- <ui5-daterange-picker .firstDayOfWeek=3 ></i5-daterange-picker> -->
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
            </sl-button-group>

            <sl-button-group label="Formatting">
              <sl-tooltip content="Bold">
                <sl-button
                  ><sl-icon name="type-bold" label="Bold"></sl-icon
                ></sl-button>
              </sl-tooltip>
              <sl-tooltip content="Italic">
                <sl-button
                  ><sl-icon name="type-italic" label="Italic"></sl-icon
                ></sl-button>
              </sl-tooltip>
              <sl-tooltip content="Underline">
                <sl-button
                  ><sl-icon name="type-underline" label="Underline"></sl-icon
                ></sl-button>
              </sl-tooltip>
            </sl-button-group>

            <sl-button-group label="Alignment">
              <sl-tooltip content="Align Left">
                <sl-button
                  ><sl-icon name="justify-left" label="Align Left"></sl-icon
                ></sl-button>
              </sl-tooltip>
              <sl-tooltip content="Align Center">
                <sl-button
                  ><sl-icon name="justify" label="Align Center"></sl-icon
                ></sl-button>
              </sl-tooltip>
              <sl-tooltip content="Align Right">
                <sl-button
                  ><sl-icon name="justify-right" label="Align Right"></sl-icon
                ></sl-button>
              </sl-tooltip>
            </sl-button-group>
          </div>
        </div>
        <div class="pictograms"></div>
        <div class="overall-graph">
          <bar-chart .dateRange=${this.dateRange}></bar-chart>
        </div>
        <div class="secondary-graph"></div>
        <div class="pg-1">
        </div>
        <div class="pg-2"></div>
        <div class="pg-3"></div>
        <div class="pg-4"></div>
      </div>
    `;
  }

  #datePicker = null;

  handleDateRangeSelect() {
    if (!this.#datePicker) {
      this.#datePicker = this.shadowRoot.querySelector("lit-flatpickr");
    }

    const values = this.#datePicker.getSelectedDates();

    console.log(values);
    // debugger;
    // if (values.length > 10) {
    //   const array = values.split("to");
    //   array.forEach((element) => element.trim());
    //   console.log(array);
    // }
    if (values.length === 2) {
      this.dateRange = values;
    }
  }

  static styles = css`
    .container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 0.2fr 0.9fr 1.5fr 1.4fr 1fr;
      gap: 10px 10px;
      grid-auto-flow: row;
    }

    .controls {
      grid-area: 1 / 1 / 2 / 5;
    }

    .pictograms {
      grid-area: 2 / 1 / 3 / 5;
    }

    .overall-graph {
      grid-area: 3 / 1 / 4 / 3;
    }

    .secondary-graph {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0px 0px;
      grid-auto-flow: row;
      grid-template-areas:
        ". . ."
        ". . ."
        ". . .";
      grid-area: 3 / 3 / 4 / 5;
    }

    .pg-1 {
      grid-area: 2 / 1 / 3 / 2;
    }

    .pg-2 {
      grid-area: 2 / 2 / 3 / 3;
    }

    .pg-3 {
      grid-area: 2 / 3 / 3 / 4;
    }

    .pg-4 {
      grid-area: 2 / 4 / 3 / 5;
    }

    lit-flatpickr {
      cursor: pointer;
      font-size: 38px;
    }

    sl-input {
      width: 20rem;
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
  `;
}

customElements.define("dashboard-layout", DashboardLayout);
