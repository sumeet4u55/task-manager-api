let express = require('express');
require('./db/mongoose');
const { userRoute } = require('./routes/userRoute');
const { taskRoute } = require('./routes/taskRoute');

const app = express();
const port = process.env.PORT;


app.use(express.json());


app.use(userRoute);
app.use(taskRoute);


app.listen(port, ()=>{
    console.log(`Server is listening - ${port}`);
});

