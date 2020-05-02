import * as React from 'react';
import Question from './Question';
import Login from './Login';
import './Question.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Redirect, Link, BrowserRouter  as Router, Switch, Route } from 'react-router-dom';


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
  
  logout = () => {
    window.sessionStorage.removeItem('token');
    this.setState({});
  }


  render () {
    
    if(window.sessionStorage.getItem('token') == null) {
      return ( <Redirect to="/login" />); 
    }
 
    return (
      
      <div> 
        <AppBar position="static">
          <Toolbar>
            <Router> 
              <Typography style={{fontSize: 24,marginLeft: 50,}}> <Link href="/" style={{color:"white", textDecoration: "none", textAlign: "right"}}> Home </Link> </Typography>
              <Typography style={{fontSize: 24, marginLeft: 50,}}> <Link href="/login" style={{color:"white", textDecoration: "none", textAlign: "right"}}>  Login </Link> </Typography> 
              <Typography style={{fontSize: 24, marginLeft: 50,}}> <Link onClick={this.logout} href="/login" style={{color:"white", textDecoration: "none", textAlign: "right"}}>  Logout </Link> </Typography> 
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

