import Highcharts from "highcharts";
import { LitElement, html } from "lit";

export class BarChart extends LitElement {
  static properties = {
    timeRange: { type: Object },
    count: { type: Number },
    observationsRaw: { type: Array },
  };

  constructor() {
    super();
    this.observationsRaw = [];
    this.count = 0;
  }

  async connectedCallback() {
    super.connectedCallback();
    const response = await fetch("../.netlify/functions/read-all");
    const data = await response.json();

    this.observationsRaw = data;

    this.count = this.observationsRaw.length;
    console.log(this.observationsRaw);
  }

  willUpdate(cProps) {
    console.log(cProps);
    if (cProps.has("observationsRaw") && this.chart) {
      this.updateChart();
    }
  }

  render() {
    return html` <p>Data count: ${this.count}</p>
      <figure id="barChart"></figure>`;
  }

  firstUpdated() {
    this.initChart();
  }

  updateChart() {
    const data = this.queryData();
    this.chart.series[0].setData(data);
  }

  queryData() {
    // params etc
    const xAxis = this.observationsRaw.map((item, index) => [
      new Date(item.startDate).getDay(),
      index,
    ]);

    /*
    [{
        name: 'BPL',
        data: [3, 5, 1, 13]
    }, {
        name: 'FA Cup',
        data: [14, 8, 8, 12]
    }, {
        name: 'CL',
        data: [0, 2, 6, 3]
    }]
    */
    // const months = [...new Set(xAxis)];
    // const data = [];
    // xAxis.forEach((m, i) => {

    // });
    return xAxis;
  }

  initChart() {
    console.log("render");
    const container = this.renderRoot.getElementById("barChart");
    this.chart = Highcharts.chart(container, {
      chart: {
        type: "column",
        //     styledMode: true,
      },
      title: {
        text: "observation",
        align: "left",
      },
      label: false,
      xAxis: {
        // categories: [
        //   "Jet fuel",
        //   "Duty-free diesel",
        //   "Petrol",
        //   "Diesel",
        //   "Gas oil",
        // ],
      },
      yAxis: {
        title: {
          text: "Million liters",
        },
      },
      tooltip: {
        valueSuffix: "million liters",
      },
      series: [
        {
          type: "column",
          name: "2020",
        },
        // {
        //   type: "column",
        //   name: "2021",
        //   data: [24, 79, 72, 240, 167],
        // },
        // {
        //   type: "column",
        //   name: "2022",
        //   data: [58, 88, 75, 250, 176],
        // },
        // {
        //   type: "spline",
        //   name: "Average",
        //   data: [47, 83.33, 70.66, 239.33, 175.66],
        //   marker: {
        //     lineWidth: 2,
        //     lineColor: Highcharts.getOptions().colors[3],
        //     fillColor: "white",
        //   },
        // },
        // {
        //   type: "pie",
        //   name: "Total",
        //   data: [
        //     {
        //       name: "2020",
        //       y: 619,
        //       color: Highcharts.getOptions().colors[0], // 2020 color
        //       dataLabels: {
        //         enabled: true,
        //         distance: -50,
        //         format: "{point.total} M",
        //         style: {
        //           fontSize: "15px",
        //         },
        //       },
        //     },
        //     {
        //       name: "2021",
        //       y: 586,
        //       color: Highcharts.getOptions().colors[1], // 2021 color
        //     },
        //     {
        //       name: "2022",
        //       y: 647,
        //       color: Highcharts.getOptions().colors[2], // 2022 color
        //     },
        //   ],
        //   center: [75, 65],
        //   size: 100,
        //   innerSize: "70%",
        //   showInLegend: false,
        //   dataLabels: {
        //     enabled: false,
        //   },
        // },
      ],
    });
  }
}

customElements.define("bar-chart", BarChart);
