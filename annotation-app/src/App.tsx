import * as React from "react";
import * as s from "./App.css";
import Annotation from "./Annotation";
import Login from "./Login";
import Register from "./Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  console.log("App style "+s);
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/">
          <Annotation/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
