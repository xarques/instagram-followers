import {
  TimeSeries,
  TimeRange,
  Index,
  max,
  sum
} from "pondjs";

const toDateAndFollowersArray = data => {
  return data
    .map(timestamp => {
      return [
        new Date(timestamp.checkedDate.S),
        parseInt(timestamp.followers.N, 10)
      ];
    })
    .sort(function(a, b) {
      return a[0] - b[0];
    });
};

const toDateAndDeltaFollowersArray = dateAndFollowersArray => {
  return dateAndFollowersArray.map((value, index, array) => {
    const delta = index > 0 ? value[1] - array[index - 1][1] : 0;
    return [value[0], delta];
  });
};

const buildFullTimeSeries = (name, array) => {
  return new TimeSeries({
    name: name,
    columns: ["time", "value"],
    points: array.map(([d, value]) => [d.getTime(), value])
  });
};

const buildCroppedTimeSeries = (
  series,
  window,
  aggregation = max,
  endDate = new Date()
) => {
  console.log('buildCroppedTimeSeries endDate 0', endDate)
  if (window !== "1d") {
    endDate.setHours(23, 59, 59, 999);
  }
  console.log('buildCroppedTimeSeries endDate 1', endDate)

  let timeRange;
  let windowRollup = "1h";
  let startDate = new Date(endDate.getTime());
  switch (window) {
    case "1d":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "1w":
      startDate.setDate(startDate.getDate() - 6);
      windowRollup = "1d";
      break;
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1);
      windowRollup = "7d";
      break;
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3);
      windowRollup = "30d";
      break;
    default:
      break;
  }
  console.log('buildCroppedTimeSeries startDate 0', startDate)

  if (window !== "1d") {
    startDate.setHours(0, 0, 0, 0);
  }
  console.log('buildCroppedTimeSeries startDate 1', startDate)

  timeRange = new TimeRange(startDate.getTime(), endDate.getTime());

  return series.crop(timeRange).fixedWindowRollup({
    windowSize: windowRollup,
    aggregation: { value: { value: aggregation() } }
  });
  // }).renameColumns({
  //   renameMap: {data: "value"}
  // })
};

const buildCroppedTimeSeriesDelta = (
  series,
  window,
  aggregation = sum,
  endDate = new Date()
) => {
  return buildCroppedTimeSeries(series, window, aggregation, endDate);
};

const buildTimeSeries = (name, array, interval, deep) => {
  let resizedArray = array;
  if (deep && array.length > deep) {
    resizedArray = array.slice(array.length - deep, array.length);
  }
  let series = new TimeSeries({
    name: name,
    columns: ["time", "value"],
    points: resizedArray.map(([d, value]) => [d.getTime(), value])
  });
  return series;
};

const buildDailyTimeSeries = timeSeries => {
  const dailyAvg = timeSeries.fixedWindowRollup({
    windowSize: "1d",
    aggregation: { value: { value: max() } }
  });
  return dailyAvg;
};

const buildIndexTimeSeries = (name, array, interval, deep) => {
  let resizedArray = array;

  if (deep && array.length > deep) {
    resizedArray = array.slice(array.length - deep, array.length);
  }
  return new TimeSeries({
    name: name,
    columns: ["index", "value"],
    points: resizedArray.map(([d, value]) => [
      Index.getIndexString(interval, d),
      value
    ])
  });
};

const daysIntoYear = date => {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  );
};

export {
  toDateAndFollowersArray,
  buildTimeSeries,
  buildDailyTimeSeries,
  buildIndexTimeSeries,
  buildFullTimeSeries,
  buildCroppedTimeSeries,
  buildCroppedTimeSeriesDelta,
  toDateAndDeltaFollowersArray,
  daysIntoYear
};
