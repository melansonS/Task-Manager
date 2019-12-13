import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import TaskCard from "./TaskCard.jsx";

import "./styling/SearchResults.css";

class UnconnectedSearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: []
    };
  }
  componentDidMount() {
    this.taskSearch();
  }
  taskSearch = async () => {
    if (
      this.props.search === "" ||
      Object.keys(this.props.user.projects).length <= 0
    ) {
      return;
    }

    console.log("searching for:", this.props.search);
    let data = new FormData();
    data.append("searchInput", this.props.search);
    data.append("projectIds", Object.keys(this.props.user.projects));
    data.append("username", this.props.user.username);
    let response = await fetch("/search", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("search respnse body:", body);
    if (body.success) {
      this.setState({ tasks: body.searchResults });
    }
  };
  componentDidUpdate(prevProps) {
    if (this.props.search !== prevProps.search) {
      this.taskSearch();
    }
  }

  render() {
    if (this.state.tasks.length === 0) {
      return (
        <div className="search-results-body">
          <div className="search-results-content">
            <h2>Search Results</h2>
            <h3 className="no-tasks-found">No tasks found...</h3>
          </div>
        </div>
      );
    }
    let taskCardElems = this.state.tasks.map(task => {
      return <TaskCard task={task} projectId={task.pid}></TaskCard>;
    });
    return (
      <div className="search-results-body">
        <div className="search-results-content">
          <h2>Search Results</h2>
          <div>{taskCardElems}</div>
        </div>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData, search: st.searchQuery };
};

let SearchResults = connect(mapStateToProps)(UnconnectedSearchResults);

export default SearchResults;
