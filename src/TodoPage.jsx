import React, { Component } from "react";
import { connect } from "react-redux";
import TaskCard from "./TaskCard.jsx";

class UnconnectedTodoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: []
    };
  }
  componentDidMount() {
    this.getTasks();
  }
  getTasks = async () => {
    if (Object.keys(this.props.user.projects).length <= 0) {
      return;
    }
    let data = new FormData();
    data.append("username", this.props.user.username);
    data.append("projects", Object.keys(this.props.user.projects));
    let response = await fetch("/get-todos", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("get todos response body:", body);
    if (body.success) {
      this.setState({ todos: body.todos });
    }
  };
  render() {
    if (this.state.todos.length === 0) {
      return <div>no tasks currently assined to you</div>;
    }
    let taskCardElems = [];
    this.state.todos.forEach(task => {
      taskCardElems.push(
        <TaskCard task={task} projectId={task.pid}></TaskCard>
      );
    });
    return <div>All of your Todos!{taskCardElems}</div>;
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TodoPage = connect(mapStateToProps)(UnconnectedTodoPage);

export default TodoPage;
