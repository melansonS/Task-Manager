import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import "./styling/ProjectCard.css";

class UnconnectedProjectCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let tags = this.props.project.tags.map(tag => {
      return <div className="project-tag">{tag}</div>;
    });
    return (
      <Link to={"/project/" + this.props.project._id}>
        <div className="project-card">
          <h2>{this.props.project.title}</h2>
          <div className="project-card-details">
            <div>
              <b>Creation date: </b>
              <i>{this.props.project.creationDate}</i>
            </div>
            <div>
              <b>Total tasks: </b>
              {this.props.project.tasks.length}
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

let ProjectCard = connect()(UnconnectedProjectCard);

export default ProjectCard;
