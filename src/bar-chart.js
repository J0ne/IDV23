import Highcharts from "highcharts";
import { LitElement, html } from "lit";
import { ObservationDataSvc } from "./dataService";

export class BarChart extends LitElement {
  static properties = {
    timeRange: { type: Object },
    count: { type: Number },
    dataset: { type: Array },
    loading: { type: Boolean },
    chartType: { type: String },
  };

  constructor() {
    super();
    this.dataset = [];
    this.count = 0;
    this.data = [];
    this.loading = false;
    this.chartTypes = ["column", "bar", "line", "spline"];
    this.observationsSvc = new ObservationDataSvc();
    this.chartType = "column";
  }

  async connectedCallback() {
    super.connectedCallback();
    // const response = await fetch("../.netlify/functions/read-all");
    // const data = await response.json();
    await this.observationsSvc.init();

    // this.count = this.observationsRaw.length;
    // console.log(this.observationsRaw);

    // const allInRange = this.observationsSvc.getAllInTimeRange(
    //   "2023-01-01",
    //   "2023-04-15"
    // );

    // console.table(allInRange);

    const allDataInTimeLine = this.observationsSvc.getWeeklyData();

    console.table(allDataInTimeLine);
    this.dataset = allDataInTimeLine;
  }

  willUpdate(cProps) {
    console.log(cProps);
    if (cProps.has("dataset") && this.chart) {
      this.updateChart();
    }
  }

  render() {
    return html` <div>
        <sl-button-group @click=${this.setTimeWindow} label="Alignment">
          <sl-button size="small" variant="default">Monthly</sl-button>
          <sl-button size="small" variant="default">Weekly</sl-button>
          <sl-button size="small" variant="default">Daily</sl-button>
        </sl-button-group>
        <sl-divider vertical></sl-divider>
        <sl-button-group @click=${this.handleChartTypeChange} label="Alignment">
          <sl-icon-button
            data-type="column"
            name="bar-chart-line"
            label="Settings"
          ></sl-icon-button>
          <sl-icon-button
            data-type="bar"
            name="bar-chart-steps"
            label="Settings"
          ></sl-icon-button>
          <sl-icon-button
            data-type="inverted-bar"
            name="graph-up"
            label="Settings"
          ></sl-icon-button>
          <sl-icon-button
            data-type="line"
            name="graph-up"
            label="Settings"
          ></sl-icon-button>
        </sl-button-group>
      </div>
      <figure id="barChart"></figure>`;
  }

  firstUpdated() {
    this.initChart();
  }

  setTimeWindow() {
    alert("Not yet implemented");
  }

  handleChartTypeChange(e) {
    const type = e.target.dataset.type;
    if (type === "inverted-bar") {
      this.chart.update({
        chart: { type: "column", inverted: true },
      });
    } else {
      this.chart.update({
        chart: { type, inverted: false },
      });
      // this.chart.series.forEach((s) =>
      //   s.update({
      //     type,
      //   })
      // );
    }
    this.chart.redraw();
  }

  updateChart() {
    const chartData = Object.keys(this.dataset[0].countsByType).map((type) => {
      return {
        name: type,
        data: this.dataset.map((obj) => obj.countsByType[type] || 0),
      };
    });

    this.chart.xAxis[0].update({
      categories: this.dataset.map((i) => i.week),
    });

    this.chart.update({ series: chartData });
  }

  initChart() {
    console.log("render");
    const container = this.renderRoot.getElementById("barChart");
    this.chart = Highcharts.chart(container, {
      credits: {
        enabled: false,
      },
      chart: {
        type: "column",
      },
      title: {
        text: "observation",
        align: "left",
      },
      // label: false,
      plotOptions: {
        column: {
          stacking: "normal",
        },
      },
      xAxis: {
        type: "datetime",
      },
      // xAxis: {
      //   categories: [
      //   ],
      // },
      // yAxis: {
      //   title: {
      //     text: "Million liters",
      //   },
      // },
      // tooltip: {
      //   valueSuffix: "million liters",
      // },
      series: [
        {
          data: [],
          stack: 0,
          // pointInterval: 24 * 3600 * 1000,
        },
        {
          data: [],
          stack: 0,
          // pointInterval: 24 * 3600 * 1000,
        },
        {
          data: [],
          stack: 0,
          // pointInterval: 24 * 3600 * 1000,
        },
        // {
        //   data: [10],
        //   stack: 0,
        // },
      ],
    });
  }
}

customElements.define("bar-chart", BarChart);
