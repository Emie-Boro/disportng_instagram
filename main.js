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

connectDB()
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

app.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render('dashboard', {
        layout:'dashboard'
    })
})

app.get('/newInstagramPost', ensureAuthenticated, (req, res)=>{
    res.render('newInstagramPost', {
        layout: 'dashboard'
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

// ___________________________Story Post ___________________________________________
app.get('/newStory', (req,res)=>{
    res.render('newStory',{
        layout: req.isAuthenticated() ? 'dashboard' : 'main',
    })
})
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

app.get('/stories/:id', ensureAuthenticated, async (req,res)=>{
    const story = await Story.findById(req.params.id).lean()
    res.render('story',{
        layout:'dashboard',
        story
    })
})


app.delete('/story/:id', ensureAuthenticated, async (req,res)=>{
    await Story.deleteOne({_id:req.params.id})
    res.redirect('/stories')
})

app.get('/logout', (req, res)=>{
    req.logOut(err =>{
        if(err) throw err;
    })
    res.redirect('/')
})

app.listen(process.env.PORT || 8080, () => {
    console.log('Server started...');
})


// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log("listening for requests");
//     })
// }).catch(err=>{
//     console.log(err)
// })