import React, { Component } from "react";
import { connect } from "react-redux";
import ProjectCard from "./ProjectCard.jsx";
import "./styling/ProjectsPage.css";

import { AiOutlinePlusCircle } from "react-icons/ai";

class UnconnectedProjectsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminProjects: [],
      userProjects: [],
      showStartProjectForm: false,
      newProjectTitle: "",
      newProjectDescription: "",
      newProjectTags: ""
    };
  }
  componentDidMount() {
    document.addEventListener("click", this.handleModalClick);
    if (Object.keys(this.props.user.projects)[0] !== undefined) {
      this.getProjects();
    }
  }

  handleModalClick = event => {
    let modal = document.getElementsByClassName("start-project-modal")[0];
    if (event.target === modal) {
      this.handleHideProjectForm();
    }
  };

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

  handleStartProjectSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.props.user.username);
    data.append("title", this.state.newProjectTitle);
    data.append("description", this.state.newProjectDescription);
    data.append("tags", this.state.newProjectTags);
    let response = await fetch("/new-project", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("start project response body:", body);
    if (body.success) {
      let updatedAdminProjects = this.state.adminProjects.concat(
        body.newProject
      );
      this.setState({
        adminProjects: updatedAdminProjects,
        newProjectTitle: "",
        newProjectDescription: "",
        newProjectTags: ""
      });
      this.props.dispatch({ type: "start-project", newUserData: body.user });
      this.handleHideProjectForm();
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
      <div className="projects-page-body">
        {adminProjectCardElems.length > 0 && (
          <div className="admin-projects">
            <h1>Admin Projects</h1>
            <div className="admin-projects-cards">{adminProjectCardElems}</div>
          </div>
        )}
        {userProjectCardElems.length > 0 && (
          <div className="user-projects">
            <h3>User projects</h3>
            <div className="user-projects-cards">{userProjectCardElems}</div>
          </div>
        )}

        <div htmlFor="add-project">
          <div className="add-project-label" onClick={this.handleStartProject}>
            <p>Start a new project!</p>
            <AiOutlinePlusCircle />
          </div>
        </div>
        {this.state.showStartProjectForm && (
          <div className="start-project-modal">
            <div className="start-project-modal-content">
              <h3>New Project</h3>
              <form onSubmit={this.handleStartProjectSubmit}>
                <div>
                  <input
                    type="text"
                    onChange={this.handleTitleChange}
                    value={this.state.newProjectTitle}
                    placeholder="Title"
                    className="start-project-title"
                    required
                  ></input>
                </div>
                <div>
                  <h4> Sub-Title:</h4>
                  <textarea
                    rows="10"
                    type="text"
                    onChange={this.handleDescChange}
                    placeholder="Brief description of your project..."
                    value={this.state.newProjectDescription}
                    required
                  ></textarea>
                </div>
                <div>
                  <input
                    type="text"
                    onChange={this.handleTagsChange}
                    value={this.state.newProjectTags}
                    placeholder="List of Tags..."
                  ></input>
                </div>
                <input type="submit"></input>
              </form>

              <div
                htmlFor="modal-close"
                className="close"
                onClick={this.handleHideProjectForm}
              >
                X
              </div>
            </div>
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
