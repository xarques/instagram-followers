import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import FollowersChart from "./FollowersChart";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route
            exact
            path="/instagram-followers/:accountId"
            component={FollowersChart}
          />
          <Route component={FollowersChart} />
        </Switch>
      </div>
    );
  }
}

export default App;
