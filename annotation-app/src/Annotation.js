import * as React from 'react';
import Question from './Question';
import Login from './Login';
import './Question.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Link, BrowserRouter  as Router, Switch, Route } from 'react-router-dom';


export default class Annotation extends React.Component {  
  state = {
    entity:''
  };
  
  constructor(props) {
    super(props);

  }
  
  componentDidMount() {
    this.setState({
       entity: 'Cajal Bodies'
    });
  }


  render () {
    return (
      
      <div> 
        <AppBar position="static">
          <Toolbar>
            <Router> 
              <Typography style={{fontSize: 24}}> Home </Typography>
              <Typography style={{fontSize: 24, color: "white"}}> <a href="/login">  Login </a> </Typography> 
            </Router> 
          </Toolbar> 
        </AppBar> 
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <Question question_id="2" />
        <Question question_id="3" /> 
        <Question question_id="4" /> 
        
      </div> 
    );
  }
}

