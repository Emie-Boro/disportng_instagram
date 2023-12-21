const express = require('express');
const app = express();
const path = require('path')
const dotenv = require('dotenv')
// const mongoose = require('mongoose')
const connectDB = require('./config/db')
const exphbs = require('express-handlebars')


app.use(express.static(path.join(__dirname, 'public')))

app.engine('.hbs', exphbs.engine({ extname:'.hbs', defaultLayout:'main' }))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

dotenv.config({path: path.join(__dirname, '/config/.env')})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// connectDB()

app.get('/', (req, res)=>{
    res.render('index', {title: 'Disport NG', })
})


app.get('/dashboard', (req, res)=>{
    res.render('dashboard', {title: 'New Post', layout:'dashboard'})
})

app.post('/export', (req, res)=>{
    console.log(req.body)
    res.render('export', {title:'Export', layout:'dashboard'})
})

app.get('/login', (req,res)=>{
    res.render('login', {title: 'Login'})
})

app.post('/login', (req, res)=>{
    console.log(req.body)
    res.redirect('/dashboard')
})
app.listen(8080, console.log('Server connected...'))