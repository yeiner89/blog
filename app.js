//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/*connect and create DB */

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    try {
      await newUser.save();
      res.render("secrets");
    } catch (err) {
      console.log(err);
    }
  });
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username }).exec();

    if (foundUser) {
      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (result === true) {
          // Passwords match; render the "secrets" view
          res.render("secrets");
        } else {
          // Passwords do not match; handle authentication failure
          res.render("login"); // You might want to render a login error page
        }
      });
    } else {
      // User not found; handle authentication failure
      res.render("login"); // You might want to render a login error page
    }
  } catch (err) {
    console.log(err);
    // Handle other errors as needed
  }
});

app.listen(3000, function () {
  console.log("server startred on port 3000.");
});
