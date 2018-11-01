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

  daysFollowers = (followers) => {
    return followers.reduce((accumulator, current) => {
      accumulator[this.daysIntoYear(current[0])] = current[1]
      return accumulator
    },
    {})
  }
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
        <div>
          <div className="graphTitle">
            <p>Total Followers</p>
            <p>{hoursSeries.atLast().get("value")}</p>
          </div>
          <Resizable>
            <ChartContainer
            timeRange={hoursSeries.range()}
            titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
            // format="%b '%y"
            // timeAxisTickCount={5}
            >
              <ChartRow height="150">
                <Charts>
                  <LineChart
                    axis="followers"
                    series={hoursSeries}
                    style={style}
                  />
                </Charts>
                <YAxis
                  id="followers"
                  min={hoursSeries.min()}
                  max={hoursSeries.max()}
                  width="60"
                  format=".1f"
                  type="linear"
                  showGrid
                />
              </ChartRow>
            </ChartContainer>
          </Resizable>
        </div>}
        { hoursSeries &&
        <div>
          <div className="graphTitle">
            <p>New Followers</p>
            <p>{deltaHoursSeries.sum()}</p>
          </div>
          <Resizable>
            <ChartContainer
            timeRange={hoursSeries.range()}
            titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
            >
              <ChartRow height="150">
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
                <YAxis
                  id="deltaFollowers"
                  min={deltaHoursSeries.min()}
                  max={deltaHoursSeries.max()}
                  width="60"
                  format=".1f"
                  type="linear"
                  showGrid
                />
              </ChartRow>
          </ChartContainer>
          </Resizable>
        </div>}
      </div>
    );
  }
}

export default FollowersChart;
