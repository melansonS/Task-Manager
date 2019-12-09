import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

import UserIcon from "./UserIcon.jsx";
import { IoIosSearch } from "react-icons/io";

class UnconnectNavbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: ""
    };
  }
  handleSearchSubmit = event => {
    event.preventDefault();
    this.props.dispatch({ type: "search", query: this.state.searchQuery });
    this.setState({ searchQuery: "" });
    this.props.history.push("/search");
  };
  handleSearchChange = event => {
    this.setState({ searchQuery: event.target.value });
  };

  render() {
    return (
      <div className="navbar">
        <div className="navbar-content">
          <UserIcon></UserIcon>
          <div className="navbar-buttons">
            <Link to="/projects">
              <div>Projects</div>
            </Link>
            <Link to="/todo">
              <div>Todo</div>
            </Link>
          </div>
          <Link to="/">
            <img
              src="\img\placeholder.com-logo3.png"
              style={{ height: "40px" }}
            />
          </Link>
          <div></div>

          <form onSubmit={this.handleSearchSubmit}>
            <input
              type="text"
              placeholder="search..."
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
            ></input>

            {/* ////////////////////////////////////////SEARCH ICON -> USING A LABEL WITH AN ICON TO DISPLAY */}
            {/* /////////////////////////////////////// STYLING HERE NEEDS TO BE MOVED TO CSS FILE */}
            <button id="search" style={{ display: "none" }}></button>
            <label for="search">
              <IoIosSearch style={{ margin: "0px 10px", fontSize: "20px" }} />
            </label>
          </form>
        </div>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let Navbar = connect(mapStateToProps)(withRouter(UnconnectNavbar));

export default Navbar;
