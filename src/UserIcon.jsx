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
    // document.addEventListener("click", this.handleKeyDown);
  }
  handleKeyDown = event => {
    console.log("event listener event:", event.target);
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
          <div className="icon-menu">
            <div className="icon-menu-header">
              <h4>User Icon Menu</h4>
              <button onClick={this.handleMenuClose}>x</button>
            </div>

            <button onClick={this.handleShowUserSettings}>User Settings</button>
            <button onClick={this.handleLogout}>Log out</button>
            <div className="menu-notifications">
              <Link to="/notifications" onClick={this.handleMenuClose}>
                Notifications
              </Link>

              <Notifications closeMenu={this.handleMenuClose}></Notifications>
            </div>
            {this.state.showUserSettings && (
              <div>
                Update Email:
                <form onSubmit={this.handleEmailSubmit}>
                  <input
                    type="email"
                    onChange={this.handleEmailChange}
                    required
                  ></input>
                  <input type="submit"></input>
                </form>
                Update Password:
                <form onSubmit={this.handlePasswordSubmit}>
                  <input
                    type="password"
                    onChange={this.handlePasswordChange}
                    required
                    placeholder="New Password"
                  ></input>
                  <input
                    type="password"
                    onChange={this.handlePasswordConfirmationChange}
                    required
                    placeholder="Confrim Password"
                  ></input>
                  <input type="submit"></input>
                </form>
              </div>
            )}
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
