import React, { Component } from "react";
import { connect } from "react-redux";
import TaskCard from "./TaskCard.jsx";

import "./styling/TodoPage.css";

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
      return (
        <div className="no-tasks">
          There are no tasks currently assined to you
        </div>
      );
    }
    let taskCardElems = [];
    let dueToday = [];
    let dueThisWeek = [];
    let pastDue = [];
    let other = [];
    this.state.todos.forEach(task => {
      taskCardElems.push(
        <TaskCard task={task} projectId={task.pid}></TaskCard>
      );
    });
    //sorts them from nearest to furthest due date!
    taskCardElems.sort((a, b) => {
      let dueDateA = new Date(a.props.task.dueDate) / 1;
      let dueDateB = new Date(b.props.task.dueDate) / 1;
      return dueDateA - dueDateB;
    });
    taskCardElems.forEach(task => {
      let todayAtMidnight = new Date().setUTCHours(0, 0, 0, 0);
      let dueDate = new Date(task.props.task.dueDate).setUTCHours(0, 0, 0, 0);
      let oneDay = 1000 * 60 * 60 * 24;
      if (dueDate < todayAtMidnight) {
        pastDue.push(task);
      } else if (dueDate === todayAtMidnight) {
        dueToday.push(task);
      } else if (dueDate < todayAtMidnight + oneDay * 7) {
        dueThisWeek.push(task);
      } else {
        other.push(task);
      }
    });

    return (
      <div className="todo-body">
        {pastDue.length > 0 && (
          <div className="todo-collection">
            <h2>Past Due</h2>
            {pastDue}
          </div>
        )}
        {dueToday.length > 0 && (
          <div className="todo-collection">
            <h2>Due Today</h2>
            {dueToday}
          </div>
        )}
        {dueThisWeek.length > 0 && (
          <div className="todo-collection">
            <h2>Due This Week</h2>
            {dueThisWeek}
          </div>
        )}
        {other.length > 0 && (
          <div className="todo-collection">
            <h2>Other..</h2>
            {other}
          </div>
        )}
        {/* {taskCardElems} */}
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TodoPage = connect(mapStateToProps)(UnconnectedTodoPage);

export default TodoPage;
