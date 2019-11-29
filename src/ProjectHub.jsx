import React, { Component } from "react";
import { connect } from "react-redux";

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
    console.log("new User email:", this.state.addUserUsername);
    let data = new FormData();
    data.append("username", this.state.addUserUsername);
    data.append("projectId", this.props.id);
    let response = await fetch("/add-user", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log(body);
  };

  render() {
    console.log("this project:", this.state.project);

    let tags = "";
    if (this.state.project.tags !== undefined) {
      tags = this.state.project.tags.map(tag => {
        return <div className="project-tag">{tag}</div>;
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
        {this.state.role === "admin" && (
          <div>
            <h3>Add a user!</h3>
            <form onSubmit={this.handleAddUserSubmit}>
              <input
                type="text"
                placeholder="user's name"
                onChange={this.handleAddUserUsername}
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
