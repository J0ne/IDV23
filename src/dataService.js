import {
  countBy,
  groupBy,
  filter,
  uniqBy,
  reduce,
  map,
  sortBy,
  orderBy,
  find,
  forEach,
  uniq,
  flatMap,
} from "lodash-es";

import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
  startOfYear,
} from "date-fns";

export class ObservationDataSvc {
  #observationsData = null;

  async init() {
    const response = await fetch("../.netlify/functions/read-all");
    const rawData = await response.json();
    this.#observationsData = rawData.map((item) => {
      return { ...item, type: item.type.replace("_DEV", "") };
    });
  }

  getCountsBy(val) {
    if (!this.#observationsData) {
      throw new Error('Call "init()" before using ObservationDataSvc');
    }
    return countBy(this.#observationsData, val);
  }

  getCountFromArrayBy(arr, val) {
    return countBy(arr, val);
  }

  getAllInTimeRange(from, to) {
    const filteredItems = filter(this.#observationsData, (item) => {
      const itemDate = new Date(item.startDate);
      return itemDate >= from && itemDate <= to;
    });
    return filteredItems;
  }

  getGroupedBy(collection, grouping) {
    return countBy(collection, grouping);
  }

  getMonthsInCollection(collection, field) {
    // Get all the unique month names from the "date" field in the data
    const uniqueMonths = uniqBy(collection, function (obj) {
      return obj[field].slice(0, 7); // Get the year and month part of the date string
    }).map(function (obj) {
      return obj[field].slice(5, 7); // Get the month part of the date string
    });

    // Convert the month numbers to month names
    const monthNames = uniqueMonths.map(function (month) {
      return new Date(Date.UTC(2000, parseInt(month) - 1, 1)).toLocaleString(
        "en",
        { month: "long" }
      );
    });
    return monthNames;
  }

  getMonthlyData() {
    const sortedData = sortBy(this.#observationsData, (item) => {
      return new Date(item.startTime);
    });
    // Group data by month of startTime
    const groupedData = groupBy(sortedData, (item) => {
      return new Date(item.startTime).getMonth();
    });

    // Calculate counts by types in each month
    const monthlyData = map(groupedData, (group, key) => {
      const month = new Date(group[0].startTime).toISOString();
      // .toLocaleString("default", {
      //   month: "long",
      // });
      const countsByType = reduce(
        group,
        (result, item) => {
          if (!result[item.type]) {
            result[item.type] = 0;
          }
          result[item.type]++;
          return result;
        },
        {}
      );
      return {
        month,
        countsByType,
      };
    });

    return monthlyData;
  }

  getWeeklyData() {
    const sortedData = sortBy(this.#observationsData, (item) => {
      return new Date(item.startTime);
    });
    // Group data by month of startTime
    const groupedData = groupBy(sortedData, (item) => {
      return new Date(item.startTime).getMonth();
    });

    // Calculate counts by types in each month
    const weeklyData = map(groupedData, (group, key) => {
      const weekStart = startOfWeek(new Date(group[0].startTime));
      const weekEnd = endOfWeek(new Date(group[0].startTime));
      const week = `Week of ${format(weekStart, "MMM dd")} - ${format(
        weekEnd,
        "MMM dd, yyyy"
      )}`;

      // .toLocaleString("default", {
      //   month: "long",
      // });
      const countsByType = reduce(
        group,
        (result, item) => {
          if (!result[item.type]) {
            result[item.type] = 0;
          }
          result[item.type]++;
          return result;
        },
        {}
      );
      return {
        week,
        countsByType,
        startDate: new Date(group[0].startDate),
      };
    });
    const sortedResult = orderBy(weeklyData, [
      (item) => startOfYear(item.startDate),
      "startDate",
    ]);
    return sortedResult;
  }

  convertToStackedBarData(data) {
    // Group the data by type and date
    const groupedData = groupBy(
      data,
      (item) => item.type + "_" + item.startDate
    );

    // Map the grouped data to an array of series
    const series = map(groupedData, (items, key) => {
      const [type, startDate] = key.split("_");

      // Group the items by state
      const groupedItems = groupBy(items, "state");

      // Map the grouped items to an array of values
      const values = map(groupedItems, (groupedItems, state) => {
        return {
          name: state,
          y: groupedItems.length,
        };
      });

      return {
        name: type,
        data: values,
        startDate: new Date(startDate).getTime(),
      };
    });
    debugger;
    // Reduce the series to an array of unique dates
    const uniqueDates = uniq(
      flatMap(series, (item) => new Date(item.startDate))
    ).sort();

    // Map the unique dates to an array of categories
    const categories = map(uniqueDates, (date) =>
      new Date(date).toLocaleDateString()
    );

    // Map the series to an array of data points
    const dataPoints = map(series, (item) => {
      const point = {
        name: item.name,
        data: [],
      };

      forEach(uniqueDates, (date) => {
        const data = find(item.data, { name: "RESOLVED" });
        point.data.push(data ? data.y : 0);
      });

      return point;
    });

    return {
      categories,
      series: dataPoints,
    };
  }

  getDailyData(collection) {
    const sortedData = sortBy(collection, (item) => {
      return new Date(item.startTime);
    });
    // Group data by day of startTime
    const groupedData = groupBy(sortedData, (item) => {
      return new Date(item.startTime).toISOString().slice(0, 10);
    });

    // Calculate counts by types in each day
    const dailyData = map(groupedData, (group, key) => {
      const dayStart = startOfDay(new Date(group[0].startTime));
      const dayEnd = endOfDay(new Date(group[0].startTime));
      const day = `${format(dayStart, "MMM dd, yyyy")}`;

      const countsByType = reduce(
        group,
        (result, item) => {
          if (!result[item.type]) {
            result[item.type] = 0;
          }
          result[item.type]++;
          return result;
        },
        {}
      );
      return {
        day,
        countsByType,
        startDate: new Date(group[0].startDate),
      };
    });
    const sortedResult = orderBy(dailyData, [
      (item) => startOfYear(item.startDate),
      "startDate",
    ]);
    return sortedResult;
  }
}
