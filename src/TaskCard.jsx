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
          {this.props.task.title}
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
