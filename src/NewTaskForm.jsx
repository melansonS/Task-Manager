import React, { Component } from "react";
import { connect } from "react-redux";
import { AiOutlineFolderAdd } from "react-icons/ai";
import "./styling/NewTaskForm.css";

class UnconnectedNewTaskForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      tags: "",
      files: [],
      errorMap: {}
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
    // console.log("files:", event.target.files);
    this.setState({ files: event.target.files });
  };

  handleNewTaskSubmit = async event => {
    event.preventDefault();
    let existingTasks = this.props.projectTasks.map(task => {
      return task.title;
    });
    if (existingTasks.includes(this.state.title)) {
      // console.log("Name taken!");
      this.putError("task-title");
      return window.alert("Task name already in use!");
    }
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
    body = JSON.parse(body);
    this.setState({ title: "", description: "", tags: "", files: [] });
    // console.log("new task response body->", body);
    this.props.updateTasks(body.newTasksArr);
    this.props.closeForm();
  };

  putError = str => {
    // console.log("Put error hit:", str);
    this.setState({ errorMap: { ...this.state.errorMap, [str]: true } });
  };
  getStyle = str => {
    if (this.state.errorMap[str]) {
      return { borderBottom: "1px rgb(187, 40, 40) solid" };
    }
  };

  render() {
    let fileName = "";
    if (this.state.files[0] !== undefined) {
      // console.log("thiis . state . files:", this.state.files[0].name);
      Object.values(this.state.files).forEach(file => {
        fileName += " " + file.name;
      });
    }
    return (
      <div className="new-task-form">
        <h3>New Task form!</h3>
        <form onSubmit={this.handleNewTaskSubmit}>
          <div>
            <input
              type="text"
              required
              onChange={this.handleTitleChange}
              value={this.state.title}
              placeholder="Title"
              style={this.getStyle("task-title")}
            ></input>
          </div>
          <div>
            <h4>Description:</h4>
            <textarea
              type="text"
              rows="10"
              required
              onChange={this.handleDescChange}
              value={this.state.description}
              placeholder="Task description..."
            ></textarea>
          </div>
          <div>
            <input
              type="text"
              required
              onChange={this.handleTagsChange}
              placeholder="List of Tags"
              value={this.state.tags}
            ></input>
          </div>
          <div className="new-task-files">
            <b>Relevant images:</b>
            <input
              id="image-files"
              type="file"
              onChange={this.handleFileChange}
              multiple
              // value={this.state.files}
              style={{ display: "none" }}
            ></input>
            <label htmlFor="image-files">
              <AiOutlineFolderAdd></AiOutlineFolderAdd>
              <span className="new-task-file-names">{fileName}</span>
            </label>
          </div>

          <input type="submit" value="Submit"></input>
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
