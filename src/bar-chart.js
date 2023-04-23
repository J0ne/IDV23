import Highcharts from "highcharts";
import "highcharts/modules/no-data-to-display.js";
import { LitElement, html, css } from "lit";
import { ObservationDataSvc } from "./dataService";

export class BarChart extends LitElement {
  static properties = {
    dateRange: { type: Array },
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
    this.dateRange = [
      new Date(new Date().getMilliseconds() - 1000 * 60 * 24 * 14),
      new Date(),
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    // const response = await fetch("../.netlify/functions/read-all");
    // const data = await response.json();
    await this.observationsSvc.init();
  }

  willUpdate(cProps) {
    console.log(cProps);
    if (cProps.has("dataset") && this.chart) {
      this.updateChart();
    }
    if (cProps.has("dateRange")) {
      if (this.dateRange?.length === 2) {
        const data = this.observationsSvc.getAllInTimeRange(
          this.dateRange[0],
          this.dateRange[1]
        );
        this.dataset = this.observationsSvc.getDailyData(data);
        this.updateChart();
      }
    }
  }

  showNoData() {
    console.log("Todo!");
    if (this.chart) {
      // this.chart.showNoData("No data available for this range");
    }
  }

  render() {
    return html`
      <div class="chart-types">
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
        <figure id="barChart"></figure>
      </div>
    `;
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
    // console.log(this.dataset);
    debugger;
    if (this.dataset?.length === 0) {
      this.chart.update({ series: [] });
      debugger;
      return;
    }
    const chartData = Object.keys(this.dataset[0].countsByType).map((type) => {
      return {
        name: type,
        data: this.dataset.map((obj) => obj.countsByType[type] || 0),
      };
    });

    this.chart.xAxis[0].update({
      categories: this.dataset.map((i) => i.day),
    });
    console.table(chartData);
    if (this.chart) {
      this.chart.update({ series: chartData });
    }
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
        zooming: {
          type: "x",
        },
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

  static styles = css`
    .chart-types {
      background-color: aliceblue;
    }
  `;
}

customElements.define("bar-chart", BarChart);
