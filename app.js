const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


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


// Helper function to load blog posts
function getData() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'data.json'), 'utf8');
    return JSON.parse(data);
}

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
app.get('/blog', (req, res) => {

    const postsData = getData().posts;

    res.render('blog', {
            title : 'شبکه وبلاگ',
            courseCss : false,
            fontAwesome : false,
            posts: postsData // taking all of the posts
    })
});

// Individual blog post page (dynamic based on ID)
app.get('/blog/post/:id', (req, res, next) => {
    const data = getData();
    const postId = parseInt(req.params.id);
    const post = data.posts.find(p => p.id === postId);
    
    if (post) {
        res.render('blog-detail', { 
            title: post.title,
            courseCss: false,
            fontAwesome: false,
            post  // Pass single post to template
        });
    } else {
        req.notFoundMessage = "پست یافت نشد";
        return next();
    }
});

app.get('/course-grid', (req, res) => {

    const coursesData = getData().courses;

    res.render('course-grid', {
            title : 'دوره های آموزشی',
            courseCss : true,
            fontAwesome : true,
            courses: coursesData // taking all of the posts
    });
});


app.get('/course/:slug', (req, res, next) => {

    const data = getData();

    const course = data.courses.find(c => c.slug === req.params.slug);

    if (course) {
        res.render('course-detail', {
            title: course.title,
            courseCss: true,
            fontAwesome: true,
            course
        });
    } else {
        req.notFoundMessage = 'دوره یافت نشد';
        return next();
    }
});

app.get('/course/:slug/lesson/:session', (req, res, next) => {

    const data = getData();

    const course = data.courses.find(
        c => c.slug === req.params.slug
    );    

    if(course)
    {
        const sessionNumber = parseInt(req.params.session);
    
        let lesson = null;
    
        for (const section of course.sections) {
            const found = section.lessons.find(
                l => l.session === sessionNumber
            );
    
            if (found) {
                lesson = found;
                break;
            }
        }

        if(lesson)
        {
            res.render('lessons', {
                title: lesson.title,
                courseCss: true,
                fontAwesome: true,
                course,
                lesson
            });
        }else
        {
            req.notFoundMessage = 'جلسه یافت نشد';
            return next();
        }
    }else
    {
        req.notFoundMessage = 'دوره یافت نشد';
        return next();
    }
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
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🎨 Using EJS layout system for dynamic pages`);
});