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
    darkMode: { type: Boolean },
  };

  constructor() {
    super();
    this.pieChart = null;
  }

  willUpdate(changedProps) {
    if (changedProps.has("data") && this.pieChart) {
      this.updateChart();
    }
    if (changedProps.has("darkMode") && this.pieChart) {
      this.setToDarkMode(this.darkMode);
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
    return result;
  }

  getColorByType(type) {
    return colorMap.get(type);
  }

  #selectedPoint = null;

  toggleObservationVisibility(observationToShow) {
    if (observationToShow.length === 0 && this.#selectedPoint) {
      this.#selectedPoint.select(false, false);
      this.#selectedPoint.setState({});
    } else {
      const point = this.pieChart.series[0].data.filter(
        (d) => d.name === observationToShow
      );
      if (point) {
        this.#selectedPoint = point[0];
        this.#selectedPoint.select(true, false);
        this.#selectedPoint.setState("hover");
        this.#selectedPoint.onMouseOver();
      }
    }
  }

  setToDarkMode(value) {
    this.pieChart.update({
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
          color: value ? "lightgrey" : "black",
        },
      },
      plotOptions: {
        pie: {
          dataLabels: {
            style: {
              color: value ? "lightgrey" : "black",
            },
          },
        },
      },
    });
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
        text: "Distribution of Types",
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
          states: {
            hover: {
              enabled: true,
            },
          },
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
          events: {
            mouseOver: function () {
              this.setState("hover");
            },
            mouseOut: function () {
              this.setState("");
            },
          },
        },
      ],
    });
  }
}
customElements.define("pie-chart", PieChart);
