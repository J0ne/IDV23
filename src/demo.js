import { LitElement } from "lit";

class Demo extends LitElement {
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
              placeholder="Select a custom date range"
            ></sl-input>
              </lit-flatpickr>
          </div>
                  <sl-button-group class="time-range-buttons" label="Time ranges">
          <sl-button @click=${
            this.lastQuarter
          } size="medium" pill>Last quarter</sl-button>
  <sl-button @click=${this.lastMonth}
  size="medium" pill>Last month</sl-button>
  <sl-button @click=${
    this.last14days
  } size="medium" pill>Last 14 days</sl-button>
</sl-button-group>
${
  this.filters?.length && this.filters.length > 1 ? this.getFilterButtons() : ""
}

<div class="date-range-labels">
  ${
    this.dateRange?.length && this.dateRange.length === 2
      ? html` <label for="dates">From:</label>
          <sl-tag pill variant="success" name="dates" size="large"
            >${format(new Date(this.dateRange[0]), "dd.MM.yyyy")}</sl-tag
          >
          <label for="dates">to:</label>
          <sl-tag pill variant="success" name="dates" size="large"
            >${format(new Date(this.dateRange[1]), "dd.MM.yyyy")}</sl-tag
          >`
      : ""
  }

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
      <pie-chart .data=${this.devTypeSummary}></pie-chart>
  </div>
</div>
    `;
  }
}
