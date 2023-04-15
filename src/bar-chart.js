import Highcharts from "highcharts";
import { LitElement, html } from "lit";
import { ObservationDataSvc } from "./dataService";

export class BarChart extends LitElement {
  static properties = {
    timeRange: { type: Object },
    count: { type: Number },
    dataset: { type: Array },
    loading: { type: Boolean },
  };

  constructor() {
    super();
    this.dataset = [];
    this.count = 0;
    this.data = [];
    this.loading = false;
    this.observationsSvc = new ObservationDataSvc();
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
        <sl-button-group label="Alignment">
          <sl-button size="small" variant="default">Monthly</sl-button>
          <sl-button size="small" variant="default">Weekly</sl-button>
          <sl-button size="small" variant="default">Daily</sl-button>
        </sl-button-group>
        <sl-divider vertical></sl-divider>
        <sl-button-group label="Alignment">
          <sl-button size="small" variant="primary">Left</sl-button>
          <sl-button size="small" variant="primary">Center</sl-button>
          <sl-button size="small" variant="primary">Right</sl-button>
        </sl-button-group>
      </div>
      <figure id="barChart"></figure>`;
  }

  firstUpdated() {
    this.initChart();
  }

  updateChart() {
    const chartData = Object.keys(this.dataset[0].countsByType).map((type) => {
      return {
        name: type,
        data: this.dataset.map((obj) => obj.countsByType[type] || 0),
      };
    });
    // const grouped = this.observationsSvc.getGroupedBy(this.dataset, "type");

    // const categories = this.observationsSvc.getMonthsInCollection(
    //   this.dataset,
    //   "startDate"
    // );
    // const byMonth = data.map((item) => {
    //   return {
    //     stack: item.month,
    //     data: grouped,
    //   };
    // });
    // debugger;
    // const seriesData = Object.entries(grouped).map((i) => {
    //   return {
    //     id: i[0],
    //     name: i[0],
    //     data: [i[1]],
    //     stack: 0,
    //   };
    // });

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
        //     styledMode: true,
        // backgroundColor: {
        //   linearGradient: [0, 0, 500, 500],
        //   stops: [
        //     [0, "rgb(255, 200, 255)"],
        //     [1, "rgb(200, 200, 255)"],
        //   ],
        // },
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
