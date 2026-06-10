const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//routes
const registerRoutes = require("./routes/register");
const courseRoutes = require("./routes/course");
const blogRoutes = require("./routes/blog");


//Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware for parsing from data
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// THIS ONE LINE does everything!
// It serves ALL files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

//for puttin the layout on top of the rest of the structure
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main.ejs');

//modules for email and sms
const nodemailer = require('nodemailer');



//ROUTES
//static pages
const pages = [
    { path: '/', view: 'index', title: 'خانه'},
    { path: '/about', view: 'about', title: 'درباره ما'},
    { path: '/contact', view: 'contact', title: 'تماس با ما'},
];

pages.forEach(page => {
    app.get(page.path, (req, res) => {
        res.render(page.view, { 
            title : page.title,
            courseCss : page.courseCss || false,
            fontAwesome : page.fontAwesome || false,
        });
    });
});

//dynamic pages



app.use("/blog", blogRoutes);
app.use("/course", courseRoutes);
app.use("/register", registerRoutes);


// Your existing static files still work!
// Any file in 'public' folder is still served automatically

// Optional: Handle 404 for missing files
app.use((req, res) => {
    // Check if we want to show a fancy 404 page with layout
    if (req.accepts('html')) {
        res.status(404).render('404', { 
            title: req.notFoundMessage || 'صفحه یافت نشد',
            courseCss : false,
            fontAwesome : false
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});


app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🎨 Using EJS layout system for dynamic pages`);
});