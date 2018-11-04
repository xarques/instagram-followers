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
import {
  toDateAndFollowersArray,
  buildTimeSeries,
  buildIndexTimeSeries,
  toDateAndDeltaFollowersArray,
  buildFullTimeSeries,
  buildCroppedTimeSeries,
  buildCroppedTimeSeriesDelta
}
  from './utils'
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
      interval: '1d'
    };
  }

  componentDidMount = () => {
    const accountId = this.props.match.params.accountId || 'adrelanine'
    fetch(`https://g43v3qwvj7.execute-api.eu-west-3.amazonaws.com/dev/followers/${accountId}`)
      .then(res => res.json())
      .then(data => {
        const hoursAndFollowersArray = toDateAndFollowersArray(data)
        const fullFollowersSeries = buildFullTimeSeries('Followers', hoursAndFollowersArray)
        const croppedFollowersSeries = buildCroppedTimeSeries(fullFollowersSeries, '1h')

        const deltaHoursAndFollowersArray =  toDateAndDeltaFollowersArray(hoursAndFollowersArray)
        const fullDeltaFollowersSeries = buildFullTimeSeries('Followers', deltaHoursAndFollowersArray)
        const croppedDeltaFollowersSeries = buildCroppedTimeSeriesDelta(fullDeltaFollowersSeries, '1h')

        this.setState((state) => {
          return {
            ...state,
            fullFollowersSeries,
            croppedFollowersSeries,
            fullDeltaFollowersSeries,
            croppedDeltaFollowersSeries,
          }
        });
      });
  }

  onClick = (interval) => {
    this.setState(state => ({
      ...state,
      interval: interval,
      croppedFollowersSeries: buildCroppedTimeSeries(state.fullFollowersSeries, interval),
      croppedDeltaFollowersSeries: buildCroppedTimeSeriesDelta(state.fullDeltaFollowersSeries, interval)

    }))
  }

  render() {
    const { interval, croppedFollowersSeries, croppedDeltaFollowersSeries } = this.state;
    const accountId = this.props.match.params.accountId || 'adrelanine'

    return (
      <div className="followersChart">
        <h1>{accountId}</h1>
        <div className="dateInterval">
          <button className={`button ${interval === '1d' ? 'button-selected' : ''}`} onClick={() => this.onClick('1d')}>1D</button>
          <button className={`button ${interval === '1w' ? 'button-selected' : ''}`} onClick={() => this.onClick('1w')}>1W</button>
          <button className={`button ${interval === '1m' ? 'button-selected' : ''}`} onClick={() => this.onClick('1m')}>1M</button>
          <button className={`button ${interval === '3m' ? 'button-selected' : ''}`} onClick={() => this.onClick('3m')}>3M</button>
        </div>

        { croppedFollowersSeries &&
        <div>
          <div className="graphTitle">
            <p>Total Followers</p>
            <p>{croppedFollowersSeries.atLast().get("value")}</p>
          </div>
          <Resizable>
            <ChartContainer
            timeRange={croppedFollowersSeries.range()}
            titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
            // format="%b '%y"
            // timeAxisTickCount={5}
            >
              <ChartRow height="150">
                <Charts>
                  <LineChart
                    axis="followers"
                    series={croppedFollowersSeries}
                    style={style}
                  />
                </Charts>
                <YAxis
                  id="followers"
                  min={croppedFollowersSeries.min()}
                  max={croppedFollowersSeries.max()}
                  width="60"
                  format=".1f"
                  type="linear"
                  showGrid
                />
              </ChartRow>
            </ChartContainer>
          </Resizable>
        </div>}
        { croppedDeltaFollowersSeries &&
        <div>
          <div className="graphTitle">
            <p>New Followers</p>
            <p>{croppedDeltaFollowersSeries.sum()}</p>
          </div>
          <Resizable>
            <ChartContainer
            timeRange={croppedDeltaFollowersSeries.range()}
            titleStyle={{ fill: "#555", fontWeight: 500, fontSize: '1.5em' }}
            >
              <ChartRow height="150">
                <Charts>
                  <BarChart
                    axis="deltaFollowers"
                    series={croppedDeltaFollowersSeries}
                    style={style}
                    //spacing={2}
                    columns={["value"]}
                    selection={this.state.selection}
                    onSelectionChange={selection => this.setState({selection})}
                  />
                </Charts>
                <YAxis
                  id="deltaFollowers"
                  min={croppedDeltaFollowersSeries.min()}
                  max={croppedDeltaFollowersSeries.max()}
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
