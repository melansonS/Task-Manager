import React, { Component } from "react";
import { connect } from "react-redux";
import NewTaskForm from "./NewTaskForm.jsx";
import TaskCard from "./TaskCard.jsx";
import "./main.css";
import "./styling/ProjectHub.css";

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
    document.addEventListener("click", this.handleModalClick);
  }
  handleModalClick = event => {
    let modal = document.getElementsByClassName("new-task-modal")[0];
    if (event.target === modal) {
      this.handleCloseNewTaskForm();
    }
  };

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
      data.append("projectTitle", this.state.project.title);
      let response = await fetch("/add-user", { method: "POST", body: data });
      let body = await response.text();
      body = JSON.parse(body);
      console.log(body);
      let updatedProject = {
        ...this.state.project,
        users: this.state.project.users.concat(this.state.addUserUsername)
      };
      this.setState({ addUserUsername: "", project: updatedProject });
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
      let updatedProject = {
        ...this.state.project,
        users: this.state.project.users.filter(user => {
          return user !== this.state.addAdminUsername;
        }),
        admin: this.state.project.admin.concat(this.state.addAdminUsername)
      };
      this.setState({ addAdminUsername: "", project: updatedProject });
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
      let updatedProject = {
        ...this.state.project,
        users: this.state.project.users.filter(user => {
          return user !== this.state.removeUserName;
        }),
        admin: this.state.project.admin.filter(admin => {
          return admin !== this.state.removeUserName;
        })
      };
      this.setState({ removeUserName: "", project: updatedProject });
    } else {
      window.alert("Invalid user");
      this.setState({ removeUserName: "" });
    }
  };

  handleShowNewTask = () => {
    this.setState({ showNewTaskForm: true });
  };
  handleCloseNewTaskForm = () => {
    this.setState({ showNewTaskForm: false });
  };

  //method passed to the new task form in order to rerender the project hub with the newly added task
  updateTasks = newTasks => {
    console.log("in update tasks, newTasks:", newTasks);
    this.setState({ project: { ...this.state.project, tasks: newTasks } });
  };

  render() {
    console.log("this project:", this.state.project);
    if (this.state.project.admin === undefined) {
      return <div>Loading..</div>;
    }
    let tags = "";
    let newTasks = [];
    let inProgressTasks = [];
    let onHoldTasks = [];
    let completedTasks = [];
    let arrayOfTaskArrays = [
      newTasks,
      inProgressTasks,
      onHoldTasks,
      completedTasks
    ];
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
      //sort each task of the tasks arrays by upcomming due dates
      arrayOfTaskArrays.forEach(taskArr => {
        taskArr.sort((a, b) => {
          let dueDateA = new Date(a.dueDate) / 1;
          let dueDateB = new Date(b.dueDate) / 1;
          return dueDateA - dueDateB;
        });
      });

      //map through each of the tasks arrays and generate the respective dom elements
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
        <div
          className="project-banner"
        >
          <h1>{this.state.project.title}</h1>
          <b>{this.state.project.description}</b>
        </div>
        <div className="project-hub-body">
          <div className="project-tasks">
            {newTasks.length > 0 && (
              <div className="project-hub-new-tasks">
                <h2>
                  New Tasks
                </h2>
                {newTasks}
              </div>
            )}
            {inProgressTasks.length > 0 && (
              <div className="project-hub-in-progress-tasks">
                <h2>
                  In Progress
                </h2>
                {inProgressTasks}
              </div>
            )}
            {onHoldTasks.length > 0 && (
              <div className="project-hub-on-hold-tasks">
                <h2>
                  On Hold
                </h2>
                {onHoldTasks}
              </div>
            )}
            {completedTasks.length > 0 && (
              <div className="project-hub-completed-tasks">
                <h2>
                  Completed
                </h2>
                {completedTasks}
              </div>
            )}
          </div>
          <div className="project-hub-menu">
            <p>
              <b>Users:</b> {this.state.project.users.join(" ")}
            </p>
            <p>
              <b>Admin:</b> {this.state.project.admin.join(" ")}
            </p>
            {this.state.role === "admin" && (
              <div className="project-hub-admin-menu">
                <button onClick={this.handleShowNewTask}>New Task!</button>
                {this.state.showNewTaskForm && (
                  <div className="new-task-modal">
                    <div className="new-task-modal-content">
                      <span
                        className="close"
                        onClick={this.handleCloseNewTaskForm}
                      >
                        X
                      </span>
                      <NewTaskForm
                        projectId={this.state.project._id}
                        updateTasks={this.updateTasks}
                        closeForm={this.handleCloseNewTaskForm}
                      ></NewTaskForm>
                    </div>
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
      </div>
    );
  }
}
let mapStateToProps = st => {
  return { user: st.userData };
};

let ProjectHub = connect(mapStateToProps)(UnconnectedProjectHub);

export default ProjectHub;
