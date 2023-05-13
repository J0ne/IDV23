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

const demoTypes = new Map([
  ["VARIANCE", "LOW"],
  ["VALUE", "MEDIUM"],
  ["USER_PERIOD", "HIGH"],
  ["HARMONY", "CRITICAL"],
]);

export class ObservationDataSvc {
  #observationsData = null;

  async init() {
    const response = await fetch("../.netlify/functions/read-all");
    const rawData = await response.json();
    this.#observationsData = rawData.map((item) => {
      return { ...item, type: demoTypes.get(item.type.replace("_DEV", "")) };
    });
  }

  getAllInTimeRange(from, to) {
    const filteredItems = filter(this.#observationsData, (item) => {
      const itemDate = Date.parse(item.startDate);
      return itemDate >= from && itemDate <= to;
    });
    return filteredItems;
  }

  getGroupedBy(collection, grouping) {
    return countBy(collection, grouping);
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
