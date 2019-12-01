import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Navbar from "./Navbar.jsx";
import ProjectsPage from "./ProjectsPage.jsx";
import ProjectHub from "./ProjectHub.jsx";
import TaskPage from "./TaskPage.jsx";
import TodoPage from "./TodoPage.jsx";
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
  renderProjectHubOrTaskPage = routerData => {
    let id = routerData.match.params.projectId.split("-");
    let projectId = id[0];
    let taskName = id[1];
    console.log("pid:", projectId, " taskName:", taskName);
    if (
      this.props.user.projects[projectId] !== undefined &&
      taskName === undefined
    ) {
      return <ProjectHub id={id}></ProjectHub>;
    }
    if (
      this.props.user.projects[projectId] !== undefined &&
      taskName !== undefined
    ) {
      return <TaskPage projectId={projectId} taskName={taskName}></TaskPage>;
    } else return <div>Invalid url...</div>;
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
            <TodoPage></TodoPage>
          </Route>
          <Route path="/search" exact={true}>
            <div>Searching...</div>
          </Route>
          <Route
            path="/project/:projectId"
            exact={true}
            render={this.renderProjectHubOrTaskPage}
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
