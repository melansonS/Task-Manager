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
      <div>
        <h3>{this.props.project.title}</h3>
        <div>
          <b>Tags:</b>
          {tags}
        </div>
        <Link to={"/project/" + this.props.project._id}>More details</Link>
      </div>
    );
  }
}

let ProjectCard = connect()(UnconnectedProjectCard);

export default ProjectCard;
