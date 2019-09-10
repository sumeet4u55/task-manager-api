const request = require('supertest');
const { app } = require('../src/app');
const { User } = require('../src/models/user');
const { Task } = require('../src/models/task');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const _id = new mongoose.Types.ObjectId();
const userOne = {
    _id,
    name: 'Mike Hesson',
    email: 'mike@example.com',
    password: 'sword123',
    age: 43,
    tokens: [{
        token: jwt.sign({ _id}, process.env.JWT_SECRET)
    }]
}

beforeEach(async ()=>{
    await new User(userOne).save();
});

afterEach(async ()=>{
    await User.deleteMany();
});

test('Should signup new user', async ()=>{
    await request(app)
            .post('/users')
            .send({
                "name": "testSumeet",
                "email": "sumeet4u55@gmail.com",
                "password":"sword123",
                "age": 31
            })
            .expect(201)
});

test('Should signup new user', async ()=>{
    await request(app)
            .post('/users')
            .send({
                "name": "testSumeet",
                "email": "sumeet4u55@gmail.com",
                "password":"sword123",
                "age": 31
            })
            .expect(201)
});

test('Should login existing user and have 2 tokens', async ()=>{
    let response = await request(app)
            .post('/users/login')
            .send({
                "email": userOne.email,
                "password":userOne.password
            })
            .expect(200)
    
    let user = response.body.users;
    let token = response.body.token;

    expect(user.name).toBe(userOne.name);
    let getDbUser = await User.findById(_id);

    expect(token).toBe(getDbUser.tokens[1].token);
});

test('Should error login user', async ()=>{
    await request(app)
            .post('/users/login')
            .send({
                "email": 'xyz@example.com',
                "password":userOne.password
            })
            .expect(400)
});

test('Should get logged in user info', async ()=>{
    await request(app)
            .get('/users/me')
            .set('authorization', `Bearer ${userOne.tokens[0].token}`)
            .expect(200)
            .then((response)=>{
                expect(response.body.name).toBe(userOne.name);
            });
});

test('Should get error with no auth token', async ()=>{
    await request(app)
            .get('/users/me')
            .expect(401)
});

test('Should logout user', async ()=>{
    await request(app)
            .delete('/users/me')
            .set('authorization', `Bearer ${userOne.tokens[0].token}`)
            .expect(200)
});

test('Should fail logout user no token', async ()=>{
    await request(app)
            .delete('/users/me')
            .expect(401)
});

test('Should upload a img', async ()=>{
    await request(app)
            .post('/users/me/avatar')
            .set('authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'test/fixtures/philly.jpg')
            .expect(200)
});

test('Create a new Task for the User', async ()=>{
    let response = await request(app)
            .post('/tasks')
            .set('authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                "description":"Hellow i am task from test!! beleive me!!"
            })
            .expect(201)
    expect(response.body).not.toBe(null);
    expect(response.body.completed).toBe(false);
});
