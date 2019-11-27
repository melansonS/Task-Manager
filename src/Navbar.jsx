import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

import UserIcon from "./UserIcon.jsx";

class UnconnectNavbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: ""
    };
  }
  handleSearchSubmit = event => {
    event.preventDefault();
    console.log("Searching for...", this.state.searchQuery);
    this.setState({ searchQuery: "" });
    this.props.history.push("/search");
  };
  handleSearchChange = event => {
    this.setState({ searchQuery: event.target.value });
  };

  render() {
    return (
      <div className="navbar">
        <UserIcon></UserIcon>
        <div className="navbar-buttons">
          <Link to="/projects">
            <div>Projects</div>
          </Link>
          <Link to="/todo">
            <div>Todo</div>
          </Link>
        </div>
        <Link to="/home">
          <img
            src="\img\placeholder.com-logo3.png"
            style={{ height: "40px" }}
          />
        </Link>
        <form onSubmit={this.handleSearchSubmit}>
          <input
            type="text"
            placeholder="search"
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
          ></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let Navbar = connect(mapStateToProps)(withRouter(UnconnectNavbar));

export default Navbar;
