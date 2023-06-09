import Highcharts from "highcharts";
// import "highcharts/es-modules/Extensions/NoDataToDisplay.js";
import "highcharts/modules/no-data-to-display.js";
import { LitElement, html, css } from "lit";
import { ObservationDataSvc } from "./dataService";

const colors = ["#E3443B", "#E3C746", "#3BE37B", "#6968E3"];

// const demoTypes = new Map([
//   ["VARIANCE", "LOW"],
//   ["VALUE", "MEDIUM"],
//   ["USER_PERIOD", "HIGH"],
//   ["HARMONY", "CRITICAL"],
// ]);

const colorMap = new Map([
  ["LOW", "#3BE37B"],
  ["MEDIUM", "#6968E3"],
  ["HIGH", "#E3C746"],
  ["CRITICAL", "#E3443B"],
]);

export class BarChart extends LitElement {
  static properties = {
    dateRange: { type: Array },
    total: { type: Number },
    dataset: { type: Array },
    loading: { type: Boolean },
    chartType: { type: String },
    darkMode: { type: Boolean },
  };

  constructor() {
    super();
    this.dataset = [];
    this.total = 0;
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
    if (cProps.has("dataset") && this.chart) {
      this.updateChart();
    }
    if (cProps.has("darkMode") && this.chart) {
      this.setToDarkMode(this.darkMode);
    }
    if (cProps.has("dateRange")) {
      if (this.dateRange?.length === 2) {
        const data = this.observationsSvc.getAllInTimeRange(
          this.dateRange[0],
          this.dateRange[1]
        );
        this.total = data.length;

        this.typesAndCounts = this.observationsSvc.getGroupedBy(data, "type");

        this.dataset = this.observationsSvc.getDailyData(data);
        this.updateChart();
      }
    }
  }

  toggleObservationVisibility(observationToShow) {
    this.chart.series.forEach((series) => {
      if (observationToShow.length === 0) {
        series.show();
      } else if (series.name !== observationToShow.toUpperCase()) {
        series.hide();
      } else {
        series.show();
      }
    });
  }

  render() {
    return html`
      <figure id="barChart"></figure>

      <div class="chart-types">
        <sl-tooltip
          content="Try different types of charts"
          placement="top-start"
        >
          <sl-icon name="question-lg" label="Settings"></sl-icon>
        </sl-tooltip>
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
            name="list"
            label="Settings"
          ></sl-icon-button>
          <sl-icon-button
            data-type="spline"
            name="graph-up"
            label="Settings"
          ></sl-icon-button>
        </sl-button-group>
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

  setToDarkMode(value) {
    this.chart.update({
      chart: {
        backgroundColor: value ? "black" : "white",
      },
      legend: {
        itemStyle: {
          color: value ? "lightgrey" : "black",
        },
      },
      title: {
        style: {
          color: value ? "lightgrey" : "black", // New font color
        },
      },
      xAxis: {
        labels: {
          style: {
            color: value ? "lightgrey" : "black", // New font color
          },
        },
      },
      yAxis: {
        labels: {
          style: {
            color: value ? "lightgrey" : "black", // New font color
          },
        },
      },
    });
  }

  updateChart() {
    // console.log(this.dataset);

    let chartData = [];
    if (this.dataset?.length === 0) {
      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      this.chart.showLoading("No data");

      this.total = 0;
    } else {
      this.chart.hideLoading();

      //const allSeries = Object.keys(this.typesAndCounts).sort((a, b) => a - b);

      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      // this.chart.series.forEach((s) => {
      //   if (!allSeries.includes(s.id)) {
      //     s.remove();
      //   }
      // });

      // allSeries.forEach((s) => {
      //   this.chart.addSeries({
      //     id: s,
      //     name: s,
      //     data: [],
      //   });
      // });

      chartData = Object.keys(this.typesAndCounts)
        .sort((a, b) => b - a)
        .forEach((type) => {
          this.chart.addSeries({
            id: type,
            name: type,
            data: this.dataset.map((obj) => obj.countsByType[type] || 0),
            color: this.getColorByType(type),
          });
        });

      // this.chart.addSeries({
      //   type: "pie",
      //   data: this.dataset.map((obj) => obj.countsByType["CRITICAL"] || 0),
      //   center: ["10%", "10%"],
      // });

      this.chart.xAxis[0].setCategories(this.dataset.map((i) => i.day));
    }

    const event = new CustomEvent("data-changed", {
      detail: { types: this.typesAndCounts, total: this.total },
    });
    this.dispatchEvent(event);
    // if (this.chart) {
    //   this.chart.update({ series: chartData });
    // }
  }

  getColorByType(type) {
    return colorMap.get(type);
  }

  initChart() {
    const container = this.renderRoot.getElementById("barChart");
    this.chart = Highcharts.chart(container, {
      credits: {
        enabled: false,
      },
      colors: ["#E3443B", "#E3C746", "#3BE37B", "#6968E3"],
      chart: {
        backgroundColor: this.darkMode ? "#333333" : "#fff",
        type: "column",
        colorCount: 4,
        zooming: {
          type: "x",
        },
      },
      title: {
        text: "Trends over Time",
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
      noData: {
        style: {
          fontWeight: "bold",
          fontSize: "15px",
          color: "#303030",
        },
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
        // {
        //   id: "VALUE",
        //   data: [],
        //   stack: 0,
        //   // pointInterval: 24 * 3600 * 1000,
        // },
        // {
        //   id: "HARMONY",
        //   data: [],
        //   stack: 0,
        //   // pointInterval: 24 * 3600 * 1000,
        // },
        // {
        //   id: "VARIANCE",
        //   data: [],
        //   stack: 0,
        //   // pointInterval: 24 * 3600 * 1000,
        // },
        // {
        //   id: "USER_PERIOD",
        //   data: [],
        //   stack: 0,
        //   // pointInterval: 24 * 3600 * 1000,
        // },
        // {
        //   data: [10],
        //   stack: 0,
        // },
      ],
    });
  }

  static styles = css`
    .chart-types {
    }
  `;
}

customElements.define("bar-chart", BarChart);
