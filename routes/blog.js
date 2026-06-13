import { Router } from "express";
const router = Router();

import { getData } from "../services/data.js";

router.get('/', (req, res) => {

    const postsData = getData().posts;

    res.render('blog', {
            title : 'شبکه وبلاگ',
            courseCss : false,
            fontAwesome : false,
            posts: postsData // taking all of the posts
    })
});

// Individual blog post page (dynamic based on ID)
router.get('/post/:id', (req, res, next) => {
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

export default router;