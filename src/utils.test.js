import { TimeSeries, TimeRange, Index } from "pondjs";
import sample from './examples/data/dataSample-interval-hour.json'
import sample2days from './examples/data/dataSample-interval-hour-2days.json'
import {
  toDateAndFollowersArray,
  toDateAndDeltaFollowersArray,
  buildTimeSeries,
  buildFullTimeSeries,
  buildDailyTimeSeries,
  buildCroppedTimeSeries,
  buildIndexTimeSeries
} from './utils'

const expectedDateAndFollowersArray = [
  [new Date('2018-10-06T09:00:00.000Z'), 1],
  [new Date('2018-10-06T10:00:00.000Z'), 4],
  [new Date('2018-10-06T11:00:00.000Z'), 3],
  [new Date('2018-10-06T12:00:00.000Z'), 10]
]

const expectedDateAndDeltaFollowersArray = [
  [new Date('2018-10-06T09:00:00.000Z'), 0],
  [new Date('2018-10-06T10:00:00.000Z'), 3],
  [new Date('2018-10-06T11:00:00.000Z'), -1],
  [new Date('2018-10-06T12:00:00.000Z'), 7]
]

const expectedTimeSeriesEvents = [
  { "time": new Date('2018-10-06T09:00:00.000Z'), "data": { "value": 1 } },
  { "time": new Date('2018-10-06T10:00:00.000Z'), "data": { "value": 4 } },
  { "time": new Date('2018-10-06T11:00:00.000Z'), "data": { "value": 3 } },
  { "time": new Date('2018-10-06T12:00:00.000Z'), "data": { "value": 10 } }
]

const expectedIndexTimeSeriesEvents = [
  { "index": "1d-17810", "data": { "value": 102 } },
  { "index": "1d-17811", "data": { "value": 222 } }
]

const expectedDeltaTimeSeriesEvents = [
  { "index": "1h-427449", "data": { "value": 0 } },
  { "index": "1h-427450", "data": { "value": 3 } },
  { "index": "1h-427451", "data": { "value": -1 } },
  { "index": "1h-427452", "data": { "value": 7 } }
]

// const expectedCroppedTimeSeriesEvents = [
//   { "time": "2018-10-07T11:00:00.000Z", "data": { "value": 203 } },
//   { "time": "2018-10-07T12:00:00.000Z", "data": { "value": 222 } }
// ]

const expectedCroppedHourTimeSeriesEvents = [
  { "index": "1h-427449", "data": { "value": 1 } },
  { "index": "1h-427450", "data": { "value": 4 } },
  { "index": "1h-427451", "data": { "value": 3 } },
  { "index": "1h-427452", "data": { "value": 10 } },
  { "index": "1h-427453", "data": { "value": 14 } },
  { "index": "1h-427454", "data": { "value": 20 } },
  { "index": "1h-427455", "data": { "value": 30 } },
  { "index": "1h-427456", "data": { "value": 28 } },
  { "index": "1h-427457", "data": { "value": 32 } },
  { "index": "1h-427458", "data": { "value": 40 } },
  { "index": "1h-427459", "data": { "value": 54 } },
  { "index": "1h-427460", "data": { "value": 72 } },
  { "index": "1h-427461", "data": { "value": 65 } }
]

const expectedCroppedDayTimeSeriesEvents = [
  { "index": "1d-17810", "data": { "value": 102 } },
  { "index": "1d-17811", "data": { "value": 222 } }
]

test('Date and Followers Array', () => {
  const array = toDateAndFollowersArray(sample)
  expect(array).toEqual(expectedDateAndFollowersArray)
});

test('time Series', () => {
  const array = toDateAndFollowersArray(sample)
  const series = buildTimeSeries('Followers', array, '1h')
  const events = series.collection().eventList()
  expect(series.name()).toEqual('Followers')
  expect(series.columns()).toEqual(['value'])
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedTimeSeriesEvents))
})

test('time Series divided into days', () => {
  const array = toDateAndFollowersArray(sample2days)
  const series = buildTimeSeries('Followers', array, '1h')
  const dailySeries = buildDailyTimeSeries(series)
  const events = dailySeries.collection().eventList()
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedIndexTimeSeriesEvents))
})

test('time Series cropped into 1 day', () => {
  const array = toDateAndFollowersArray(sample2days)
  const series = buildFullTimeSeries('Followers', array)
  const croppedSeries = buildCroppedTimeSeries(series, '1d', undefined, new Date('2018-10-06T11:00:00.000Z'))
  const events = croppedSeries.collection().eventList()
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedCroppedHourTimeSeriesEvents))
})

test('time Series cropped into 1 week', () => {
  const array = toDateAndFollowersArray(sample2days)
  const series = buildFullTimeSeries('Followers', array)
  const croppedSeries = buildCroppedTimeSeries(series, '1w', undefined, new Date('2018-10-08T11:00:00.000Z'))
  const events = croppedSeries.collection().eventList()
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedCroppedDayTimeSeriesEvents))
})

test('Date and Delta Followers Array', () => {
  const array = toDateAndFollowersArray(sample)
  const deltaArray = toDateAndDeltaFollowersArray(array)
  expect(deltaArray).toEqual(expectedDateAndDeltaFollowersArray)
})

test('delta time Series', () => {
  const array = toDateAndFollowersArray(sample)
  const deltaArray = toDateAndDeltaFollowersArray(array)
  const series = buildIndexTimeSeries('Followers', deltaArray, '1h')
  const events = series.collection().eventList()
  expect(series.name()).toEqual('Followers')
  expect(series.columns()).toEqual(['value'])
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedDeltaTimeSeriesEvents))
})

test('keep last day', () => {
  const array = toDateAndFollowersArray(sample2days)
  expect(array.length).toEqual(28)
  const series = buildTimeSeries('Followers', array, '1h', 24)
  const events = series.collection().eventList()
  expect(events.size).toEqual(24)
})
