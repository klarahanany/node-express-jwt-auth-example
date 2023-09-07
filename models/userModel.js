const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt  = require('bcrypt')
const Roles = require("./Roles");
const UserSchema = new mongoose.Schema({
    username : {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true
    },

    email : {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase :true,
        validate : [isEmail, 'Please enter a valid email']
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    password : {
        type : String,
        require : [true, 'Please enter a password'],
        select: false,
        minlength: 8, // Minimum password length is 8 characters
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
        default: Roles.viewer

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
    }
})

// call the function before doc saved to database (instance already created tho)

// UserSchema.pre('save', async function (next){
//
//     if(this.password == null) {
//         console.log("null")
//       throw new Error('null')
//     }
//     this.password = await bcrypt.hash(this.password,11)  //this.password refers to the instance of current user pass
//
//     next()
// })


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

UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};



const UserModel= mongoose.model('user', UserSchema)
const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = {UserModel, validate };

