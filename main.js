const express = require('express');
const app = express();
const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('./config/passport')
const multer = require('multer')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const PORT = process.env.PORT || 8080;

// dotenv.config({path: path.join(__dirname, '/config/.env')})


// Multer initializataion
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

// Database collection
// Check connection status
const mongoose = require('mongoose')
const connectDB = require('./config/db')

// connectDB()
//------------Model----------------------
const User = require('./config/User');
const Story = require('./config/Story')

app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))


app.engine('.hbs', exphbs.engine({ extname:'.hbs', defaultLayout:'main' }))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(session({
    secret:process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


const { ensureAuthenticated } = require('./config/auth');
const { readFile } = require('fs');


app.get('/', (req, res)=>{
    if(req.isAuthenticated()) {
        res.redirect('/dashboard')
    }
    res.render('index', {
        title: 'Disport NG', 
    })
})


app.get('/login', (req,res)=>{
    if(req.isAuthenticated()) {
        res.redirect('/dashboard')
    }
    res.render('login', {title: 'Login'})
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
    })(req, res, next);
});


// New User, hashed password and saved to database
app.get('/signup', (req, res)=>{
    res.render('signup')
})
app.post('/signup', async (req,res)=>{
    const name = req.body.name;
    const email = req.body.email
    const phone = req.body.phone;
    const username = req.body.username;
    const password = req.body.password;

    let newUser = await new User({
        name:name,
        email:email,
        phone:phone,
        username:username,
        password:password
    })

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
    newUser.save()
    
    res.redirect('/login')
})

app.get('/dashboard', (req, res)=>{
    if(req.isAuthenticated()) {
        res.render('dashboard', {
            layout:'dashboard'
        })
    } else{
        res.redirect('/login')
    }
})

app.get('/logout', (req, res)=>{
    req.logOut(err =>{
        if(err) throw err;
    })
    res.redirect('/')
})

// app.listen(process.env.PORT || 8080, () => {
//     console.log('Server started...');
// })


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})