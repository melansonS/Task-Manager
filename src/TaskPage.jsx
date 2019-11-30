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
      readOnly: true,
      newDueDate: ""
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
        this.setState({ readOnly: false });
      }
    }
  };
  handleDateChange = date => {
    console.log("updating due date! :", date.toLocaleDateString());
    this.setState({
      newDueDate: date
    });
    console.log("after date set state");
  };
  handleDescriptionChange = event => {
    this.setState({ newDescription: event.target.value });
  };

  submitDescription = async event => {
    event.preventDefault();
    console.log(this.state.newDescription);
    let data = new FormData();
    data.append("projectId", this.props.projectId);
    data.append("taskName", this.props.taskName);
    data.append("description", this.state.newDescription);
    let response = await fetch("/update-task-description", {
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
              readOnly={this.state.readOnly}
              onChange={this.handleDescriptionChange}
            >
              {this.state.task.description}
            </textarea>
            {!this.state.readOnly && <input type="submit"></input>}
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
