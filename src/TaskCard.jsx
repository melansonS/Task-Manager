import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import "./styling/TaskCard.css";

class UnconnectedTaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let assignee = (
      <div>
        <i>Unassigned</i>
      </div>
    );
    if (this.props.task.assignee !== "") {
      assignee = (
        <div>
          <b>Assigned to: </b>
          {this.props.task.assignee}
        </div>
      );
    }
    return (
      <Link
        to={"/project/" + this.props.projectId + "-" + this.props.task.title}
      >
        <div className="task-card">
          <h3 className="task-card-title">{this.props.task.title}</h3>
          {assignee}
          <div>
            <b>Status: </b>
            {this.props.task.status}
          </div>
          <div>
            <b>Due: </b>
            <span className="task-card-due-date">
              {this.props.task.dueDate}
            </span>
          </div>
        </div>
      </Link>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TaskCard = connect(mapStateToProps)(UnconnectedTaskCard);

export default TaskCard;
