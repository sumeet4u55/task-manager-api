let { app } = require('./app');
let port = process.env.PORT;

app.listen(port, ()=>{
    console.log(`Server is listening - ${port}`);
});

