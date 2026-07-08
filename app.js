import "dotenv/config";

import express from 'express';
import path, { join , dirname} from 'path';
import { fileURLToPath } from 'url';
import { getData } from "./services/readData.js";
import fs from 'fs';
//routes
import registerRoutes from "./routes/register.js";
import downloadRoutes from "./routes/download.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/course.js";
import blogRoutes from "./routes/blog.js";

import expressLayouts from 'express-ejs-layouts';
import session from "express-session";
import { title } from "process";
import flash from "express-flash";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;


//Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

//for flashing messages
app.use(flash());

//Middleware for parsing from data
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// THIS ONE LINE does everything!
// It serves ALL files from the 'public' folder
app.use(express.static(join(__dirname, 'public')));

//for puttin the layout on top of the rest of the structure
app.use(expressLayouts);
app.set('layout', 'layouts/main');


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

//for accessing users in session everywhere
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});


//ROUTES
//static pages
const pages = [
    { path: '/about',         view: 'about',         title: 'درباره ما'},
    { path: '/contact',       view: 'contact',       title: 'تماس با ما',   fontAwesome : true},
    { path: '/event',         view: 'event',         title: 'رویداد ها'},
    { path: '/testimonial',   view: 'testimonial',   title: 'گواهینامه'},
    { path: '/live-class',    view: 'live-class',    title: 'وبینار'},
    { path: '/register',      view: 'register',      title: 'ثبت نام',                 courseCss : true, fontAwesome : true},
    { path: '/profile',       view: 'profile',       title: 'پنل کاربری',              courseCss : true, fontAwesome : true},
    { path: '/checkout',      view: 'checkout',      title: 'خرید' ,                   courseCss : true,  fontAwesome : true},
    { path: '/quizzes',       view: 'quizzes',       title: 'آزمون های آنلاین' ,        courseCss : true, fontAwesome : true}
];

pages.forEach(page => {
    app.get(page.path, (req, res) => {

        // Create a copy of page object and remove 'path' and 'view'
        const { path, view, ...renderData } = page;

        // Set defaults for missing properties
        renderData.title = renderData.title || 'وبلاگ آموزشی';
        renderData.courseCss = renderData.courseCss || false;
        renderData.fontAwesome = renderData.fontAwesome || false;
        
        // Pass all remaining properties to render
        res.render(view, renderData);
    });
});

//dynamic pages

app.use("/blog", blogRoutes);
app.use("/course", courseRoutes);
app.use("/register", registerRoutes);
app.use("/download", downloadRoutes);
app.use("/admin", adminRoutes);

app.get('/', (req, res) => {
    const data = getData();
    res.render('index', {
        title: 'خانه',
        instructors: data.instructors || [],
        courses: data.courses || [],
        courseCss: false,
        fontAwesome: false
    });
});

app.get('/instructor', (req, res) => {
    const data = getData();
    res.render('instructors', {
        title: 'آموزگار',
        instructors: data.instructors || [],
        courseCss: false,
        fontAwesome: false
    });
});

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
        res.status(404).sendFile(join(__dirname, 'public', '404.html'));
    }
});


app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${join(__dirname, 'public')}`);
    console.log(`🎨 Using EJS layout system for dynamic pages`);
});