import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import "./main.css";

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
    let notifications = this.state.notifications;
    if (!this.props.allNotifications) {
      console.log(this.props.allNotifications);
      notifications = notifications.slice(-10);
    }
    let notificationElems = notifications.map(notification => {
      let notifClass = "notification-unread";
      if (notification.read) {
        notifClass = "notification-read";
      }
      return (
        <Link
          to={notification.url}
          onClick={() => {
            if (!this.props.allNotifications) {
              this.props.closeMenu();
            }
            if (!notification.read) this.markAsRead(notification._id);
          }}
        >
          <div className={notifClass}>
            <p>{notification.content}</p>
            <i className="notification-timestamp">{notification.timeStamp}</i>
            {/* <p>Read:{notification.read + ""}</p> */}
          </div>
        </Link>
      );
    });
    return (
      <div className="notifications-body">
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
