import * as React from 'react';  
import {Redirect} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import * as login_css from './Login.css';

interface Props {

}

interface State {
	username: string,
	password: string,
	token: string,
}

export default class Login extends React.Component<Props,State> {
  constructor(props:Props) {
    super(props);
    this.state = {username: '',
    password: '',token:''};
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({username: event.target.value});
  }
  
  handlePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({password: event.target.value});
  }
  
  
  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let data = 'username='+encodeURIComponent(this.state.username)+'&password='+encodeURIComponent(this.state.password);
    fetch('http://localhost:8000/token', {
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
    
    console.log(login_css);
    
    return (
    <Container maxWidth="xs">
      <CssBaseline />
      <div className="paper">
        <Avatar className="avatar">
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
        <form className="form" noValidate onSubmit={this.handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            value={this.state.username} 
            onChange={this.handleUsername}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={this.state.password} 
            onChange={this.handlePassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="submit"
          >
          Sign In
          </Button>
          <Grid container className="signup">
            <Grid item xs>
            </Grid>
            <Grid item>
              <a href="/register" className="register">
                {"Don't have an account? Sign Up"}
              </a>
            </Grid>
          </Grid>
        </form> 
      </div> 
    </Container>
   
    );
  }
}
