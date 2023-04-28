require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require ('cors');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500;

//connect to mongodb
connectDB();

//built-in middleware
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());



app.use('/', require('./routes/root'));
app.use('/states', require('./routes/api/states'))

app.all('*', (req, res)=> {
    res.status(404);
    if(req.accepts('html'))
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    else if(req.accepts('json'))
        res.json({"error" : "404 Not Found"})
});


mongoose.connection.once('open', () =>{
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})