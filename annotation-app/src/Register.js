 import React from 'react';  
import {Redirect} from 'react-router-dom';

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '',
    password: '',token:''};
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleUsername(event) {
    this.setState({username: event.target.value});
  }
  
  handlePassword(event) {
    this.setState({password: event.target.value});
  }
  
  
  handleSubmit(event) {
    let data = 'username='+encodeURIComponent(this.state.username)+'&password='+encodeURIComponent(this.state.password);
    fetch('http://localhost:8000/token/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded',
      'accept':'application/json'},
      body: data,
    }).then(res=>res.json())
      .then((result) => {
        if('access_token' in result) {
          let token = result['access_token'];
          window.sessionStorage.setItem("token", token);
          console.log(window.sessionStorage.getItem("token"));
          this.setState({'username':this.state.username});
        }
        else {
          this.setState({'username':'','password':''});
        }
      });
    event.preventDefault();

  }
  
  
  render() {
    if(window.sessionStorage.getItem("token")) {
      return ( <Redirect to="/" />);
    }
    
   return (
      <form onSubmit={this.handleSubmit}>
        <h3> Register </h3> 
        <label>
          Email:   

          <input type="text" value={this.state.username} onChange={this.handleUsername} />
        </label>
        <label>
          Password:
          <input type="password" value={this.state.password} onChange={this.handlePassword} />
        </label>

        <input type="submit" value="Submit" />
      </form>
    );
  }
}
