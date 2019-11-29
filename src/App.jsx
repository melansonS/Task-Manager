import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Navbar from "./Navbar.jsx";
import ProjectsPage from "./ProjectsPage.jsx";
import ProjectHub from "./ProjectHub.jsx";
class UnonnectedApp extends Component {
  componentDidMount() {
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
      this.props.dispatch({ type: "login-success", user: body.user });
    }
  };
  renderProjectHub = routerData => {
    let id = routerData.match.params.projectId;
    return <ProjectHub id={id}></ProjectHub>;
  };

  render = () => {
    if (!this.props.loggedIn) {
      return (
        <BrowserRouter>
          <Login></Login>
          <Route path="/signup" exact={true}>
            <Signup></Signup>
          </Route>
        </BrowserRouter>
      );
    } else {
      return (
        <BrowserRouter>
          <Navbar></Navbar>
          <Route path="/home" exact={true}>
            <div>
              <h1>HOMEPAGE</h1>
            </div>
          </Route>
          <Route path="/projects" exact={true}>
            <ProjectsPage></ProjectsPage>
          </Route>
          <Route path="/todo" exact={true}>
            <div>Todo!</div>
          </Route>
          <Route path="/search" exact={true}>
            <div>Searching...</div>
          </Route>
          <Route
            path="/project/:projectId"
            exact={true}
            render={this.renderProjectHub}
          ></Route>
        </BrowserRouter>
      );
    }
  };
}
let mapStateToProps = st => {
  return {
    loggedIn: st.isLoggedIn,
    user: st.userData
  };
};
let App = connect(mapStateToProps)(UnonnectedApp);

export default App;
