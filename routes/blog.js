// routes/blog.js
import { Router } from "express";
const router = Router();
import { getData } from "../services/readData.js";

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

// Blog main page with pagination
router.get('/', (req, res) => {
    const data = getData();
    const allPosts = data.posts || [];
    
    // Pagination settings
    const postsPerPage = 4;
    const currentPage = parseInt(req.query.page) || 1;
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    // Get posts for current page
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const posts = allPosts.slice(startIndex, endIndex);
    
    res.render('blog', {
        title: 'شبکه وبلاگ',
        courseCss: false,
        fontAwesome: false,
        posts: posts,
        currentPage: currentPage,
        totalPages: totalPages,
        totalPosts: totalPosts,
        postsPerPage: postsPerPage
    });
});

// Individual blog post page
router.get('/post/:id', (req, res, next) => {
    const data = getData();
    const postId = parseInt(req.params.id);
    const post = data.posts ? data.posts.find(p => p.id === postId) : null;
    
    if (!post) {
        req.notFoundMessage = "پست یافت نشد";
        return next();
    }
    
    const recentPosts = data.posts
        .filter(p => p.id !== post.id)
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);
    
    const comments = getCommentsWithReplies(postId, data.comments || []);
    
    res.render('blog-detail', {
        title: post.title,
        courseCss: false,
        fontAwesome: false,
        post: post,
        recentPosts: recentPosts,
        comments: comments,
        timeAgo: timeAgo
    });
});

// Helper functions for comments
function getCommentsWithReplies(postId, allComments) {
    const postComments = allComments.filter(c => c.postId === postId);
    const mainComments = postComments.filter(c => !c.parentId);
    const replies = postComments.filter(c => c.parentId);
    
    mainComments.forEach(comment => {
        comment.replies = replies.filter(r => r.parentId === comment.id);
    });
    
    return mainComments;
}

export default router;