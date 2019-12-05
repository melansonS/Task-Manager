import React, { Component } from "react";
import { connect } from "react-redux";
import NewTaskForm from "./NewTaskForm.jsx";
import TaskCard from "./TaskCard.jsx";
import "./main.css";

class UnconnectedProjectHub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addUserUsername: "",
      addAdminUsername: "",
      removeUserName: "",
      project: {},
      showNewTaskForm: false,
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
    if (
      this.state.project.users.includes(this.state.addUserUsername) ||
      this.state.project.admin.includes(this.state.addUserUsername)
    ) {
      window.alert("Already a user!");
      this.setState({ addUserUsername: "" });
    } else {
      console.log("new User:", this.state.addUserUsername);
      let data = new FormData();
      data.append("username", this.state.addUserUsername);
      data.append("projectId", this.props.id);
      let response = await fetch("/add-user", { method: "POST", body: data });
      let body = await response.text();
      body = JSON.parse(body);
      console.log(body);
      this.setState({ addAdminUsername: "" });
    }
  };

  handleAddAdminName = event => {
    this.setState({ addAdminUsername: event.target.value });
  };
  handleAddAdminSubmit = async event => {
    event.preventDefault();
    if (this.state.project.admin.includes(this.state.addAdminUsername)) {
      window.alert("Already an Admin!");
      this.setState({ addAdminUsername: "" });
    } else if (
      !this.state.project.users.includes(this.state.addAdminUsername)
    ) {
      window.alert("Error, new admin must already be users on this project");
      this.setState({ addAdminUsername: "" });
    } else {
      console.log("Adding Admin:", this.state.addAdminUsername);
      let data = new FormData();
      data.append("projectId", this.state.project._id);
      data.append("newAdmin", this.state.addAdminUsername);
      let response = await fetch("/add-admin", { method: "POST", body: data });
      let body = await response.text();
      body = JSON.parse(body);
      console.log("Add admin response body:", body);
      this.setState({ addAdminUsername: "" });
    }
  };

  handleRemoveUserName = event => {
    this.setState({ removeUserName: event.target.value });
  };
  handleRemoveUserSubmit = async event => {
    event.preventDefault();
    if (
      this.state.project.users.includes(this.state.removeUserName) ||
      this.state.project.admin.includes(this.state.removeUserName)
    ) {
      console.log("removing ", this.state.removeUserName);
      let data = new FormData();
      data.append("removeUser", this.state.removeUserName);
      data.append("projectId", this.state.project._id);
      let response = await fetch("/remove-user", {
        method: "POST",
        body: data
      });
      let body = await response.text();
      body = JSON.parse(body);
      console.log("remove user response body:", body);
      this.setState({ removeUserName: "" });
    } else {
      window.alert("Invalid user");
      this.setState({ removeUserName: "" });
    }
  };

  handleShowNewTask = () => {
    this.setState({ showNewTaskForm: !this.state.showNewTaskForm });
  };

  //method passed to the new task form in order to rerender the project hub with the newly added task
  updateTasks = newTasks => {
    console.log("in update tasks, newTasks:", newTasks);
    this.setState({ project: { ...this.state.project, tasks: newTasks } });
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
        if (task.status === "New") {
          newTasks.push(task);
        }
        if (task.status === "In Progress") {
          inProgressTasks.push(task);
        }
        if (task.status === "On Hold") {
          onHoldTasks.push(task);
        }
        if (task.status === "Completed") {
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
      <div className="project-hub">
        Project Hub! id:{this.props.id}
        <div className="project-banner">
          <div style={{ backgroundColor: this.state.project.color }}>
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
        <div className="project-hub-body">
          <div className="project-tasks">
            {newTasks.length > 0 && (
              <div className="project-hub-new-tasks">
                <h1>New Tasks</h1>
                {newTasks}
              </div>
            )}
            {inProgressTasks.length > 0 && (
              <div className="project-hub-in-progress-tasks">
                <h1>In Progress</h1>
                {inProgressTasks}
              </div>
            )}
            {onHoldTasks.length > 0 && (
              <div className="project-hub-on-hold-tasks">
                <h1>On Hold</h1>
                {onHoldTasks}
              </div>
            )}
            {completedTasks.length > 0 && (
              <div className="project-hub-completed-tasks">
                <h1>Completed</h1>
                {completedTasks}
              </div>
            )}
          </div>
          {this.state.role === "admin" && (
            <div className="project-hub-admin-menu">
              <button onClick={this.handleShowNewTask}>New Task!</button>
              {this.state.showNewTaskForm && (
                <div>
                  <NewTaskForm
                    projectId={this.state.project._id}
                    updateTasks={this.updateTasks}
                  ></NewTaskForm>
                </div>
              )}
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
              <div>
                <h3>Make a User an Admin!</h3>
                <form onSubmit={this.handleAddAdminSubmit}>
                  <input
                    type="text"
                    placeholder="user's name"
                    onChange={this.handleAddAdminName}
                    value={this.state.addAdminUsername}
                  ></input>
                  <input type="submit"></input>
                </form>
              </div>
              <div>
                <h3>Remove a user!</h3>
                <form onSubmit={this.handleRemoveUserSubmit}>
                  <input
                    type="text"
                    placeholder="user's name"
                    onChange={this.handleRemoveUserName}
                    value={this.state.removeUserName}
                  ></input>
                  <input type="submit"></input>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
let mapStateToProps = st => {
  return { user: st.userData };
};

let ProjectHub = connect(mapStateToProps)(UnconnectedProjectHub);

export default ProjectHub;
