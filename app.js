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
app.use(express.static('public'));

// Custom middleware to add layout rendering helper
app.use((req, res, next) => {
    res.renderWithLayout = (view, options = {}) => {
        res.render(view, options, (err, html) => {
            if (err) {
                console.error('Error rendering view:', err);
                return res.status(500).send('Server Error');
            }
            res.render('layouts/main', { 
                ...options, 
                body: html 
            });
        });
    };
    next();
});

// Helper function to load blog posts
function getBlogPosts() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf8');
    return JSON.parse(data);
}

//ROUTES

const pages = [
    { path: '/', view: 'index', title: 'خانه'},
    { path: '/about', view: 'about', title: 'درباره ما'},
    { path: '/contact', view: 'contact', title: 'تماس با ما'},
    { path: '/course', view: 'course', title: 'دوره های آموزشی', courseCss: true},
    { path: '/blog', view: 'blog', title: 'شبکه وبلاگ', posts : getBlogPosts().posts},
];

pages.forEach(page => {
    app.get(page.path, (req, res) => {
        res.renderWithLayout(page.view, { 
            title : page.title,
            courseCss : page.courseCss || false,
            fontAwesome : page.fontAwesome || false,
            posts: page.posts || null
        });
    });
});

// Individual blog post page (dynamic based on ID)
app.get('/blog/post/:id', (req, res) => {
    const data = getBlogPosts();
    const postId = parseInt(req.params.id);
    const post = data.posts.find(p => p.id === postId);
    
    if (post) {
        res.renderWithLayout('blog-detail', { 
            title: post.title,
            courseCss: false,
            fontAwesome: false,
            post: post  // Pass single post to template
        });
    } else {
        res.status(404).renderWithLayout('404', { 
            title: 'پست یافت نشد'
        });
    }
});


// Your existing static files still work!
// Any file in 'public' folder is still served automatically

// Optional: Handle 404 for missing files
app.use((req, res) => {
    // Check if we want to show a fancy 404 page with layout
    if (req.accepts('html')) {
        res.status(404).renderWithLayout('404', { 
            title: 'صفحه یافت نشد',
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