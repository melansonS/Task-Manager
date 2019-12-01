import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

class UnconnedtedTaskPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      task: undefined,
      today: new Date(),
      admin: false,
      newDueDate: "",
      newDescription: "",
      newAssignee: ""
    };
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
      this.setState({
        task: body.taskData,
        newDescription: body.taskData.description,
        newDueDate: body.taskData.dueDate
      });
      if (this.props.user.projects[this.props.projectId] === "admin") {
        console.log("is admin!");
        this.setState({ admin: true });
      }
    }
  };
  handleAssigneeChange = event => {
    this.setState({ newAssignee: event.target.value });
  };
  handleAssignTo = async event => {
    event.preventDefault();
    console.log("assigning to :", this.state.newAssignee);
    let data = new FormData();
    data.append("assignee", this.state.newAssignee);
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    let response = await fetch("/reassign-task", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("reassign response body:", body);
  };
  handleDateChange = async date => {
    console.log("updating due date! :", date.toLocaleDateString());
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    data.append("dueDate", date.toLocaleDateString());
    let response = await fetch("/update-task-due-date", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("update due date response body:", body);
    this.setState({
      newDueDate: date.toLocaleDateString()
    });
  };
  handleDescriptionChange = event => {
    this.setState({ newDescription: event.target.value });
  };

  submitDescription = event => {
    event.preventDefault();
    console.log(this.state.newDescription);
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    data.append("description", this.state.newDescription);
    fetch("/update-task-description", {
      method: "POST",
      body: data
    });
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
          <form onSubmit={this.submitDescription}>
            <textarea
              rows="10"
              cols="80"
              readOnly={!this.state.admin}
              onChange={this.handleDescriptionChange}
            >
              {this.state.task.description}
            </textarea>
            {this.state.admin && <input type="submit"></input>}
          </form>
        </div>
        <div>
          <b>Creation date:</b>
          {this.state.task.creationDate}

          <b>Due data:</b>
          {this.state.newDueDate}
          <DatePicker
            selected={this.state.today}
            onChange={this.handleDateChange}
            value={this.state.newDueDate}
          ></DatePicker>
        </div>
        <div>
          <b>Assigned to :</b>
          {this.state.task.assignee}
          {this.state.admin && (
            <form onSubmit={this.handleAssignTo}>
              assign to:
              <input type="text" onChange={this.handleAssigneeChange}></input>
              <button>submit</button>
            </form>
          )}
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
