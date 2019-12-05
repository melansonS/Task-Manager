import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
class UnconnectedTaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Link
          to={"/project/" + this.props.projectId + "-" + this.props.task.title}
        >
          <div>
            <h3>{this.props.task.title}</h3>
            <div>
              <b>Assigned to:</b>
              {this.props.task.assignee}
            </div>
            <div>
              <b>Status:</b>
              {this.props.task.status}
            </div>
            <div>
              <b>Due:</b>
              {this.props.task.dueDate}
            </div>
          </div>
        </Link>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let TaskCard = connect(mapStateToProps)(UnconnectedTaskCard);

export default TaskCard;
