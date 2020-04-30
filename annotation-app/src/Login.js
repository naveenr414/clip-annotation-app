import React from 'react';  

export default class Login extends React.Component {
  render() {
   return (
  <div>
    <form action="http://localhost:8000/token" method="post">
      <label for="uname"><b>Username</b></label>
      <input type="text" placeholder="Enter Username" name="username" />

    <label for="psw"><b>Password</b></label>
    <input type="password" placeholder="Enter Password" name="password" />

    <button type="submit">Login</button>
    </form> 
  </div>
    );
  }
}
