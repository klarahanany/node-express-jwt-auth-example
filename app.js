const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const {
  currentUser,
  onlyForUsers,
  usersOnly,
  isLoggedIn,
} = require("./middleware/authMiddware");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const userModel = require("./models/userModel"); // Import your UserModel

// middleware
app.use(express.static("public"));

// Define a route to handle email verification
app.get("/verify/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;

  try {
    // Verify the token and update the user's 'isVerified' status
    const user = await userModel.findById(userId);

    if (user) {
      if (verifyToken(token, user)) {
        user.isVerified = true;
        await user.save();
        res.redirect("/login"); // Redirect to the login page after successful verification
      } else {
        res.status(400).json({ error: "Invalid token" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
app.use(cors());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
// view engine
app.set("view engine", "ejs");

app.use(globalErrorHandler);
// routes

app.get("*", currentUser); //apply to every route (protect routes)
app.get("/", (req, res) => res.render("home"));

app.use("/", authRoutes);
app.use(isLoggedIn);

app.get("/smoothies", (req, res) => res.render("smoothies"));

module.exports = app;
