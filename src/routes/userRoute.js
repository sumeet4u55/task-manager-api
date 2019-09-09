const express = require('express');
let userRoute = express.Router();
let { User } = require('../models/user');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const { sendWelcomeEmail, sendGoodByeEmail } = require('../emails/account');


userRoute.post('/users/login', async (req, res)=>{
    try {
        let body = req.body;
        let users = await User.findUserByCredentials(body.email, body.password);
        let token = await users.authToken();
        res.status(200).send({ users, token });
    } catch(e) {
        res.status(400).send(`${e}`);
    }
});

userRoute.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        });

        await req.user.save();

        res.status(200).send();
    } catch(e) {
        res.status(400).send(`${e}`);
    }
});

userRoute.post('/users/logoutall', auth, async (req, res)=>{
    try {
        req.user.tokens = [];

        await req.user.save();

        res.status(200).send();
    } catch(e) {
        res.status(400).send(`${e}`);
    }
});

userRoute.get('/users/me', auth, async (req, res)=>{
    
    res.status(200).send(req.user);
});

// userRoute.get('/users/:id', async (req, res)=>{
//     let _id = req.params.id;
//     try {
//         let user = await User.findById(_id);
//         if(!user){
//             return res.status(400).send();
//         }
//         res.status(200).send(user);
//     } catch(e) {
//         res.status(400).send(`Could not fetch user ${e}`);
//     }
// });

userRoute.post('/users', async (req, res)=>{
    let body = req.body;
    let user = await User.findOne({ email:body.email });
    try {
        if(user && user.email){
            throw new Error('Email already taken!');
        }
        const newUser = new User({
            name: body.name,
            email: body.email,
            password: body.password,
            age: body.age
        })
        
        await newUser.save();
        sendWelcomeEmail(newUser.email, newUser.name);
        let token = await newUser.authToken();
        
        res.status(201).send({user: newUser, token});
    } catch(e) {
        res.status(400).send(`Error creating the user ${e}`);
    }
});

userRoute.delete('/users/me', auth, async (req, res)=>{
    let _id = req.params.id;
    try {
        // let user = await User.findByIdAndDelete(req.user._id);
        // if(!user){
        //     return res.status(400).send();
        // }
        req.user.remove();
        sendGoodByeEmail(req.user.email, req.user.name);
        res.status(200).send(req.user);
    } catch(e) {
        res.status(400).send(`Could not fetch user ${e}`);
    }
});

userRoute.patch('/users/me', auth, async (req, res)=>{
    // let _id = req.params.id;
    let body = req.body;

    let allowedUpdates = ['age', 'password', 'name', 'email'];
    let toUpdate = Object.keys(body);

    let isValid = toUpdate.every((elem)=>allowedUpdates.includes(elem));

    if(!isValid){
        return res.status(400).send({error: "Invalid Update body!"});
    }

    try {
        // let user = await User.findById(_id);
        toUpdate.forEach((elem) => req.user[elem] = body[elem]);

        await req.user.save();

        res.status(200).send(req.user);
    } catch(e) {
        res.status(400).send(`Could not fetch user ${e}`);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!(file.originalname.match(/\.(jpg|jpeg|png)$/))){
            return cb(new Error('Upload only jpg|jpeg|png formats!'));
        }
        cb(undefined, true);
    }
});

userRoute.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(200).send();
}, (error, req, res, next) => {
    res.send({ error: error.message});
});

userRoute.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = null;
    await req.user.save();
    res.status(200).send('Deleted Avatar!');
}, (error, req, res, next) => {
    res.send({ error: error.message});
});

userRoute.get('/users/:id/avatar', async (req, res)=>{
    try {
        const user = await User.findById(req.params.id);
        
        res.set('Content-type','image/jpg');
        res.status(200).send(user.avatar);
    } catch(e) {
        res.status(404).send();
    }
}, (error, req, res, next) => {
    res.send({ error: error.message});
});

module.exports.userRoute = userRoute;