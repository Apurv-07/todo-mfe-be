const express = require ('express')
const app = express();
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv').config();
const userrouter = require('./routes/userRoutes')
const todorouter = require('./routes/todoRoutes')
const cors = require('cors')

const PORT = process.env.PORT;
const URL = process.env.URL;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:4173",
    "http://localhost:4174",
    "http://localhost:4175",
    "https://login-mfe-sage.vercel.app",
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use('/user', userrouter);
app.use('/todo', todorouter);
app.listen(PORT, async()=>{
    try {
        const connect = await mongoose.connect(URL)
        console.log(`DB connected and Server is running on ${PORT}`)
    }catch(e){
        console.log("ERR", e)
    }
})