import React, { Component } from "react";
import { connect } from "react-redux";
import Signup from "./Signup.jsx";
import "./styling/Login.css";
class UnconnectedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      signup: false,
      errorMap: {}
    };
  }
  componentDidMount = () => {
    document.addEventListener("click", this.handleModalClick);
  };
  handleModalClick = event => {
    let modal = document.getElementsByClassName("signup-modal")[0];
    if (event.target === modal) {
      this.closeSignup();
    }
  };

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
      this.getNotifications();
    }
    this.putError("loginUsername");
    this.putError("loginPassword");
    console.log("response body:", body);
  };
  getNotifications = async () => {
    console.log("notifications mount");
    let data = new FormData();
    data.append("user", this.state.username);
    let response = await fetch("/get-notifications", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("get notifications reponse body:", body);
    if (body.success) {
      let unreadNotifications = 0;
      body.notificationsArr.forEach(notification => {
        if (!notification.read) {
          unreadNotifications++;
        }
      });
      this.props.dispatch({
        type: "update-unread-notifications",
        num: unreadNotifications
      });
    }
  };

  openSignup = event => {
    this.setState({ signup: true });
  };
  closeSignup = () => {
    this.setState({ signup: false });
  };

  putError = str => {
    // console.log("Put error hit:", str);
    this.setState({ errorMap: { ...this.state.errorMap, [str]: true } });
  };
  getStyle = str => {
    // console.log("get style error map:", this.state.errorMap);
    if (this.state.errorMap[str]) {
      return { borderBottom: "1px  rgb(187, 40, 40) solid" };
    }
  };

  render() {
    return (
      <div className="login-background">
        <div className="login-body">
          <div className="login-logo">
            <img src="/img/placeholder.com-logo3.png"></img>
          </div>
          <div className="login-form">
            <h3>Login</h3>
            <form onSubmit={this.handleSubmit}>
              <div>
                <input
                  type="text"
                  onChange={this.handleUsernameChange}
                  style={this.getStyle("loginUsername")}
                  required
                  placeholder="Username"
                ></input>
              </div>
              <div>
                <input
                  type="password"
                  onChange={this.handlePasswordChange}
                  style={this.getStyle("loginPassword")}
                  placeholder="Password"
                  required
                ></input>
              </div>
              <input type="submit"></input>
            </form>
            <button onClick={this.openSignup}>Signup</button>
            {this.state.signup && (
              <div className="signup-modal">
                <div className="signup-modal-content">
                  <span className="close" onClick={this.closeSignup}>
                    X
                  </span>
                  <Signup></Signup>
                </div>
              </div>
            )}
          </div>
        </div>
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
