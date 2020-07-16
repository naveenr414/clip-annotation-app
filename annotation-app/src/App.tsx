import * as React from "react";
import * as s from "./App.css";
import Annotation from "./Annotation";
import Question from "./Question";  
import Login from "./Login";
import Register from "./Register";
import PacketCreation from "./PacketCreation";
import PacketDeletion from "./PacketDeletion";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/question/:num" component={Question} />
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/packet"> 
          <PacketCreation />
        </Route> 
        <Route path="/delete"> 
          <PacketDeletion />
        </Route> 

        <Route path="/">
          <Annotation/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
