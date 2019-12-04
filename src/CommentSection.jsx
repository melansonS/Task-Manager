import React, { Component } from "react";
import { connect } from "react-redux";

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
    let commentElems = <div>no comments</div>;
    if (this.props.task.comments.length > 0) {
      commentElems = this.props.task.comments.map(comment => {
        return (
          <div>
            <b>{comment.user}:</b>
            <p>{comment.content}</p>
            <i>{comment.timeStamp}</i>
          </div>
        );
      });
    }
    return (
      <div>
        <h3>comment section:</h3>
        {commentElems}
        <form onSubmit={this.handleCommentSubmit}>
          <input
            type="text"
            onChange={this.handleCommentChange}
            value={this.state.newComment}
          ></input>
          <button>Submit</button>
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
