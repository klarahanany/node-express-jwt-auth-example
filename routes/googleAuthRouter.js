require("dotenv").config({ path: '../.env' });

const router = require("express").Router();
//const passport = require("passport");


const jwt = require("jsonwebtoken");

const passport = require('../google-auth/passportSetup')
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIERS_IN,
    });
}

// login success
router.get("/login/success", (req, res) => {
    if (req.user) {
        const accessToken = generateAccessToken({
            userId: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            role: req.user.role,
            active: req.user.active,
            companyName: req.user.companyName,
        });

        res.status(200).json({
            success: true,
            message: "successfull",
            user: req.user,
            accessToken: accessToken,
        });
    }
});

// login failed
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Unauthorized",
    });
});

// auth logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_LOGIN);
});

// auth with google+
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// callback route for google to redirect to
router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: process.env.LOG_IN_FAILED,
        failureMessage: "Uauthorized Access!",
    })
);

module.exports = router;
