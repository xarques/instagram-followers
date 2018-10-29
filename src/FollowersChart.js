/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint max-len:0 */

import React from "react";

import './FollowersChart.css'
import { toDateAndFollowersArray, timeSeries, toDateAndDeltaFollowersArray } from './utils'
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, BarChart, Resizable, Baseline, styler } from "react-timeseries-charts";
import { TimeSeries, TimeRange, Index } from "pondjs";

// const style = {
//   value: {
//     stroke: "#a02c2c",
//     opacity: 0.2
//   }
// };

const style = styler([
  { key: "value", color: "#A5C8E1"},
]);

const baselineStyle = {
  line: {
    stroke: "steelblue",
    strokeWidth: 1,
    opacity: 0.4,
    strokeDasharray: "none"
  },
  label: {
    fill: "steelblue"
  }
};

const baselineStyleLite = {
  line: {
    stroke: "steelblue",
    strokeWidth: 1,
    opacity: 0.5
  },
  label: {
    fill: "steelblue"
  }
};

const baselineStyleExtraLite = {
  line: {
    stroke: "steelblue",
    strokeWidth: 1,
    opacity: 0.2,
    strokeDasharray: "1,1"
  },
  label: {
    fill: "steelblue"
  }
};

class FollowersChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracker: null,
      interval: 24
    };
  }

  componentDidMount = () => {
    const accountId = this.props.match.params.accountId || 'adrelanine'
    fetch(`https://g43v3qwvj7.execute-api.eu-west-3.amazonaws.com/dev/followers/${accountId}`)
      .then(res => res.json())
      .then(data => {

        const hoursAndFollowersArray = toDateAndFollowersArray(data)
        const hoursSeries = timeSeries('Followers', hoursAndFollowersArray, '1h', 24)

        //const daysFollowersMap = this.daysFollowers(hoursFollowers)
        //const daysFollowers = Object.entries(daysFollowersMap)

        const deltaHoursAndFollowersArray =  toDateAndDeltaFollowersArray(hoursAndFollowersArray)
        const deltaHoursSeries = timeSeries('Followers', deltaHoursAndFollowersArray, '1h', 24)

        this.setState((state) => {
          return {
            ...state,
            hoursAndFollowersArray,
            deltaHoursAndFollowersArray,
            hoursSeries,
            deltaHoursSeries
          }
        });
      });
  }

  // daysFollowers = (followers) => {
  //   const result = []
  //   //let currentDay
  //   let previousDayInYear
  //   followers.forEach(([date, instantFollowers]) => {
  //     const dayInYear = this.daysIntoYear(date)
  //     console.log("dayInYear", dayInYear)
  //     console.log("instantFollowers", instantFollowers)

  //     if (!previousDayInYear) {
  //       previousDayInYear = [dayInYear, instantFollowers]
  //     } else if (previousDayInYear[0] !== dayInYear) {
  //       result.push(previousDayInYear)
  //       previousDayInYear = [dayInYear, instantFollowers]
  //     }
  //   })
  //   result.push(previousDayInYear)
  //   console.log('result ', result)


  // }

  daysFollowers = (followers) => {
    return followers.reduce((accumulator, current) => {
      accumulator[this.daysIntoYear(current[0])] = current[1]
      return accumulator
    },
    {})
  }

  handleTrackerChanged = tracker => {
    this.setState({ tracker });
  };

  handleTimeRangeChange = timerange => {
    this.setState({ timerange });
  };

  onClick = (interval) => {
    this.setState(state => ({
      ...state,
      interval: interval,
      hoursSeries: timeSeries('Followers', state.hoursAndFollowersArray, '1h', interval),
      deltaHoursSeries: timeSeries('Followers', state.deltaHoursAndFollowersArray, '1h', interval)
    }))
  }

  render() {
    const { hoursSeries, deltaHoursSeries, interval } = this.state;
    const accountId = this.props.match.params.accountId || 'adrelanine'

    return (
      <div className="followersChart">
        <h1>{accountId}</h1>
        <div className="dateInterval">
          <button className={`button ${interval === 24 ? 'button-selected' : ''}`} onClick={() => this.onClick(24)}>1D</button>
          <button className={`button ${interval === 24*7 ? 'button-selected' : ''}`} onClick={() => this.onClick(24*7)}>1W</button>
          <button className={`button ${interval === 24*7*31 ? 'button-selected' : ''}`} onClick={() => this.onClick(24*7*31)}>1M</button>
          <button className={`button ${interval === 24*7*31*3 ? 'button-selected' : ''}`} onClick={() => this.onClick(24*7*31*3)}>3M</button>
        </div>

        { hoursSeries &&
        <Resizable>
          <ChartContainer
          title="Total Followers"
          timeRange={hoursSeries.range()}
          titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
          // format="%b '%y"
          // timeAxisTickCount={5}
          >
            <ChartRow height="150">
              <YAxis
                id="followers"
                label="Followers"
                min={hoursSeries.min()}
                max={hoursSeries.max()}
                width="60"
                format=".1f"
                type="linear"
              />
              <Charts>
                <LineChart
                  axis="followers"
                  series={hoursSeries}
                  style={style}
                />
                {/* <BarChart
                  axis="followers"
                  series={hoursSeries}
                  style={style}
                  //spacing={2}
                  info={[{label: "value", value: "3"}]}
                  columns={["value"]}
                  selection={this.state.selection}
                  onSelectionChange={selection => this.setState({selection})}
                /> */}
                <Baseline
                  axis="followers"
                  style={baselineStyleLite}
                  value={hoursSeries.max()}
                  label={`Max ${hoursSeries.max()}`}
                  position="right"
                />
                {/* <Baseline
                  axis="followers"
                  style={baselineStyleLite}
                  value={series.min()}
                  label={`Min ${series.min()}`}
                  position="right"
                /> */}
                <Baseline
                  axis="followers"
                  style={baselineStyleExtraLite}
                  value={hoursSeries.avg() - hoursSeries.stdev()}
                />
                <Baseline
                  axis="followers"
                  style={baselineStyleExtraLite}
                  value={hoursSeries.avg() + hoursSeries.stdev()}
                />
                <Baseline
                  axis="followers"
                  style={baselineStyle}
                  value={hoursSeries.avg()}
                  label={`Avg ${Math.round(hoursSeries.avg())}`}
                  position="right"
                />
              </Charts>
            </ChartRow>
          </ChartContainer>
        </Resizable>}
        { hoursSeries &&
        <Resizable>
          <ChartContainer
          title="New Followers"
          timeRange={hoursSeries.range()}
          titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
          // format="%b '%y"
          // timeAxisTickCount={5}
          >
            <ChartRow height="150">
              <YAxis
                id="deltaFollowers"
                label="Delta"
                min={deltaHoursSeries.min()}
                max={deltaHoursSeries.max()}
                width="60"
                format=".1f"
                type="linear"
              />
              <Charts>
                <BarChart
                  axis="deltaFollowers"
                  series={deltaHoursSeries}
                  style={style}
                  //spacing={2}
                  columns={["value"]}
                  selection={this.state.selection}
                  onSelectionChange={selection => this.setState({selection})}
                />
              </Charts>
            </ChartRow>
         </ChartContainer>
        </Resizable>}
      </div>
    );
  }
}

export default FollowersChart;