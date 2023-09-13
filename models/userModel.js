const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt  = require('bcrypt')
const Roles = require("./Roles");
const UserSchema =  mongoose.Schema({


    username : {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true
    },
    phoneNumber : {
        type: String,
    required: [true, 'Please enter a phone number.'],
        unique: true
    },

    email : {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase :true,
        validate : [isEmail, 'Please enter a valid email']
    },
    password : {
        type : String,
        require : [true, 'Please enter a password'],
        select: false,
        minlength: 6, // Minimum password length is 8 characters
    },
    passwordConfirm : {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    firstName : {
        type: String,
        required: [true, 'Please enter a first name.'],

    },
    lastName : {
        type: String,
        required: [true, 'Please enter a last name.'],

    },
    role : {
        type: String,
        enum: [Roles],
        default: Roles.admin

    },
    isVerified: {
        type: Boolean,
        default: false,
    },
   /**  userLogs : [{
      type: mongoose.Schema.Types.ObjectId, ref: "logs"
    }],**/
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    companyName: {
        type: String
    },

})



UserSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

UserSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

//generate new token only for password reset
UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 mins expire

    return resetToken;
};


//const UserModel= mongoose.model('user', UserSchema)

module.exports = UserSchema