let express = require("express");
let app = express();
let multer = require("multer");
let upload = multer({ dest: __dirname + "/uploads" });
let MongoClient = require("mongodb").MongoClient;
let ObjectID = require("mongodb").ObjectID;
let cookieParser = require("cookie-parser");
let reloadMagic = require("./reload-magic.js");

app.use(cookieParser());
reloadMagic(app);
//mongo set up ====
let dbo;
let url =
  "mongodb+srv://bob:bobsue@cluster0-dhphy.mongodb.net/test?retryWrites=true&w=majority";
app.use("/", express.static("build"));

MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
  dbo = db.db("task-manager");
});
//===
app.use("/images", express.static("uploads")); //Needed to access the files in the uploads folder
app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets

let generateSID = () => {
  return Math.floor(Math.random() * 100000000);
};

let sendNotifications = (users, notification) =>{
    //takes an array of users, and pushes a new notification object to their 
    //instance in the notifications collection on the db
    console.log("SENDING:",notification, "TO :",users)
    users.forEach(username =>{
        dbo.collection("notifications").findOne({username},(err,user)=>{
            if(err){return {success:false}}
            if(user ===null){return {success:false}}
            let updatedNotifications = user.notifications
            updatedNotifications.push(notification)
            dbo.collection("notifications").updateOne({username},{$set:{notifications:updatedNotifications}})
            return ({success:true})
        })
    })
    
}

// Your endpoints go after this line
app.post("/signup", upload.none(), (req, res) => {
  console.log("SINGUP HIT========");
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  dbo.collection("users").findOne({ username }, (err, user) => {
    if (err) {
      console.log("signup err;", err);
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (user !== null) {
      console.log("username taken");
      res.send(JSON.stringify({ success: false, usernameTake: true }));
      return;
    }
    //if the username is not already taken, insert the new user's data into the users collection
    dbo
      .collection("users")
      .insertOne({ username, email, password, projects: {} });
    let sid = generateSID();
    dbo.collection("cookies").insertOne({ sid, username });
    res.cookie("sid", sid);
    res.send(JSON.stringify({ success: true }));
    // create a notification object for the user in the notifications collection
    dbo.collection("notifications").insertOne({username, notifications:[]})
  });
});

app.post("/login", upload.none(), (req, res) => {
  console.log("LOGIN HIT================");
  let username = req.body.username;
  let givenPassword = req.body.password;
  console.log("credentials:", username, ",", givenPassword);
  dbo.collection("users").findOne({ username }, (err, user) => {
    if (err) {
      console.log("Login err:", err);
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (user === null) {
      console.log("user not found...");
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (user.password === givenPassword) {
      let sid = generateSID();
      dbo.collection("cookies").insertOne({ sid, username });
      res.cookie("sid", sid);
      res.send(JSON.stringify({ success: true, user }));
      return;
    }
    console.log("DEFAULT RESPONSE");
    res.send(JSON.stringify({ success: false }));
  });
});

app.post("/auto-login", upload.none(), (req, res) => {
  console.log("auto loggin hit===========");
  let sid = parseInt(req.cookies.sid);
  console.log("COOKIE:", sid);
  dbo.collection("cookies").findOne({ sid }, (err, sid) => {
    if (err) {
      console.log("autologin err:", err);
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (sid === null) {
      res.send(JSON.stringify({ success: false, sid: "null" }));
      return;
    }
    if (sid !== null) {
      console.log("sid user ->", sid.username);
      dbo
        .collection("users")
        .findOne({ username: sid.username }, (err, user) => {
          res.send(JSON.stringify({ success: true, user }));
        });
      return;
    }
  });
});
app.post("/logout", upload.none(), (req, res) => {
  console.log("logoutHit");
  let sid = parseInt(req.cookies.sid);
  dbo.collection("cookies").deleteOne({ sid }, (err, sid) => {
    if (err) {
      console.log("cookie deletion error:", err);
      res.send(JSON.stringify({ success: false }));
      return;
    }
    if (sid === null) {
      console.log("sid null...");
      res.send(JSON.stringify({ success: false }));
      return;
    }
    res.send(JSON.stringify({ success: true }));
  });
});

app.post("/update-password", upload.none(), (req, res) => {
  console.log("UPDATE PASSWORD HIT");
  let user = req.body.user;
  let newPass = req.body.newPass;
  dbo
    .collection("users")
    .updateOne(
      { username: user },
      { $set: { password: newPass } },
      (err, user) => {
        if (err) {
          return res.send(JSON.stringify({ success: false }));
        }
        if (user === null) {
          return res.send(JSON.stringify({ success: false }));
        }
        return res.send(JSON.stringify({ success: true }));
      }
    );
});

app.post("/update-email",upload.none(),(req,res)=>{
    console.log("UPDATE EMAIL HIT")
    let user = req.body.user
    let newEmail = req.body.newEmail
    dbo.collection("users").updateOne({username:user},{$set:{email:newEmail}},(err,user)=>{
        if(err){
            return res.send(JSON.stringify({success:false}))
        }
        if(user === null){
            return res.send(JSON.stringify({success:false}))
        }
        return res.send(JSON.stringify({success:true}))
    })
})

app.post("/new-project", upload.none(), (req, res) => {
  console.log("NEW-PROJECT HIT=======");
  let username = req.body.username;
  let title = req.body.title;
  let description = req.body.description;
  let tags = req.body.tags.split(" ");
  let color = req.body.color;
  let creationDate = new Date().toDateString();
  dbo.collection("projects").insertOne(
    {
      admin: [username],
      users: [],
      title,
      description,
      tags,
      color,
      creationDate,
      tasks: []
    },
    (err, proj) => {
        if(err){return res.send(JSON.stringify({success:false}))}
      console.log("project", proj.ops[0]._id);
      let projectId = proj.ops[0]._id;
      dbo.collection("users").findOne({ username }, (err, user) => {
        if(err){return res.send(JSON.stringify({success:false}))}
        console.log("user projects:", user.projects);
        let projectObj = user.projects;
        projectObj[projectId] = "admin";
        console.log("new user projects obj :", projectObj);
        dbo
          .collection("users")
          .findOneAndUpdate({ username }, { $set: { projects: projectObj } },{returnOriginal:false},(err,user)=>{
              if(err){return res.send(JSON.stringify({success:false}))}
                return res.send(JSON.stringify({success:true, newProject:proj.ops, user:user.value}))
    });
      });
      console.log("new-proj - PROJ:",proj.ops)
    }
  );
});

app.post("/search", upload.none(), (req, res) => {
  console.log("SEARCH HIT ++");
  let searchInputs = req.body.searchInput.split(" ");
  let username = req.body.username;
  let projectIds = req.body.projectIds.split(",");
  let ids = projectIds.map(project => {
    return ObjectID(project);
  });
  dbo
    .collection("projects")
    .find({ _id: { $in: ids } })
    .toArray((err, projects) => {
      if (err) {
        return res.send(JSON.stringify({ success: false }));
      }
      if (projects === null) {
        return res.send(JSON.stringify({ success: false }));
      }
      let searchResults = [];
      //search for matches between the tags and the search inputs
      projects.forEach(project => {
        project.tasks.forEach(task => {
          task.tags.forEach(tag => {
            searchInputs.forEach(input => {
              //toLowerCase used to make the search non case sensitive
              if (tag.toLowerCase().includes(input.toLowerCase())) {
                searchResults.push(task);
              }
            });
          });
        });
      });

      //search for task titles that include any of the search inputs
      projects.forEach(project => {
        project.tasks.forEach(task => {
          searchInputs.forEach(input => {
            //toLowerCase used to make the search non case sensitive
            if (task.title.toLowerCase().includes(input.toLowerCase())) {
              searchResults.push(task);
            }
          });
        });
      });
      //filter out multiple instances of the same task
      let filteredSearchResults = [];
      searchResults.forEach(result => {
        let found = false;
        filteredSearchResults.forEach(task => {
          if (result.title === task.title) {
            found = true;
          }
        });
        if (!found) {
          filteredSearchResults.push(result);
        }
        console.log(filteredSearchResults);
      });
      //retrun the filtered Search
      res.send(
        JSON.stringify({ success: true, searchResults: filteredSearchResults })
      );
    });
  console.log("search:", searchInputs, " u:", username, " ids:", ids);
});
app.post("/get-projects", upload.none(), (req, res) => {
  console.log("GET PROJECTS HIT======");
  let ids = req.body.projectIds;
  ids = ids.split(",");
  ids = ids.map(id => {
    return ObjectID(id);
  });
  dbo
    .collection("projects")
    .find({ _id: { $in: ids } })
    .toArray((err, userProjects) => {
      if (err) {
        console.log("get projects err:", err);
        return res.send(JSON.stringify({ success: false }));
      }
      return res.send(JSON.stringify({ success: true, userProjects }));
    });
  console.log("IDS;", ids);
});
app.post("/get-todos", upload.none(), (req, res) => {
  console.log("GET TODOS HIT==");
  let username = req.body.username;
  let projectIds = req.body.projects.split(",");
  let ids = projectIds.map(project => {
    return ObjectID(project);
  });
  console.log("user:", username, " ,pIds:", ids);
  dbo
    .collection("projects")
    .find({ _id: { $in: ids } })
    .toArray((err, projects) => {
      if (err) {
        console.log("ERR:", err);
        return res.send(JSON.stringify({ success: false }));
      }
      if (projects === null) {
        return res.send(JSON.stringify({ success: false }));
      }
      let todos = [];
      projects.forEach(project => {
        project.tasks.forEach(task => {
          if (task.assignee === username) {
            if (task.status !== "Completed") {
              todos.push(task);
            }
          }
        });
      });
      res.send(JSON.stringify({ success: true, todos }));
    });
});

app.post("/get-notifications",upload.none(),(req,res)=>{
    // console.log("GET NOTIFICATIONS HIT")
    let username = req.body.user
    dbo.collection("notifications").findOne({username},(err,notificationObj)=>{
        if(err){return res.send(JSON.stringify({success:false}))}
        if(notificationObj === null){return res.send(JSON.stringify({success:false}))}
        let notificationsArr = notificationObj.notifications
        return res.send(JSON.stringify({success:true, notificationsArr}))
    })
})
app.post("/mark-as-read",upload.none(),(req,res)=>{
    console.log("MARK AS READ HIT")
    let nid = req.body.notificationId
    let username = req.body.user
    dbo.collection("notifications").findOne({username},(err,notificationObj)=>{        
        if(err){return res.send(JSON.stringify({success:false}))}
        if(notificationObj === null){return res.send(JSON.stringify({success:false}))}
        let updatedNotifications = notificationObj.notifications.map( notification =>{
            if(notification._id.toString() === nid.toString()){
                notification.read = true
            }
            return notification
        })
        dbo.collection("notifications").findOneAndUpdate({username},{$set:{notifications:updatedNotifications}},{returnOriginal:false},(err,updatedNotifs)=>{
        if(err){return res.send(JSON.stringify({success:false}))}
        let notificationsArr = updatedNotifs.value.notifications
        return res.send(JSON.stringify({success:true, notificationsArr }))
        })
    })
})

app.post("/add-user", upload.none(), (req, res) => {
  console.log("ADD-USER HIT====");
  let id = req.body.projectId;
  let username = req.body.username;
  let userId = "";
  console.log("username:", username, " - pid:", id);
  //finds the user object based on the given username
  dbo.collection("users").findOne({ username }, (err, user) => {
    if (err) {
      console.log("add user err..:", err);
      return res.send(JSON.parse({ success: false }));
    }
    if (user === null) {
      return res.send(JSON.stringify({ success: false }));
    }
    //if the project isn't already listed in the user's projects object
    if (user.projects[id] === undefined) {
      userId = user._id;
      let projectObj = user.projects;
      projectObj[id] = "user";
      console.log("new user projects obj :", projectObj);
      //set the users projects to the new obj containing the added project
      dbo
        .collection("users")
        .updateOne({ username }, { $set: { projects: projectObj } });
      //update the users array of the project to include the username of the new user
      dbo
        .collection("projects")
        .updateOne({ _id: ObjectID(id) }, { $push: { users: username } });
      res.send(JSON.stringify({ success: true }));
      return;
    }
    console.log("project already listed...");
    res.send(JSON.stringify({ success: false }));
  });
});

app.post("/add-admin",upload.none(),(req,res)=>{
    console.log("ADD ADMIN HIT")
    let pid = req.body.projectId
    let newAdmin = req.body.newAdmin
    console.log("pid:",pid,", new admin:",newAdmin)
    dbo.collection("users").findOne({username:newAdmin},(err,user)=>{
        if(err){
            return res.send(JSON.stringify({success:false}))
        }
        //set the value of the project in the user's projects object to Admin
        let updatedProjects = user.projects;
        updatedProjects[pid] = "admin"
        //update the users projects on the db
        dbo
        .collection("users")
        .updateOne({ username:newAdmin }, { $set: { projects: updatedProjects } });
        //update the users and admin arrays of the affected project
        dbo.collection("projects").findOne({_id:ObjectID(pid)},(err,project)=>{
            if(err){
                return res.send(JSON.stringify({success:false}))
            }
            let updatedUsers = project.users.filter(user=>{
                return user !== newAdmin
            })
            let updatedAdmin = project.admin;
            updatedAdmin.push(newAdmin)
            //set the updated data to the project on the db
            dbo.collection("projects").updateOne({_id:ObjectID(pid)},{$set:{users:updatedUsers,admin:updatedAdmin}},(err)=>{
                if(err){
                    return res.send(JSON.stringify({success:false}))
                }
                return res.send(JSON.stringify({success:true}))
            })
        })

    })
})

app.post("/remove-user",upload.none(),(req,res)=>{
    console.log("REMOVE USER HIT ==")
    let pid = req.body.projectId
    let removeUser = req.body.removeUser
        console.log("pid:",pid,", removing:",removeUser)

    dbo.collection("users").findOne({username:removeUser},(err,user)=>{
        if(err){return res.send(JSON.stringify({success:false}))}
        if(user === null){return res.send(JSON.stringify({success:false}))}

        let updatedProjects = user.projects;
        delete updatedProjects[pid];
        dbo.collection('users').updateOne({username:removeUser},{$set:{projects:updatedProjects}})

        dbo.collection("projects").findOne({_id:ObjectID(pid)},(err,project)=>{          
        if(err){return res.send(JSON.stringify({success:false}))}
        if(project === null){return res.send(JSON.stringify({success:false}))}  
        let updatedUsers = project.users.filter(user=>{
            return user !== removeUser
        })
        let updatedAdmin = project.admin.filter(user=>{
            return user !== removeUser
        })
        let updatedTasks = project.tasks;
        updatedTasks.forEach(task=>{
            if(task.assignee === removeUser){
                task.assignee ="";
            }
            if(task.watchers.includes(removeUser)){
                task.watchers = task.watchers.filter(watcher=>{
                    return watcher !== removeUser
                })
            }
        })

        dbo.collection("projects").updateOne({_id:ObjectID(pid)},{$set:{users:updatedUsers,admin:updatedAdmin, tasks:updatedTasks}},(err)=>{
                if(err){
                    return res.send(JSON.stringify({success:false}))
                }
                return res.send(JSON.stringify({success:true}))
            })
        })
    })
})

app.post("/new-task", upload.array("files"), (req, res) => {
  console.log("NEW-TASK HIT==");
  let author = req.body.author;
  let pid = req.body.projectId;
  let title = req.body.title;
  let description = req.body.description;
  let tags = req.body.tags.split(" ");
  let files = req.files;
  let posts = [];
  let type = "task";
  let status = "New";
  let creationDate = new Date();
  let dueDate = new Date(creationDate);
  dueDate.setDate(dueDate.getDate() + 2);
  dueDate = dueDate.toLocaleDateString();
  creationDate = creationDate.toLocaleDateString();
  let completionDate = "";
  let assignee = "";
  let watchers = [];
  let comments = [];
  //get the frontend path for each of the uplaoded files.
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      console.log("Uploaded file " + files[i]);
      let frontendPath = "/images/" + files[i].filename;
      posts.push(frontendPath);
    }
  }
  let newTask = {
    author,
    title,
    description,
    tags,
    posts,
    type,
    status,
    creationDate,
    dueDate,
    completionDate,
    assignee,
    watchers,
    comments,
    pid
  };
  dbo
    .collection("projects")
    .findOneAndUpdate(
      { _id: ObjectID(pid) },
      { $push: { tasks: newTask } },
      { returnOriginal: false },
      (err, project) => {
        if (err) {
          console.log("new-task err:", err);
          return res.send(JSON.stringify({ success: false }));
        }
        res.send(
          JSON.stringify({ success: true, newTasksArr: project.value.tasks })
        );
      }
    );
});

app.post("/detele-task",upload.none(),(req,res)=>{
    console.log("DELETE TASK HIT")
    let pid = req.body.projectId
    let taskName = req.body.taskName
    dbo.collection("projects").findOne({_id:ObjectID(pid)},(err,project)=>{
        if(err){
            return res.send(JSON.stringify({success:false}))
        }
        if(project === null){
            return res.send(JSON.stringify({success:false}))
        }
        let updatedTasks = project.tasks.filter(task=>{
            return task.title !== taskName
        })
        dbo.collection("projects").updateOne({_id:ObjectID(pid)},{$set:{tasks:updatedTasks}},(err,project)=>{
            if(err){
                return res.send(JSON.stringify({success:false}))
            }
            return res.send(JSON.stringify({success:true}))
        })
    })
})

app.post("/task-data", upload.none(), (req, res) => {
  console.log("TASK-DATA HIT==");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  console.log("pid:", pid, " task name:", taskName);
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      console.log("taskdata err:", err);
      return res.send(JSON.stringify({ success: false }));
    }
    if (project === null) {
      return res.send(JSON.stringify({ success: false }));
    }
    let queriedTask = project.tasks.filter(task => {
      return task.title === taskName;
    });
    res.send(JSON.stringify({ success: true, taskData: queriedTask[0] }));
  });
  //   res.send(JSON.stringify({ success: "inprogress..." }));
});
app.post("/reassign-task", upload.none(), (req, res) => {
  console.log("REASSIGN HIT");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  let assignee = req.body.assignee;
  let username = req.body.user

  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      console.log("reassing task err:", err);
      return res.send(JSON.stringify({ success: false }));
    }
    console.log("assignee:", assignee, " ,project users:", project.users);
    if (
      !project.users.includes(assignee) &&
      !project.admin.includes(assignee)
    ) {
      return res.send(
        JSON.stringify({ success: false, comment: "invalid user" })
      );
    }
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        console.log("MATCHING TASK TITLE:", task.title);
        task.assignee = assignee;
      }
      return task;
    });
    dbo
      .collection("projects")
      .findOneAndUpdate(
        { _id: ObjectID(pid) },
        { $set: { tasks: updatedTasks } },
        (err, project) => {
          if (err) {
            return res.send(JSON.stringify({ success: false }));
          }
          if(assignee !== username){
            let notifMessage = "You have been assigned a new task:" + taskName;
            let notifUrl = "/project/" + pid + "-" + taskName
            let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let date = new Date().toLocaleDateString();
            let timeStamp = currentTime + " - " + date;
            let notification = {
                _id:generateSID(),
                content:notifMessage,
                url:notifUrl,
                timeStamp,
                read:false
            }
            sendNotifications([assignee],notification);
          }
          

          return res.send(JSON.stringify({ success: true }));
        }
      );
  });
});

app.post("/toggle-watching-task", upload.none(), (req, res) => {
  console.log("TOGGLE WATCHIN HIT==");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  let user = req.body.user;
  console.log("pid:", pid, ", task:", taskName, " ,user:", user);
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      return res.send(JSON.stringify({ success: false }));
    }
    if (project === null) {
      return res.send(JSON.stringify({ success: false }));
    }
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        if (task.watchers.includes(user)) {
          task.watchers = task.watchers.filter(watcher => {
            return watcher !== user;
          });
        } else {
          task.watchers.push(user);
        }
      }
      return task;
    });
    dbo
      .collection("projects")
      .updateOne(
        { _id: ObjectID(pid) },
        { $set: { tasks: updatedTasks } },
        err => {
          if (err) {
            return res.send(JSON.stringify({ success: false }));
          }
          return res.send(JSON.stringify({ success: true }));
        }
      );
  });
});

app.post("/update-task-description", upload.none(), (req, res) => {
  console.log("UPDATE-TASK-DESCRIPTION HIT==");

  let pid = req.body.projectId;
  let newDescription = req.body.description;
  let taskName = req.body.taskName;

  console.log("pid:", pid, " newDesc:", newDescription);
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      console.log("update desc err:", err);
      return res.send(JSON.stringify({ success: false }));
    }
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        task.description = newDescription;
      }
      return task;
    });
    dbo
      .collection("projects")
      .updateOne({ _id: ObjectID(pid) }, { $set: { tasks: updatedTasks } });

    res.send(JSON.stringify({ success: true }));
  });
});

app.post("/add-comment", upload.none(), (req, res) => {
  console.log("ADD COMMENT HIT");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  let user = req.body.user;
  let newComment = req.body.newComment;
  let timeStamp = ""
  let watchers = []
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      return res.send(JSON.stringify({ success: false }));
    }
    if (project === null) {
      return res.send(JSON.stringify({ success: false }));
    }
    let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    let date = new Date().toLocaleDateString();
    timeStamp = currentTime + " - " + date;
    console.log("timeStamp:", timeStamp);
    let comment = { user, content: newComment, timeStamp };
    console.log("comment:", comment);
    let modifiedTask = undefined;
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        task.comments.push(comment);
        modifiedTask = task;
        //establish who the task watcher are, as they will be sent a notification
        watchers = task.watchers.slice();
        watchers.push(task.assignee)
      }
      return task;
    });
    dbo
      .collection("projects")
      .updateOne(
        { _id: ObjectID(pid) },
        { $set: { tasks: updatedTasks } },
        (err, project) => {
          if (err) {
            return res.send(JSON.stringify({ success: false }));
          }
          //set up the notification object
          let notifMessage = user + " has left a comment on a task you are watching:" + taskName;
          let notifUrl = "/project/" + pid + "-" + taskName
          watchers = watchers.filter( watcher =>{
              return watcher !== user;
          })
          let notification = {
              _id:generateSID(),
              content:notifMessage,
              url:notifUrl,
              timeStamp,
              read:false
          }
          //send notification to watchers
          sendNotifications(watchers,notification);
          return res.send(JSON.stringify({ success: true, modifiedTask }));
        }
      );
  });
});

app.post("/update-task-due-date", upload.none(), (req, res) => {
  console.log("DUE DATE UPDATE HIT==");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  let newDueDate = req.body.dueDate;
  console.log("id:", pid, " name:", taskName, " date:", newDueDate);
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      return res.send(JSON.stringify({ success: false }));
    }
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        task.dueDate = newDueDate;
      }
      return task;
    });
    dbo
      .collection("projects")
      .updateOne({ _id: ObjectID(pid) }, { $set: { tasks: updatedTasks } });

    res.send(JSON.stringify({ success: true }));
  });
});

app.post("/update-task-status", upload.none(), (req, res) => {
  console.log("UPDATE TASK STATUS HIT===");
  let pid = req.body.projectId;
  let taskName = req.body.taskName;
  let newStatus = req.body.newStatus;
  let user = req.body.user;
  let statusUpdateComment = {}
  let timeStamp = "";
  let watchers = []
  console.log("new Status:", newStatus, " ,pid:", pid, " ,name:", taskName);
  dbo.collection("projects").findOne({ _id: ObjectID(pid) }, (err, project) => {
    if (err) {
      return res.send(JSON.stringify({ success: false }));
    }
    if (project === null) {
      return res.send(JSON.stringify({ success: false }));
    }
    let updatedTasks = project.tasks.map(task => {
      if (task.title === taskName) {
        task.status = newStatus;
        //create a status update comment
        let currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let date = new Date().toLocaleDateString();
        timeStamp = currentTime + " - " + date;
        let content = `${user} has set this task to  ${newStatus}`;
        statusUpdateComment = { user:"Placeholder", content, timeStamp };
        //push this comment to the task object
        task.comments.push(statusUpdateComment);
        //establish who to send a notification to
        watchers = task.watchers.slice()
        watchers.push(task.assignee);
      }
      return task;
    });    
    
    dbo
      .collection("projects")
      .updateOne({ _id: ObjectID(pid) }, { $set: { tasks: updatedTasks } });
      //set up the notification message
      let notifMessage = user + " has set the status of a task you are watching to "+newStatus+":" + taskName;
      let notifUrl = "/project/" + pid + "-" + taskName
      //filter out the user, so that they don't get notified of updates they've made...
      watchers = watchers.filter( watcher =>{
          return watcher !== user;
      })
      let notification = {
          _id:generateSID(),
          content:notifMessage,
          url:notifUrl,
          timeStamp,
          read:false
      }
      //send it to task watchers
      sendNotifications(watchers,notification)
   return res.send(JSON.stringify({ success: true, statusUpdateComment }));
  });
});

// Your endpoints go before this line

app.all("/*", (req, res, next) => {
  // needed for react router
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
