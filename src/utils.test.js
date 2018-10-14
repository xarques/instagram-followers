import { TimeSeries, TimeRange, Index } from "pondjs";
import sample from './examples/data/dataSample-interval-hour.json'
import { toDateAndFollowersArray, toDateAndDeltaFollowersArray, timeSeries } from './utils'

const expectedDateAndFollowersArray = [
  [ new Date('2018-10-06T09:00:00.000Z'), 1 ],
  [ new Date('2018-10-06T10:00:00.000Z'), 4 ],
  [ new Date('2018-10-06T11:00:00.000Z'), 3 ],
  [ new Date('2018-10-06T12:00:00.000Z'), 10 ]
]

const expectedDateAndDeltaFollowersArray = [
  [ new Date('2018-10-06T09:00:00.000Z'), 0 ],
  [ new Date('2018-10-06T10:00:00.000Z'), 3 ],
  [ new Date('2018-10-06T11:00:00.000Z'), -1 ],
  [ new Date('2018-10-06T12:00:00.000Z'), 7 ]
]

const expectedTimeSeriesEvents = [
  {"index":"1h-427449","data":{"value":1}},
  {"index":"1h-427450","data":{"value":4}},
  {"index":"1h-427451","data":{"value":3}},
  {"index":"1h-427452","data":{"value":10}}]

const expectedDeltaTimeSeriesEvents = [
  {"index":"1h-427449","data":{"value":0}},
  {"index":"1h-427450","data":{"value":3}},
  {"index":"1h-427451","data":{"value":-1}},
  {"index":"1h-427452","data":{"value":7}}]


test('Date and Followers Array', () => {
  const array = toDateAndFollowersArray(sample)
  expect(array).toEqual(expectedDateAndFollowersArray)
});

test('time Series', () => {
  const array = toDateAndFollowersArray(sample)
  const series = timeSeries('Followers', array, '1h')
  const events = series.collection().eventList()
  expect(series.name()).toEqual('Followers')
  expect(series.columns()).toEqual(['value'])
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedTimeSeriesEvents))
})

test('Date and Delta Followers Array', () => {
  const array = toDateAndFollowersArray(sample)
  const deltaArray = toDateAndDeltaFollowersArray(array)
  expect(deltaArray).toEqual(expectedDateAndDeltaFollowersArray)
})

test('delta time Series', () => {
  const array = toDateAndFollowersArray(sample)
  const deltaArray = toDateAndDeltaFollowersArray(array)
  const series = timeSeries('Followers', deltaArray, '1h')
  const events = series.collection().eventList()
  expect(series.name()).toEqual('Followers')
  expect(series.columns()).toEqual(['value'])
  expect(JSON.stringify(events)).toEqual(JSON.stringify(expectedDeltaTimeSeriesEvents))
})
