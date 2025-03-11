const express  = require('express');
const expressProxy = require('express-http-proxy')
const morgan = require('morgan')

const app = express();

app.use(morgan('dev'))
app.use('/user',expressProxy("http://localhost:3001"))
app.use('/captain',expressProxy("http://localhost:3002"))

app.use('/ride',expressProxy("http://localhost:3003"))


app.listen(3000,()=>{
    console.log("gateway running on port 3000")
})

