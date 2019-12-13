import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class UnconnectedSignup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      errorMap: {}
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
        email: this.state.email,
        projects: {}
      };
      this.props.dispatch({ type: "login-success", user });
      this.props.history.push("/projects");
    } else if (body.usernameTake) {
      window.alert("Username already in use!");
      this.putError("signupUsername");
    } else {
      window.alert("Something went wrong...");
    }
  };

  putError = str => {
    // console.log("Put error hit:", str);
    this.setState({ errorMap: { ...this.state.errorMap, [str]: true } });
  };
  removeError = str => {
    this.setState({ errorMap: { ...this.state.errorMap, [str]: false } });
  };
  getStyle = str => {
    // console.log("get style error map:", this.state.errorMap);
    if (this.state.errorMap[str]) {
      return { borderBottom: "1px  rgb(187, 40, 40) solid" };
    }
  };

  render() {
    return (
      <div>
        <h3>Signup</h3>
        <form onSubmit={this.handleSubmit}>
          <div>
            <input
              type="text"
              style={this.getStyle("signupUsername")}
              onChange={this.handleUsernameChange}
              placeholder="Username"
              required
            ></input>
          </div>
          <div>
            <input
              type="password"
              onChange={this.handlePasswordChange}
              placeholder="Password"
              required
            ></input>
          </div>
          <div>
            <input
              type="email"
              onChange={this.handleEmailChange}
              placeholder="Email"
              required
            ></input>
          </div>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

let Signup = connect()(withRouter(UnconnectedSignup));

export default Signup;
