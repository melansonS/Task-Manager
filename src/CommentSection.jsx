import React, { Component } from "react";
import { connect } from "react-redux";
import "./styling/commentSection.css";

class UnconnectedCommentSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newComment: ""
    };
  }

  handleCommentChange = event => {
    this.setState({ newComment: event.target.value });
  };
  handleCommentSubmit = async event => {
    event.preventDefault();
    if (this.state.newComment === "") {
      return;
    }
    console.log("Uploading comment:", this.state.newComment);
    let data = new FormData();
    data.append("projectId", this.props.task.pid);
    data.append("taskName", this.props.task.title);
    data.append("user", this.props.user.username);
    data.append("newComment", this.state.newComment);
    let response = await fetch("/add-comment", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("comment submit response body:", body);
    if (body.success) {
      this.setState({ newComment: "" });
      this.props.renderComments(body.modifiedTask);
    }
  };

  render() {
    let commentElems = (
      <div className="no-comments">There are no comments yet</div>
    );
    if (this.props.task.comments.length > 0) {
      commentElems = this.props.task.comments.map(comment => {
        return (
          <div className="comment">
            <div className="comment-header">
              <b>{comment.user}:</b> <i> {comment.timeStamp}</i>
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        );
      });
    }
    return (
      <div>
        {commentElems}
        <form onSubmit={this.handleCommentSubmit}>
          <div className="comment-box">
            <input
              type="text"
              onChange={this.handleCommentChange}
              value={this.state.newComment}
              placeholder="Write a comment..."
              className="comment-box-text"
            ></input>
            <input type="submit" value="Submit"></input>
          </div>
        </form>
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let CommentSection = connect(mapStateToProps)(UnconnectedCommentSection);

export default CommentSection;
