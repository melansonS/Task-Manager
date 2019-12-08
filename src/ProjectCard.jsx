import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

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
        <div>
          <b>Title:</b>
          {this.props.project.title}
          <div>
            <b>color:</b>
            <div
              //STYLING DONE HERE FOR THE TIME BEING<TESTING PURPOSES ONLY>
              style={{
                backgroundColor: this.props.project.color,
                height: "17px",
                width: "17px",
                borderRadius: "50%"
              }}
            ></div>
          </div>
        </div>
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
