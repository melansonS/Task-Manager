import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class UnconnectedNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }
  componentDidMount() {
    this.getNotifications();
  }
  getNotifications = async () => {
    console.log("notifications mount");
    let data = new FormData();
    data.append("user", this.props.user.username);
    let response = await fetch("/get-notifications", {
      method: "POST",
      body: data
    });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("get notifications reponse body:", body);
    if (body.success) {
      this.setState({ notifications: body.notificationsArr });
      let unreadNotifications = 0;
      body.notificationsArr.forEach(notification => {
        if (!notification.read) {
          unreadNotifications++;
        }
      });
      this.props.dispatch({
        type: "update-unread-notifications",
        num: unreadNotifications
      });
    }
  };
  markAsRead = async id => {
    let data = new FormData();
    data.append("user", this.props.user.username);
    data.append("notificationId", id);
    let response = await fetch("/mark-as-read", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    console.log("mark as read response body:", body);
    if (body.success) {
      this.setState({ notifications: body.notificationsArr });
      let unreadNotifications = 0;
      body.notificationsArr.forEach(notification => {
        if (!notification.read) {
          unreadNotifications++;
        }
      });
      this.props.dispatch({
        type: "update-unread-notifications",
        num: unreadNotifications
      });
    }
  };
  render() {
    let notificationElems = this.state.notifications.map(notification => {
      return (
        <Link
          to={notification.url}
          onClick={() => {
            if (!notification.read) this.markAsRead(notification._id);
          }}
        >
          <b>{notification.content}</b>
          <i>{notification.timeStamp}</i>
          <p>Read:{notification.read + ""}</p>
        </Link>
      );
    });
    return (
      <div>
        <h3>Notifications</h3>
        {notificationElems.reverse()}
      </div>
    );
  }
}

let mapStateToProps = st => {
  return { user: st.userData };
};

let Notifications = connect(mapStateToProps)(UnconnectedNotifications);

export default Notifications;
