import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedUserIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false
    };
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  handleKeyDown = event => {
    if (event.key === "Escape") {
      console.log("esacpe hit");
      this.handleMenuClose();
    }
  };
  handleShowMenu = () => {
    this.setState({ showMenu: true });
  };
  handleMenuClose = () => {
    this.setState({ showMenu: false });
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
  render() {
    return (
      <div>
        <div onClick={this.handleShowMenu}>
          ICON for {this.props.user.username}
        </div>
        {this.state.showMenu && (
          <div className="icon-menu">
            <div>
              <h4>User Icon Menu</h4>
              <button onClick={this.handleMenuClose}>x</button>
            </div>
            <button onClick={this.handleLogout}>Log out</button>
          </div>
        )}
      </div>
    );
  }
}
let mapStateToProps = st => {
  return { user: st.userData };
};

let UserIcon = connect(mapStateToProps)(UnconnectedUserIcon);

export default UserIcon;
