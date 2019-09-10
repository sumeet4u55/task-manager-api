let express = require('express');
require('./db/mongoose');
const { userRoute } = require('./routes/userRoute');
const { taskRoute } = require('./routes/taskRoute');

const app = express();

app.use(express.json());


app.use(userRoute);
app.use(taskRoute);

module.exports.app = app;


