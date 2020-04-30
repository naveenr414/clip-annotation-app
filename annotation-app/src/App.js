import React from 'react';
import logo from './logo.svg';
import './App.css';
import Annotation from './Annotation';
import Login from './Login';
import { Link, BrowserRouter  as Router, Switch, Route } from 'react-router-dom';


function App() {
  return (
  <Router>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/"> 
        <Annotation />
      </Route> 
    </Switch>
  </Router>   
  );
}

export default App;
