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
    };
  }

  componentDidMount = () => {
    fetch("https://g43v3qwvj7.execute-api.eu-west-3.amazonaws.com/dev/followers")
      .then(res => res.json())
      .then(datas => {
        const hoursFollowers = datas.map(timestamp => {
          return [new Date(timestamp.checkedDate.S), parseInt(timestamp.followers.N, 10)]
        })
        hoursFollowers.sort(function(a, b){
          return a[0] - b[0];
        })

        //console.log(hoursFollowers)

        const hoursSeriesTime = hoursFollowers.map(([date, followers]) => {
          return [date.getTime(), followers]
        })

        const daysFollowersMap = this.daysFollowers(hoursFollowers)
        const daysFollowers = Object.entries(daysFollowersMap)

        // console.log(daysFollowers)
        // const daysSeriesTime = daysFollowers.map(([date, followers]) => {
        //   console.log("date ", date)
        //   console.log("followers ", followers)
        //   return [date.getTime(), followers]
        // })

        // timeSeries.sort(function(a, b){
        //   return a[0] - b[0];
        // })

        //console.log('TimeSeries', timeSeries)
        // hoursFollowers.forEach(([date, followers]) => {
        //   //console.log(this.daysIntoYear(date))
        //   //console.log(date.getMonth())
        // })
        const deltaFollowersSeries =  this.calculateSeriesDelta(hoursSeriesTime)
        // const dates = datas.map(timestamp => {
        //   return [new Date(timestamp.checkedDate.S), parseInt(timestamp.followers.N, 10)]
        // })

        // dates.sort(function(a, b){
        //   return a[0].getTime() - b[0].getTime();
        // });

        const hoursSeries = new TimeSeries({
          name: "Followers",
          columns: ["index", "value"],
          points: hoursSeriesTime.map(([d, value]) => [Index.getIndexString("1h", new Date(d)), value])
        });

        // const daysSeries = new TimeSeries({
        //   name: "Followers",
        //   columns: ["index", "value"],
        //   points: hoursSeriesTime.map(([d, value]) => [Index.getIndexString("1d", new Date(d)), value])
        // });

        const deltaHoursSeries = new TimeSeries({
          name: "Followers",
          columns: ["index", "value"],
          points: deltaFollowersSeries.map(([d, value]) => [Index.getIndexString("1h", new Date(d)), value])
        });

        this.setState((state) => {
          return {
            ...state,
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

  daysIntoYear = (date) =>  {
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
  }

  calculateSeriesDelta = (orderedTimeSeries) => {
    return orderedTimeSeries.map((value, index, array) => {
      const delta = index > 0 ? value[1] - array[index-1][1] : 0
      return [value[0], delta]
    })
  }

  handleTrackerChanged = tracker => {
    this.setState({ tracker });
  };

  handleTimeRangeChange = timerange => {
    this.setState({ timerange });
  };

  render() {
    const { hoursSeries, deltaHoursSeries } = this.state;

    return (
      <div className="FollowersChart">
        { hoursSeries &&
        <Resizable>
          <ChartContainer
          title="Adrelanine Followers"
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
              {/* <LineChart
                axis="followers"
                series={series}
                style={style}
              /> */}
              <BarChart
                axis="followers"
                series={hoursSeries}
                style={style}
                //spacing={2}
                info={[{label: "value", value: "3"}]}
                columns={["value"]}
                selection={this.state.selection}
                onSelectionChange={selection => this.setState({selection})}
              />
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
              {/* <LineChart
                axis="followers"
                series={series}
                style={style}
              /> */}
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
