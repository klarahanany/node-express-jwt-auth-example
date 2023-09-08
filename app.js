const express = require('express');

const cors = require("cors");
const adminRoutes = require('./routes/adminRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const emailRoutes = require('./routes/emailRoutes')
const cookieParser = require ('cookie-parser')
const bodyParser = require('body-parser');
const {currentUser,onlyForUsers,usersOnly, isLoggedIn} = require("./middleware/authMiddware");
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const {switchDB, getDBModel} = require("./multiDatabaseHandler");
const userSchema = require("./models/userModel");
const {Response, Request, NextFunction} = require('express')
// middleware
app.use(express.static('public'));
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//It prevents any random website from using your authenticated cookies to send an API request to your bank's website and do stuff like secretly withdraw money.
app.use(cors());
// app.all('*', function (req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     //...
// });
//Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);
// view engine
app.set('view engine', 'ejs');

app.use(globalErrorHandler);
// routes

app.get('*', currentUser)//apply to every route (protect routes)
app.get('/', (req, res) => res.render('home'));
app.use("/",emailRoutes)
app.use("/",authRoutes)
app.use('/admin',adminRoutes)
app.use("/home",userRoutes)
app.get('/smoothies',(req, res) => res.render('smoothies'));

module.exports = app;