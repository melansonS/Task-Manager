import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Navbar from "./Navbar.jsx";
import SearchResults from "./SearchResults.jsx";
import ProjectsPage from "./ProjectsPage.jsx";
import ProjectHub from "./ProjectHub.jsx";
import TaskPage from "./TaskPage.jsx";
import TodoPage from "./TodoPage.jsx";
import Notifications from "./Notifications.jsx";
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
    // console.log("AutoLogin:", body);
    if (body.success) {
      this.props.dispatch({ type: "login-success", user: body.user });
      this.getNotifications();
      this.notificationCheck();
    }
  };
  //check for new notifications!
  // interval set to 5 seconds, can be made shorter or longer depending on how frequently I want to check for new notifications
  notificationCheck = () => {
    setInterval(() => {
      if (this.props.loggedIn) {
        this.getNotifications();
      }
    }, 5000);
  };

  getNotifications = async () => {
    let data = new FormData();
    data.append("user", this.props.user.username);
    let response = await fetch("/get-notifications", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
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
  renderProjectHubOrTaskPage = routerData => {
    let id = routerData.match.params.projectId.split("-");
    let projectId = id[0];
    let taskName = id[1];
    // console.log("pid:", projectId, " taskName:", taskName);
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
    } else return <h2 className="invalid-url">Invalid url...</h2>;
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
          <Route path="/" exact={true}>
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
            <SearchResults></SearchResults>
          </Route>
          <Route
            path="/project/:projectId"
            exact={true}
            render={this.renderProjectHubOrTaskPage}
          ></Route>
          <Route path="/notifications" exact={true}>
            <Notifications allNotifications={true}></Notifications>
          </Route>
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
