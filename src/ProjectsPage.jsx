import React, { Component } from "react";
import { connect } from "react-redux";
import ProjectCard from "./ProjectCard.jsx";

class UnconnectedProjectsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminProjects: [],
      userProjects: [],
      showStartProjectForm: false,
      newProjectTitle: "",
      newProjectDescription: "",
      newProjectTags: "",
      newProjectColor: "#87c8d4"
    };
  }
  componentDidMount() {
    if (Object.keys(this.props.user.projects)[0] !== undefined) {
      this.getProjects();
    }
  }

  getProjects = async () => {
    console.log("Getting user's projects:", this.props.user.projects);
    let projectIds = Object.keys(this.props.user.projects);
    let data = new FormData();
    data.append("projectIds", projectIds);
    let response = await fetch("/get-projects", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    let adminProjects = body.userProjects.filter(project => {
      return project.admin.includes(this.props.user.username);
    });
    console.log("adminProjects:", adminProjects);
    let userProjects = body.userProjects.filter(project => {
      return project.users.includes(this.props.user.username);
    });
    console.log("userProjects", userProjects);
    this.setState({ adminProjects, userProjects });

    console.log(" admin projects in the sate:", this.state.adminProjects);
    console.log(" user projects in the sate:", this.state.userProjects);
  };

  handleStartProject = () => {
    console.log("startprojectClick");
    this.setState({ showStartProjectForm: true });
  };
  handleHideProjectForm = () => {
    this.setState({ showStartProjectForm: false });
  };
  handleTitleChange = event => {
    this.setState({ newProjectTitle: event.target.value });
  };
  handleDescChange = event => {
    this.setState({ newProjectDescription: event.target.value });
  };
  handleTagsChange = event => {
    this.setState({ newProjectTags: event.target.value });
  };
  handleColorChange = event => {
    this.setState({ newProjectColor: event.target.value });
  };

  handleStartProjectSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.props.user.username);
    data.append("title", this.state.newProjectTitle);
    data.append("description", this.state.newProjectDescription);
    data.append("tags", this.state.newProjectTags);
    data.append("color", this.state.newProjectColor);
    let response = await fetch("/new-project", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("start project response body:", body);
    if (body.success) {
      let updatedAdminProjects = this.state.adminProjects.concat(
        body.newProject
      );
      this.setState({ adminProjects: updatedAdminProjects });
      this.props.dispatch({ type: "start-project", newUserData: body.user });
    }
  };

  render() {
    let adminProjectCardElems = this.state.adminProjects.map(proj => {
      return <ProjectCard project={proj}></ProjectCard>;
    });
    let userProjectCardElems = this.state.userProjects.map(proj => {
      return <ProjectCard project={proj}></ProjectCard>;
    });
    return (
      <div>
        <div>
          <h1>Admin Projects</h1>
          {adminProjectCardElems}
        </div>
        <div>
          <h3>User projects</h3>
          {userProjectCardElems}
        </div>
        <button onClick={this.handleStartProject}>
          Start a new project! +
        </button>
        {this.state.showStartProjectForm && (
          <div>
            <form onSubmit={this.handleStartProjectSubmit}>
              <h3>Start project form..</h3>
              Title:
              <input
                type="text"
                onChange={this.handleTitleChange}
                required
              ></input>
              Description:
              <input
                type="text"
                onChange={this.handleDescChange}
                required
              ></input>
              Tags:
              <input
                type="text"
                onChange={this.handleTagsChange}
                required
              ></input>
              Color:
              <input type="color" onChange={this.handleColorChange}></input>
              <input type="submit"></input>
            </form>
            <button onClick={this.handleHideProjectForm}>cancel</button>
          </div>
        )}
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let ProjectsPage = connect(mapStateToProps)(UnconnectedProjectsPage);

export default ProjectsPage;
