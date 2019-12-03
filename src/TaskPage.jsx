import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import CommentSection from "./CommentSection.jsx";
import "./main.css";

import "react-datepicker/dist/react-datepicker.css";

class UnconnedtedTaskPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      task: undefined,
      assignee: "",
      watchers: [],
      today: new Date(),
      admin: false,
      status: "",
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
        assignee: body.taskData.assignee,
        watchers: body.taskData.watchers,
        status: body.taskData.status,
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
    if (body.success) {
      this.setState({ assignee: this.state.newAssignee, newAssignee: "" });
    }
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
  toggleWatchTask = async event => {
    console.log("Toggle Watching");
    let user = this.props.user.username;
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    data.append("user", user);
    let response = await fetch("/toggle-watching-task", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("toggle watching response body:", body);
    if (body.success) {
      if (this.state.watchers.includes(user)) {
        this.setState({
          watchers: this.state.watchers.filter(watcher => {
            return watcher !== user;
          })
        });
      } else {
        this.setState({ watchers: this.state.watchers.concat(user) });
      }
    }
  };

  updateStatus = async event => {
    let newStatus = event.target.value;
    console.log("update Status select:", newStatus);
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    data.append("newStatus", newStatus);
    let response = await fetch("/update-task-status", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      this.setState({ status: newStatus });
    }
  };

  render() {
    if (this.state.task === undefined) {
      return <div>Loading...</div>;
    }
    let posts = undefined;
    if (this.state.task.posts.length > 0) {
      posts = this.state.task.posts.map((post, index) => {
        return (
          <div>
            <img src={post}></img>
          </div>
        );
      });
    }
    return (
      <div className="task-page">
        <div className="task-body">
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
          {posts && (
            <div className="task-posts">
              <h3>Posts:</h3>
              {posts}
            </div>
          )}

          <CommentSection task={this.state.task}></CommentSection>
        </div>
        <div className="task-menu">
          <div>
            <b>Creation date:</b>
            {this.state.task.creationDate}
          </div>
          <div>
            <b>Due date:</b>
            <DatePicker
              selected={this.state.today}
              onChange={this.handleDateChange}
              value={this.state.newDueDate}
            ></DatePicker>
          </div>
          <div>
            <b>Assigned to :</b>
            {this.state.assignee}
            {this.state.admin && (
              <form onSubmit={this.handleAssignTo}>
                assign to:
                <input
                  type="text"
                  onChange={this.handleAssigneeChange}
                  value={this.state.newAssignee}
                ></input>
                <button>submit</button>
              </form>
            )}
          </div>
          <div>
            <b>Watchers :</b>
            {this.state.watchers.join(" ")}
            <div>
              <button onClick={this.toggleWatchTask}>Watch this Task</button>
            </div>
          </div>
          <div>
            Status:
            <select onChange={this.updateStatus} value={this.state.status}>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <Link to={"/project/" + this.props.projectId}>Project Hub</Link>
        </div>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TaskPage = connect(mapStateToProps)(UnconnedtedTaskPage);

export default TaskPage;
