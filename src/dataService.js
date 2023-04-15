import {
  countBy,
  groupBy,
  filter,
  uniqBy,
  reduce,
  map,
  sortBy,
  orderBy,
} from "lodash-es";

import { startOfWeek, endOfWeek, format, startOfYear } from "date-fns";

export class ObservationDataSvc {
  #observationsData = null;

  async init() {
    const response = await fetch("../.netlify/functions/read-all");
    this.#observationsData = await response.json();
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
      return itemDate >= new Date(from) && itemDate <= new Date(to);
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
    debugger;
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
}
