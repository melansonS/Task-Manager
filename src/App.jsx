import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
class UnonnectedApp extends Component {
  componentDidMount() {
    //this.runTest();
    this.autoLoggin();
  }
  autoLoggin = async () => {
    let response = await fetch("/auto-login", {
      method: "POST",
      credentials: "include"
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("AutoLogin:", body);
    if (body.success) {
      this.props.dispatch({ type: "login-success" });
    }
  };
  runTest = async () => {
    console.log("running test");
    let response = await fetch("/test", { method: "GET" });
    let body = await response.text();
    // body = JSON.parse(body);
    console.log("response body:", body);
  };
  handleLogout = async event => {
    let response = await fetch("/logout", {
      method: "POST",
      credentials: "include"
    });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      console.log("loggin out");
      this.props.dispatch({ type: "logout" });
    } else {
      window.alert("something went wrong...");
    }
  };
  render = () => {
    return (
      <BrowserRouter>
        <div>Howdy</div>
        {this.props.loggedIn && (
          <div>
            Login success!<button onClick={this.handleLogout}>Log out</button>
          </div>
        )}
        <Route path="/login" exact={true}>
          <div>Login</div>
          <Login></Login>
        </Route>
        <Route path="/signup" exact={true}>
          <div>Signup:</div>
          <Signup></Signup>
        </Route>
      </BrowserRouter>
    );
  };
}
let mapStateToProps = st => {
  return {
    loggedIn: st.isLoggedIn
  };
};
let App = connect(mapStateToProps)(UnonnectedApp);

export default App;
