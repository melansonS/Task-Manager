import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Notifications from "./Notifications.jsx";
import "./main.css";

import { IoMdPerson } from "react-icons/io";

class UnconnectedUserIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      showUserSettings: false,
      newEmail: "",
      newPassword: "",
      passwordConfirmation: ""
    };
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("click", this.handleModalClick);
  }

  handleModalClick = event => {
    let modal = [];
    modal.push(document.getElementsByClassName("icon-menu-modal")[0]);
    modal.push(document.getElementsByClassName("user-settings-modal")[0]);
    if (modal.includes(event.target)) {
      this.handleMenuClose();
    }
  };
  handleKeyDown = event => {
    if (event.key === "Escape") {
      console.log("esacpe hit");
      this.handleMenuClose();
    }
  };
  handleShowMenu = () => {
    this.setState({ showMenu: true });
  };
  handleShowUserSettings = () => {
    this.setState({ showUserSettings: true });
  };
  handleMenuClose = () => {
    this.setState({ showMenu: false, showUserSettings: false });
  };

  handleEmailChange = event => {
    this.setState({ newEmail: event.target.value });
  };

  handlePasswordChange = event => {
    this.setState({ newPassword: event.target.value });
  };
  handlePasswordConfirmationChange = event => {
    this.setState({ passwordConfirmation: event.target.value });
  };

  handleEmailSubmit = async event => {
    event.preventDefault();
    console.log("updating Email");
    let data = new FormData();
    data.append("user", this.props.user.username);
    data.append("newEmail", this.state.newEmail);
    let response = await fetch("/update-email", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("update email response body:", body);
    if (body.success) {
      this.handleMenuClose();
    }
  };

  handlePasswordSubmit = async event => {
    event.preventDefault();
    if (this.state.newPassword === this.state.passwordConfirmation) {
      console.log("Updating passwords");
      let data = new FormData();
      data.append("user", this.props.user.username);
      data.append("newPass", this.state.newPassword);
      let response = await fetch("/update-password", {
        method: "POST",
        body: data
      });
      let body = await response.text();
      body = JSON.parse(body);
      console.log("update password response body:", body);
      if (body.success) {
        this.handleMenuClose();
      }
    }
  };

  handleLogout = async () => {
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
  testEmail = async () => {
    let data = new FormData();
    data.append("name", this.props.user.username);
    data.append("email", this.props.user.email);
    let response = await fetch("/test-email", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("test email response body:", body);
  };

  render() {
    return (
      <div>
        <div onClick={this.handleShowMenu} className="navbar-user">
          <IoMdPerson className="user-icon" /> {this.props.user.username}
          {this.props.unreadN > 0 && (
            <div className="unread-notifications-count">
              {this.props.unreadN}
            </div>
          )}
        </div>
        {this.state.showMenu && (
          <div class="icon-menu-modal">
            <div className="icon-menu">
              <div className="icon-menu-header">
                <h4>Menu</h4>
                <span onClick={this.handleMenuClose} className="close">
                  X
                </span>
              </div>
              <div>
                <button onClick={this.handleShowUserSettings}>
                  User Settings
                </button>
              </div>
              <div>
                <Link to="/notifications" onClick={this.handleMenuClose}>
                  <b>All Notifications</b>
                </Link>
              </div>
              <div>
                <button onClick={this.handleLogout}>Log out</button>
              </div>
              <div className="menu-notifications">
                <Notifications closeMenu={this.handleMenuClose}></Notifications>
              </div>
              {this.state.showUserSettings && (
                <div className="user-settings-modal">
                  <div className="user-settings-modal-content">
                    <h4>Update Email:</h4>
                    <form onSubmit={this.handleEmailSubmit}>
                      <div>
                        <input
                          type="email"
                          onChange={this.handleEmailChange}
                          placeholder="New Email"
                          required
                        ></input>
                      </div>
                      <input type="submit" value="Submit"></input>
                    </form>
                    <h4>Update Password:</h4>
                    <form onSubmit={this.handlePasswordSubmit}>
                      <div>
                        <input
                          type="password"
                          onChange={this.handlePasswordChange}
                          required
                          placeholder="New Password"
                        ></input>
                      </div>
                      <div>
                        <input
                          type="password"
                          onChange={this.handlePasswordConfirmationChange}
                          required
                          placeholder="Confrim Password"
                        ></input>
                      </div>
                      <input type="submit" value="Submit"></input>
                    </form>
                    <span onClick={this.handleMenuClose} className="close">
                      X
                    </span>
                    <button onClick={this.testEmail}>
                      Send me email notifications!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
let mapStateToProps = st => {
  return { user: st.userData, unreadN: st.unreadNotifications };
};

let UserIcon = connect(mapStateToProps)(UnconnectedUserIcon);

export default UserIcon;
