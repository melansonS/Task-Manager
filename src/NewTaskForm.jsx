import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedNewTaskForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      tags: "",
      files: []
    };
  }
  handleTitleChange = event => {
    this.setState({ title: event.target.value });
  };
  handleDescChange = event => {
    this.setState({ description: event.target.value });
  };
  handleTagsChange = event => {
    this.setState({ tags: event.target.value });
  };
  handleFileChange = event => {
    console.log("files:", event.target.files);
    this.setState({ files: event.target.files });
  };

  handleNewTaskSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("author", this.props.user.username);
    data.append("projectId", this.props.projectId);
    data.append("title", this.state.title);
    data.append("description", this.state.description);
    data.append("tags", this.state.tags);
    if (this.state.files !== undefined) {
      for (let i = 0; i < this.state.files.length; i++) {
        data.append("files", this.state.files[i]);
      }
    } else {
      data.append("files", this.state.files);
    }
    let response = await fetch("/new-task", { method: "POST", body: data });
    let body = await response.text();
    console.log("new task response body->", body);
  };

  render() {
    return (
      <div>
        <h3>New Task form!</h3>
        <form onSubmit={this.handleNewTaskSubmit}>
          Title:
          <input type="text" required onChange={this.handleTitleChange}></input>
          Description:
          <input type="text" required onChange={this.handleDescChange}></input>
          Tags:
          <input type="text" required onChange={this.handleTagsChange}></input>
          Relevant images:
          <input type="file" onChange={this.handleFileChange} multiple></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}
let mapStateToProps = st => {
  return {
    user: st.userData
  };
};
let NewTaskForm = connect(mapStateToProps)(UnconnectedNewTaskForm);

export default NewTaskForm;
