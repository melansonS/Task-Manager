import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedProjectsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showStartProjectForm: false,
      newProjectTitle: "",
      newProjectDescription: "",
      newProjectTags: "",
      newProjectColor: "#87c8d4"
    };
  }
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
    console.log(body);
  };

  render() {
    return (
      <div>
        <h1>Your Projects!</h1>
        <button onClick={this.handleStartProject}>
          Start a new project! +{" "}
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
