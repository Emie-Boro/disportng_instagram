app.get('/newInstagramPost', (req, res)=>{
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
        // layout: req.isAuthenticated() ? 'dashboard' : 'main',
    })
})
app.get('/stories', async (req,res)=>{
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

app.get('/stories/:id', async (req,res)=>{
    const story = await Story.findById(req.params.id).lean()
    res.render('story',{
        layout:'dashboard',
        story
    })
})


app.delete('/story/:id', async (req,res)=>{
    await Story.deleteOne({_id:req.params.id})
    res.redirect('/stories')
})