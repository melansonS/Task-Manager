import React, { Component } from "react";
import { connect } from "react-redux";
import NewTaskForm from "./NewTaskForm.jsx";
import TaskCard from "./TaskCard.jsx";

class UnconnectedProjectHub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addUserUsername: "",
      project: {},
      role: ""
    };
  }
  componentDidMount() {
    this.fetchProject();
  }
  fetchProject = async () => {
    let data = new FormData();
    data.append("projectIds", this.props.id);
    let response = await fetch("/get-projects", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log(body);
    if (body.success) {
      let projectRole = "";
      if (body.userProjects[0].admin.includes(this.props.user.username)) {
        projectRole = "admin";
      } else if (
        body.userProjects[0].users.includes(this.props.user.username)
      ) {
        projectRole = "user";
      }
      this.setState({ project: body.userProjects[0], role: projectRole });
    }
  };
  handleAddUserUsername = event => {
    this.setState({ addUserUsername: event.target.value });
  };
  handleAddUserSubmit = async event => {
    event.preventDefault();
    if (this.state.project.users.includes(this.state.addUserUsername)) {
      window.alert("Already a user!");
      this.setState({ addUserUsername: "" });
    } else {
      console.log("new User email:", this.state.addUserUsername);
      let data = new FormData();
      data.append("username", this.state.addUserUsername);
      data.append("projectId", this.props.id);
      let response = await fetch("/add-user", { method: "POST", body: data });
      let body = await response.text();
      body = JSON.parse(body);
      console.log(body);
    }
  };

  render() {
    console.log("this project:", this.state.project);

    let tags = "";
    let newTasks = [];
    let inProgressTasks = [];
    let onHoldTasks = [];
    let completedTasks = [];
    if (this.state.project.tags !== undefined) {
      tags = this.state.project.tags.map(tag => {
        return <div className="project-tag">{tag}</div>;
      });
      //filter through each of the tasks and assign them to the correct array
      this.state.project.tasks.forEach(task => {
        if (task.status === "new") {
          newTasks.push(task);
        }
        if (task.status === "in progress") {
          inProgressTasks.push(task);
        }
        if (task.status === "on hold") {
          onHoldTasks.push(task);
        }
        if (task.status === "completed") {
          completedTasks.push(task);
        }
      });
      //map through each of the tasks array and generate the respective dom elements
      newTasks = newTasks.map(task => {
        return (
          <TaskCard task={task} projectId={this.state.project._id}>
            New Tasks! Title:{task.title}
          </TaskCard>
        );
      });
      inProgressTasks = inProgressTasks.map(task => {
        return (
          <TaskCard task={task} projectId={this.state.project._id}>
            In Progress Tasks! Title:{task.title}
          </TaskCard>
        );
      });
      onHoldTasks = onHoldTasks.map(task => {
        return (
          <TaskCard task={task} projectId={this.state.project._id}>
            On Hold Tasks! Title:{task.title}
          </TaskCard>
        );
      });
      completedTasks = completedTasks.map(task => {
        return (
          <TaskCard task={task} projectId={this.state.project._id}>
            Completed Tasks! Title:{task.title}
          </TaskCard>
        );
      });
    }

    return (
      <div>
        Project Hub! id:{this.props.id}
        <div>
          <div
            className="project-banner"
            style={{ backgroundColor: this.state.project.color }}
          >
            <b>Title:</b>
            {this.state.project.title}
          </div>
          <b>Description:</b>
          {this.state.project.description}
          <b>Tags:</b>
          {tags}
          <b>Role:</b>
          {this.state.role}
        </div>
        {newTasks.length > 0 && (
          <div className="project-hub-new-tasks">
            <h1>New Tasks</h1>
            {newTasks}
          </div>
        )}
        {inProgressTasks.length > 0 && (
          <div className="project-hub-in-progress-tasks">
            <h1>New Tasks</h1>
            {inProgressTasks}
          </div>
        )}
        {onHoldTasks.length > 0 && (
          <div className="project-hub-on-hold-tasks">
            <h1>New Tasks</h1>
            {onHoldTasks}
          </div>
        )}
        {completedTasks.length > 0 && (
          <div className="project-hub-completed-tasks">
            <h1>New Tasks</h1>
            {completedTasks}
          </div>
        )}
        <div>
          <NewTaskForm projectId={this.state.project._id}></NewTaskForm>
        </div>
        {this.state.role === "admin" && (
          <div>
            <h3>Add a user!</h3>
            <form onSubmit={this.handleAddUserSubmit}>
              <input
                type="text"
                placeholder="user's name"
                onChange={this.handleAddUserUsername}
                value={this.state.addUserUsername}
              ></input>
              <input type="submit"></input>
            </form>
          </div>
        )}
      </div>
    );
  }
}
let mapStateToProps = st => {
  return { user: st.userData };
};

let ProjectHub = connect(mapStateToProps)(UnconnectedProjectHub);

export default ProjectHub;
