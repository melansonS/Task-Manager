import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class UnconnedtedTaskPage extends Component {
  constructor(props) {
    super(props);
    this.state = { task: undefined };
  }
  componentDidMount() {
    this.getTaskData();
  }
  getTaskData = async () => {
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    let response = await fetch("/task-data", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log(body);
    if (body.success) {
      this.setState({ task: body.taskData });
    }
  };
  render() {
    if (this.state.task === undefined) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <div>
          <h2>Title:</h2>
          {this.state.task.title}
          <h4>Description:</h4>
          {this.state.task.description}
        </div>
        <Link to={"/project/" + this.props.projectId}>Project Hub</Link>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TaskPage = connect(mapStateToProps)(UnconnedtedTaskPage);

export default TaskPage;
