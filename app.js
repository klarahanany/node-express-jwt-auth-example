const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require ('cookie-parser')
const bodyParser = require('body-parser');
const {checkUser,requireAuth} = require("./middleware/authMiddware");
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
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser)//apply to every route
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth,(req, res) => res.render('smoothies'));
app.use(authRoutes)