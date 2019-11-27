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
app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets

let generateSID = () => {
  return Math.floor(Math.random() * 100000000);
};

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
    dbo.collection("users").insertOne({ username, email, password });
    let sid = generateSID();
    dbo.collection("cookies").insertOne({ sid, username });
    res.cookie("sid", sid);
    res.send(JSON.stringify({ success: true }));
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
// Your endpoints go before this line

app.all("/*", (req, res, next) => {
  // needed for react router
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
