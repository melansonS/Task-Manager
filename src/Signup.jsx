import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedSignup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: ""
    };
  }
  handleUsernameChange = event => {
    this.setState({ username: event.target.value });
  };
  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };
  handleEmailChange = event => {
    this.setState({ email: event.target.value });
  };
  handleSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.state.username);
    data.append("password", this.state.password);
    data.append("email", this.state.email);
    let response = await fetch("/signup", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      console.log("signup successful!");
      let user = {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email
      };
      this.props.dispatch({ type: "login-success", user });
    } else if (body.usernameTake) {
      window.alert("Username already in use!");
    } else {
      window.alert("Something went wrong...");
    }
  };

  render() {
    return (
      <div>
        <h3>Signup</h3>
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
          Email:
          <input
            type="email"
            onChange={this.handleEmailChange}
            required
          ></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

let Signup = connect()(UnconnectedSignup);

export default Signup;
