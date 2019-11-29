import React, { Component } from "react";
import { connect } from "react-redux";
import Signup from "./Signup.jsx";

class UnconnectedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      signup: false
    };
  }
  handleUsernameChange = event => {
    this.setState({ username: event.target.value });
  };
  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };
  handleSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.state.username);
    data.append("password", this.state.password);
    let response = await fetch("/login", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      console.log("logging in!");
      this.props.dispatch({ type: "login-success", user: body.user });
    }
    console.log("response body:", body);
  };
  openSignup = event => {
    this.setState({ signup: true });
  };
  closeSignup = () => {
    this.setState({ signup: false });
  };
  render() {
    return (
      <div>
        <h3>Login</h3>
        <form onSubmit={this.handleSubmit}>
          Username:
          <input
            type="text"
            onChange={this.handleUsernameChange}
            required
          ></input>
          Password:
          <input
            type="text"
            onChange={this.handlePasswordChange}
            required
          ></input>
          <input type="submit"></input>
        </form>
        <button onClick={this.openSignup}>Signup</button>
        {this.state.signup && (
          <div>
            <button onClick={this.closeSignup}>x</button>
            <Signup></Signup>
          </div>
        )}
      </div>
    );
  }
}
let mapStateToProps = st => {
  return {
    loggedIn: st.isLoggedIn
  };
};

let Login = connect(mapStateToProps)(UnconnectedLogin);

export default Login;
