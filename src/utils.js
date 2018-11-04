import { event, time, TimeSeries, window, duration, TimeRange, Index, avg, max, sum } from "pondjs";

const toDateAndFollowersArray = (data) => {
  return data.map(timestamp => {
    return [new Date(timestamp.checkedDate.S), parseInt(timestamp.followers.N, 10)]
  }).sort(function(a, b){
    return a[0] - b[0];
  })
}

const toDateAndDeltaFollowersArray = (dateAndFollowersArray) => {
  return dateAndFollowersArray.map((value, index, array) => {
    const delta = index > 0 ? value[1] - array[index-1][1] : 0
    return [value[0], delta]
  })
}

const buildFullTimeSeries = (name, array) => {
  return new TimeSeries({
    name: name,
    columns: ["time", "value"],
    points: array.map(([d, value]) => [d.getTime(), value])
  })
}

const buildCroppedTimeSeries = (series, window, aggregation = max,endDate = new Date()) => {
  endDate.setHours(23,59,59,999)
  let timeRange
  let windowRollup = '1h'
  const oneDay = 24 * 60 * 60 * 1000
  let startDate = new Date(endDate.getTime() + 1000 - oneDay)
  switch (window) {
    case '1d':
      break;
    case '1w':
      startDate = new Date(endDate.getTime() + 1000 - 6 * oneDay)
      windowRollup = '1d'
      break
    case '1m':
      startDate = new Date(endDate.getTime() + 1000 - 7 * 31 * oneDay)
      windowRollup = '1d'
      break
    case '3m':
      startDate = new Date(endDate.getTime() + 1000 - 7 * 31 * 3 * oneDay)
      windowRollup = '1d'
      break
    default:
    break;
  }
  startDate.setHours(0,0,0,0)
  console.log("startDate", startDate)
  console.log("enddate", endDate)

  timeRange = new TimeRange(startDate.getTime(), endDate.getTime())

  return series
    .crop(timeRange)
    .fixedWindowRollup({
      windowSize: windowRollup,
      aggregation: {value: {value: aggregation()}}
    })
    // }).renameColumns({
    //   renameMap: {data: "value"}
    // })
}

const buildCroppedTimeSeriesDelta = (series, window, aggregation = sum, endDate = new Date()) => {
  return buildCroppedTimeSeries(series, window, aggregation, endDate)
}

const buildTimeSeries = (name, array, interval, deep) => {
  let resizedArray = array
  if (deep && array.length > deep) {
    resizedArray = array.slice(array.length - deep, array.length)
  }
  let series = new TimeSeries({
    name: name,
    columns: ["time", "value"],
    points: resizedArray.map(([d, value]) => [d.getTime(), value])
  })
  return series
}

const buildDailyTimeSeries = (timeSeries) => {
  const dailyAvg = timeSeries.fixedWindowRollup({
    windowSize: '1d',
    aggregation: {value: {value: max()}}
  });
  return dailyAvg
  // return timeSeries.dailyRollup({value: {value: avg()}})
}

const buildIndexTimeSeries = (name, array, interval, deep) => {
  let resizedArray = array

  if (deep && array.length > deep) {
    resizedArray = array.slice(array.length - deep, array.length)
  }
  return new TimeSeries({
  name: name,
  columns: ["index", "value"],
  points: resizedArray.map(([d, value]) => [Index.getIndexString(interval, d), value])
  })
}

// const buildTimeSeries = (name, array, interval, deep) => {
//   let resizedArray = array

//   if (deep && array.length > deep) {
//     resizedArray = array.slice(array.length - deep, array.length)
//   }
//   return new TimeSeries({
//   name: name,
//   columns: ["index", "value"],
//   points: resizedArray
//   })
// }

// var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// var today  = new Date();

// console.log(today.toLocaleDateString("en-US"));

const daysIntoYear = (date) =>  {
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}

export {
  toDateAndFollowersArray,
  buildTimeSeries,
  buildDailyTimeSeries,
  buildIndexTimeSeries,
  buildFullTimeSeries,
  buildCroppedTimeSeries,
  buildCroppedTimeSeriesDelta,
  toDateAndDeltaFollowersArray,
  daysIntoYear }
