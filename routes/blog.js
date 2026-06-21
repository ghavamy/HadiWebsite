import { Router } from "express";
const router = Router();

import { getData , writeData } from "../services/readData.js";
import { v4 as uuidv4 } from 'uuid';

// Helper function to format time
function timeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    
    if (diff < 60) return 'الان';
    if (diff < 3600) return Math.floor(diff / 60) + ' دقیقه پیش';
    if (diff < 86400) return Math.floor(diff / 3600) + ' ساعت پیش';
    if (diff < 604800) return Math.floor(diff / 86400) + ' روز پیش';
    return new Date(date).toLocaleDateString('fa-IR');
}

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
    
    const recentPosts = data.posts
    .filter(p => p.id !== post.id) // don't show current post
    .sort((a, b) => b.id - a.id)   // newest first
    .slice(0, 4);  

    const comments = data.comments.filter(c => c.postId === postId && !c.parentId);//main comments of this post(replies handled inside the html)
    
    if (post) {
        res.render('blog-detail', { 
            title: post.title,
            courseCss: false,
            fontAwesome: false,
            post,  // Pass single post to template
            recentPosts,
            comments,
            timeAgo
        });
    } else {
        req.notFoundMessage = "پست یافت نشد";
        return next();
    }
});

// Handle comment submission
router.post('/post/:id/comment', (req, res) => {
    const postId = parseInt(req.params.id);
    const { name, email, content, parentId } = req.body;
    
    // Validate input
    if (!name || !content) {
        req.flash('error', 'لطفاً نام و متن نظر را وارد کنید');
        return res.redirect(`/blog/post/${postId}`);
    }
    
    // Save comment to database
    const comment = {
        id: uuidv4(),
        postId: postId,
        name: name,
        email: email,
        content: content,
        parentId: parentId || null,
        avatar: '/assets/img/student.png',
        createdAt: new Date(),
        replies: []
    };

    const data = getData();
    //Modify the comments array
    if (!data.comments) 
    {
        data.comments = [];
    }

    if (comment.parentId) {
        // Find the main comment (returns object, not array)
        const mainComment = data.comments.find(c => c.id === comment.parentId);
        
        // Check if main comment exists
        if (mainComment) {
            // Initialize replies array if it doesn't exist
            if (!mainComment.replies) {
                mainComment.replies = [];
            }
            // Push the reply to the actual main comment
            mainComment.replies.push(comment);
        } else {
            // Handle case where parent comment doesn't exist
            console.error(`Parent comment ${comment.parentId} not found`);
            // Optionally: throw error or add as top-level comment
            comment.parentId = null;
            data.comments.push(comment);
        }
    } else {
        // No parentId - it's a top-level comment
        data.comments.push(comment);
    }
    
    // Save the ENTIRE data object back to file
    writeData(data);  // ← Pass the whole data object!
    
    req.flash('success', 'نظر شما با موفقیت ثبت شد');
    res.redirect(`/blog/post/${postId}#comment-${comment.id}`);
    
});

export default router;