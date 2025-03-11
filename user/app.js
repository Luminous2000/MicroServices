const dotenv = require("dotenv")
dotenv.config()
const express = require("express");
const app = express();
const connect = require('./db/db')
connect()
const userRoutes = require("./routes/user.routes");
const cookieParser = require('cookie-parser')
const rabbitMq = require('./service/rabbit')
const morgan = require('morgan')



app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
rabbitMq.connect();




app.use("/", userRoutes);

module.exports = app;
