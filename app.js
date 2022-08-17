const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

app.use(cors())

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({extended:true}))
app.use(express.json())

dotenv.config({path: './env/.env'})

app.use(cookieParser())

app.use('/', require('./routes/router'))



app.use(function(req, res, next) {
    if(!req.user)
        res.header('Cache-Control', 'Private, no-cache, no-store, must-resvalidate');
    next();
})

app.listen(5000, () =>{
    console.log("Listening on port 5000");
})