const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Task } = require('./task');

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value){
            let reg = /^password$/;
            if(reg.test(value.toLowerCase())){
                throw new Error('Password cannot be password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this;
    userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj;
}

userSchema.methods.authToken = async function(){
    let user = this;
    let token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findUserByCredentials = async (email, password)=>{
    let user = await User.findOne({email});
    if(!user){
        throw new Error('Invalid credentials');
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Invalid credentials');
    }
    return user;
}

// hash password decryption before saving it.
userSchema.pre('save', async function(next){
    let user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});


// Delete Tasks for specific users.
userSchema.pre('remove', async function(next){
    let user = this;
    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports.User = User;