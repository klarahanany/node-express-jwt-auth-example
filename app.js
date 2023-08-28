const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require ('cookie-parser')
const bodyParser = require('body-parser');
const {currentUser,onlyForUsers,usersOnly} = require("./middleware/authMiddware");
const app = express();

// middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb://127.0.0.1:27017/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3001))
  .catch((err) => console.log(err));

// routes
app.get('*', currentUser)//apply to every route (protect routes)
app.get('/', (req, res) => res.render('home'));

app.get('/smoothies', usersOnly,(req, res) => res.render('smoothies'));
app.use(authRoutes)