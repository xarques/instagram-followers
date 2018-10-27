import { TimeSeries, TimeRange, Index } from "pondjs";

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

const timeSeries = (name, array, interval, deep) => {
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



// var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// var today  = new Date();

// console.log(today.toLocaleDateString("en-US"));

const daysIntoYear = (date) =>  {
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}

export { toDateAndFollowersArray, timeSeries, toDateAndDeltaFollowersArray, daysIntoYear }
