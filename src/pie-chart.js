import { LitElement, css, html } from "lit";
import Highcharts, { objectEach } from "highcharts";
import "highcharts/modules/no-data-to-display";

const colorMap = new Map([
  ["LOW", "#3BE37B"],
  ["MEDIUM", "#6968E3"],
  ["HIGH", "#E3C746"],
  ["CRITICAL", "#E3443B"],
]);

export class PieChart extends LitElement {
  static properties = {
    data: { type: Object },
  };

  constructor() {
    super();

    this.pieChart = null;
  }

  willUpdate(changedProps) {
    if (changedProps.has("data") && this.pieChart) {
      this.updateChart();
    }
  }

  render() {
    return html`<div id="pieContainer"></div>`;
  }

  firstUpdated() {
    this.initPieChart();
  }

  updateChart() {
    this.pieChart.update({
      series: [
        {
          data: this.convertToPieChart(this.data),
        },
      ],
    });
  }

  convertToPieChart(data) {
    const result = [];
    for (let [key, value] of Object.entries(data)) {
      result.push({
        name: key,
        y: value,
        color: this.getColorByType(key),
      });
    }
    console.log(result);
    return result;
  }

  getColorByType(type) {
    return colorMap.get(type);
  }

  initPieChart() {
    const pieContainer = this.renderRoot.querySelector("#pieContainer");
    this.pieChart = Highcharts.chart(pieContainer, {
      credits: {
        enabled: false,
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
        colorCount: 4,
      },
      title: {
        text: "Deviation types",
        align: "left",
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
      },
      accessibility: {
        point: {
          valueSuffix: "%",
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Deviations",
          data: this.data,
        },
      ],
    });
  }
}

customElements.define("pie-chart", PieChart);
