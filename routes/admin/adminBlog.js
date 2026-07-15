// routes/admin/blog.js
import { Router } from "express";
import { getData, writeData } from "../../services/readData.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, '../../public/assets/img/blog');

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('فایل باید تصویر باشد (JPEG, PNG, JPG, GIF, WEBP)'));
        }
    }
});

// Helper to get next post ID
function getNextPostId(posts) {
    if (posts.length === 0) return 1;
    const maxId = Math.max(...posts.map(p => p.id));
    return maxId + 1;
}

// Main blog management page
router.get('/', (req, res) => {
    try {
        const data = getData();
        const posts = data.posts || [];
        posts.sort((a, b) => b.id - a.id);
        
        res.render('adminBlogs', {
            title: 'مدیریت مقالات',
            layout: 'layouts/admin',
            currentPage: 'blog',
            posts: posts,
            editPost: null,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Error loading blog page:', error);
        res.redirect('/admin/blog?error=خطا در بارگذاری صفحه');
    }
});

// Get post data for editing
router.get('/edit/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const data = getData();
        const posts = data.posts || [];
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            return res.redirect('/admin/blog?error=مقاله یافت نشد');
        }
        
        posts.sort((a, b) => b.id - a.id);
        
        res.render('adminBlogs', {
            title: 'ویرایش مقاله',
            layout: 'layouts/admin',
            currentPage: 'blog',
            posts: posts,
            editPost: post, // Pass the post data to fill the form
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Error loading post for edit:', error);
        res.redirect('/admin/blog?error=خطا در بارگذاری مقاله');
    }
});

// Create post via AJAX or form
router.post('/create', upload.single('image'), (req, res) => {
    try {
        const { title, date, author, category, excerpt, content, tags } = req.body;
        const imageFile = req.file;
        
        if (!title || !content) {
            req.flash('error', 'عنوان و محتوا الزامی هستند');
            return res.redirect('/admin/blog');
        }
        
        const data = getData();
        const posts = data.posts || [];
        
        const newPost = {
            id: getNextPostId(posts),
            title: title.trim(),
            date: date || new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
            author: author || 'مدیر سایت',
            category: category || 'عمومی',
            image: imageFile ? `/assets/img/blog/${imageFile.filename}` : '/assets/img/blog/default.jpg',
            excerpt: excerpt || content.substring(0, 150) + '...',
            content: content,
            tags: tags ? tags.split(',').map(t => t.trim()) : ['عمومی']
        };
        
        posts.push(newPost);
        data.posts = posts;
        writeData(data);
        
        res.redirect('/admin/blog?success=مقاله با موفقیت ایجاد شد');
        
    } catch (error) {
        console.error('Error creating post:', error);
        res.redirect('/admin/blog?error=خطا در ایجاد مقاله');
    }
});

// Update post
router.post('/update/:id', upload.single('image'), (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { title, date, author, category, excerpt, content, tags } = req.body;
        const imageFile = req.file;
        
        const data = getData();
        const posts = data.posts || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.redirect('/admin/blog?error=مقاله یافت نشد');
        }
        
        const updatedPost = {
            ...posts[postIndex],
            title: title.trim() || posts[postIndex].title,
            date: date || posts[postIndex].date,
            author: author || posts[postIndex].author,
            category: category || posts[postIndex].category,
            excerpt: excerpt || content.substring(0, 150) + '...',
            content: content || posts[postIndex].content,
            tags: tags ? tags.split(',').map(t => t.trim()) : ['عمومی']
        };
        
        if (imageFile) {
            if (posts[postIndex].image && !posts[postIndex].image.includes('default.jpg')) {
                const oldImagePath = path.join(__dirname, '../../public', posts[postIndex].image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updatedPost.image = `/assets/img/blog/${imageFile.filename}`;
        }
        
        posts[postIndex] = updatedPost;
        data.posts = posts;
        writeData(data);
        
        res.redirect('/admin/blog?success=مقاله با موفقیت ویرایش شد');
        
    } catch (error) {
        console.error('Error updating post:', error);
        res.redirect('/admin/blog?error=خطا در ویرایش مقاله');
    }
});

// Delete post
router.get('/delete/:id', (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const data = getData();
        const posts = data.posts || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.redirect('/admin/blog?error=مقاله یافت نشد');
        }
        
        const post = posts[postIndex];
        if (post.image && !post.image.includes('default.jpg')) {
            const imagePath = path.join(__dirname, '../../public', post.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        posts.splice(postIndex, 1);
        data.posts = posts;
        writeData(data);
        
        res.redirect('/admin/blog?success=مقاله با موفقیت حذف شد');
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.redirect('/admin/blog?error=خطا در حذف مقاله');
    }
});

export default router;