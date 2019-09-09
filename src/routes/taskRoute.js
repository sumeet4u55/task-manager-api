const express = require('express');
let taskRoute = express.Router();
let { Task } = require('../models/task');
let { auth } = require('../middleware/auth');


// ?completed=false|true
// ?limit=2&skip=2
// sortBy=createdAt:asc| :desc
taskRoute.get('/tasks', auth, async (req, res)=>{
    try {
        // let tasks = await Task.find({owner: req.user._id});
        let sort = {};
        if(req.query.sortBy){
            let arr = req.query.sortBy.split(':');
            sort[arr[0]] = arr[1] === 'desc' ? -1 : 1;
        }
        let match = {};
        if(req.query.completed){
            match.completed = req.query.completed === 'true';
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks);
    } catch(e) {
        res.status(400).send(`Could not fetch users ${e}`);
    }
});

taskRoute.get('/tasks/:id', auth, async (req, res)=>{
    let _id = req.params.id;

    try {
        let task = await Task.findOne({ _id, owner: req.user._id })

        res.status(200).send(task);
    } catch(e) {
        res.status(400).send(`Could not fetch user ${e}`);
    }
});

taskRoute.post('/tasks', auth, async (req, res)=>{
    let body = req.body;
    
    const task = new Task({
        ...body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send(`Error creating the task - ${e}`);
    }
});

taskRoute.patch('/tasks/:id', auth, async (req, res)=>{

    let _id = req.params.id;
    let body = req.body;

    let allowedUpdates = ['description', 'completed'];
    let toUpdate = Object.keys(body);

    let isValid = toUpdate.every((elem)=>allowedUpdates.includes(elem));

    if(!isValid){
        return res.status(400).send({error: "Invalid Update body!"});
    }

    try {
        let task = await Task.findOne({ _id, owner: req.user._id });
        if(!task){
            return res.status(400).send();
        }

        toUpdate.forEach((elem) => task[elem] = body[elem]);
        await task.save();

        res.status(200).send(task);
    } catch(e) {
        res.status(400).send(`Could not fetch task ${e}`);
    }
});

taskRoute.delete('/tasks/:id', auth, async (req, res)=>{
    let _id = req.params.id;
    try {
        let task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        if(!task){
            return res.status(400).send();
        }
        if(task.owner != req.user._id.toString()){
            throw new Error('Authentication failed!!');
        }
        res.status(200).send(task);
    } catch(e) {
        res.status(400).send(`Could not fetch task ${e}`);
    }
});

module.exports.taskRoute = taskRoute;