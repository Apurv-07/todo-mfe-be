const express = require('express')
const app = express();
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv').config();
const userrouter = require('./routes/userRoutes')
const todorouter = require('./routes/todoRoutes')
const cors = require('cors');
const progressrouter = require('./routes/progressRoutes');

const PORT = process.env.PORT;
const URL = process.env.URL;

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
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
    "https://progress-mfe.vercel.app",
    "https://todo-mfe.vercel.app",
    "https://host-mfe-ochre.vercel.app"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use('/user', userrouter);
app.use('/todo', todorouter);
app.use('/todo-calendar', progressrouter)
app.listen(PORT, async () => {
  try {
    const connect = await mongoose.connect(URL)
    console.log(`DB connected and Server is running on ${PORT}`)
    console.log(new Date().toString());
    console.log(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  } catch (e) {
    console.log("ERR", e)
  }
})
