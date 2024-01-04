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


const { ensureAuthenticated } = require('./config/auth')


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
        layout: 'dashboard',
        imageURL,
        title: req.body.title,
        content:req.body.content
    })
})

app.get('/logout', (req, res)=>{
    req.logOut(err =>{
        if(err) throw err;
    })
    res.redirect('/')
})


// ___________________________Story Post ___________________________________________
app.get('/stories', ensureAuthenticated, async (req,res)=>{
    const stories = await Story.find({}).lean()

    res.render('stories', {
        layout:'dashboard',
        title:'Stories',
        stories:stories
    })
})

app.post('/story/share', async (req,res)=>{
    try {
        // Save the story to the database
        await new Story({
            state: req.body.state,
            phone: req.body.phone,
            email: req.body.email,
            name: req.body.name,
            title: req.body.title,
            content: req.body.content
        }).save();

        // Send a success response
        res.status(200).json({ success: true, message: 'Story saved successfully' });
    } catch (error) {
        // Send an error response
        res.status(500).json({ success: false, message: 'Failed to save the story' });
    }
})

app.get('/story/:id', ensureAuthenticated, async (req,res)=>{
    const story = await Story.findById(req.params.id).lean()
    res.render('story',{
        layout:'dashboard',
        title:story.title,
        content:story.content,
        name:story.name,
        phone:story.phone,
        email:story.email,
        state:story.state
    })
})

// app.listen(process.env.PORT || 8080, () => {
//     console.log('Server started...');
// })


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})