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

// Multer initializataion
const storage = multer.memoryStorage();
const upload = multer({storage: storage})



// Database collection
// Check connection status
const mongoose = require('mongoose')
// const mongoose = require('mongoose')
const connectDB = require('./config/db')
connectDB()

app.use(express.static(path.join(__dirname, 'public')))

app.engine('.hbs', exphbs.engine({ extname:'.hbs', defaultLayout:'main' }))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

dotenv.config({path: path.join(__dirname, '/config/.env')})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(session({
    secret:process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


const { ensureAuthenticated } = require('./config/auth')

//------------Model----------------------
const User = require('./config/User');

app.get('/', (req, res)=>{
    if(req.isAuthenticated()) {
        res.redirect('/dashboard')
    }
    res.render('index', {title: 'Disport NG', })
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
app.post('/signup', (req,res)=>{
    let newUser = new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        username:req.body.username,
        password:req.body.password
    })

    bcrypt.genSalt(10, (err, salt) => {
        if(err) {
            throw err;
        }

        bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) {
                throw err;
            }
            newUser.password = hash;
            newUser.save().then(()=> console.log('Saved...'))
        })
    })
    
    res.redirect('/login')
})

app.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render('dashboard', {
        title: 'New Post', 
        layout:'dashboard',
        username: req.user.username,
        name: req.user.name,
    })
})
app.post('/export', ensureAuthenticated, upload.single('image'), (req,res)=>{
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');
    const imageURL = `data:${req.file.mimetype};base64,${base64Image}`;

    res.render('export', {
        imageURL,
        title: req.body.title,
        content:req.body.content
    })
})

app.get('/logout', (req, res)=>{
    req.logOut(err =>{
        if(err) throw err;
    })
    res.redirect('/login')
})
app.listen(8080, console.log('Server connected...'))