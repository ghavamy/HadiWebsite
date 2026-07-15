// routes/admin/courses.js
import { Router } from "express";
import { getData, writeData } from "../../services/readData.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, '../../public/assets/img/course');

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

// Helper to generate slug
function generateSlug(title) {
    return title
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

// Main courses page
router.get('/', (req, res) => {
    try {
        const data = getData();
        const courses = data.courses || [];
        
        res.render('adminCourses', {
            title: 'مدیریت دوره‌ها',
            layout: 'layouts/admin',
            currentPage: 'courses',
            courses: courses,
            course: null,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        res.redirect('/admin/courses?error=خطا در بارگذاری دوره‌ها');
    }
});

// Create new course
router.post('/create', upload.single('image'), (req, res) => {
    try {
        const { 
            title, category, instructor, teacher, price, duration, level,
            requirements, outcomes, targetAudience, overview, excerpt,
            sections, faqs
        } = req.body;
        const imageFile = req.file;
        
        if (!title || !category) {
            return res.redirect('/admin/courses/create?error=عنوان و دسته‌بندی الزامی هستند');
        }
        
        const data = getData();
        const courses = data.courses || [];
        
        // Parse array fields
        const requirementsArray = requirements ? requirements.split(',').map(r => r.trim()) : [];
        const outcomesArray = outcomes ? outcomes.split(',').map(o => o.trim()) : [];
        const targetAudienceArray = targetAudience ? targetAudience.split(',').map(t => t.trim()) : [];
        const overviewArray = overview ? overview.split(',').map(o => o.trim()) : [];
        
        // Parse FAQS
        let faqsArray = [];
        if (faqs) {
            try {
                faqsArray = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
            } catch (e) {
                faqsArray = [];
            }
        }
        
        // Parse sections
        let sectionsArray = [];
        if (sections) {
            try {
                sectionsArray = typeof sections === 'string' ? JSON.parse(sections) : sections;
            } catch (e) {
                sectionsArray = [];
            }
        }
        
        // Create new course
        const newCourse = {
            slug: generateSlug(title),
            title: title.trim(),
            category: category,
            instructor: instructor || 'گروه آموزشی',
            teacher: teacher || '',
            teacherImage: teacher ? '/assets/img/author_5.jpg' : '',
            image: imageFile ? `/assets/img/course/${imageFile.filename}` : '/assets/img/course/default.jpg',
            price: price || '0',
            duration: duration || 'نامشخص',
            level: level || 'همه سطوح',
            requirements: requirementsArray,
            outcomes: outcomesArray,
            targetAudience: targetAudienceArray,
            overview: overviewArray,
            faqs: faqsArray,
            sections: sectionsArray,
            excerpt: excerpt || ''
        };
        
        courses.push(newCourse);
        data.courses = courses;
        writeData(data);
        
        res.redirect('/admin/courses?success=دوره با موفقیت ایجاد شد');
        
    } catch (error) {
        console.error('Error creating course:', error);
        res.redirect('/admin/courses?error=خطا در ایجاد دوره');
    }
});

// Show edit course form
router.get('/edit/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const data = getData();
        const courses = data.courses || [];
        const course = courses.find(c => c.slug === slug);
        
        if (!course) {
            return res.redirect('/admin/courses?error=دوره یافت نشد');
        }
                
        res.render('adminCourses', {
            title: 'ویرایش دوره',
            layout: 'layouts/admin',
            currentPage: 'courses',
            courses: courses,
            course: course,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Error loading course for edit:', error);
        res.redirect('/admin/courses?error=خطا در بارگذاری دوره');
    }
});

// Update course
router.post('/edit/:slug', upload.single('image'), (req, res) => {
    try {
        const slug = req.params.slug;
        const { 
            title, category, instructor, teacher, price, duration, level,
            requirements, outcomes, targetAudience, overview, excerpt,
            sections, faqs
        } = req.body;
        const imageFile = req.file;
        
        const data = getData();
        const courses = data.courses || [];
        const courseIndex = courses.findIndex(c => c.slug === slug);
        
        if (courseIndex === -1) {
            return res.redirect('/admin/courses?error=دوره یافت نشد');
        }
        
        // Parse array fields
        const requirementsArray = requirements ? requirements.split(',').map(r => r.trim()) : [];
        const outcomesArray = outcomes ? outcomes.split(',').map(o => o.trim()) : [];
        const targetAudienceArray = targetAudience ? targetAudience.split(',').map(t => t.trim()) : [];
        const overviewArray = overview ? overview.split(',').map(o => o.trim()) : [];
        
        // Parse FAQS
        let faqsArray = [];
        if (faqs) {
            try {
                faqsArray = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
            } catch (e) {
                faqsArray = [];
            }
        }
        
        // Parse sections
        let sectionsArray = [];
        if (sections) {
            try {
                sectionsArray = typeof sections === 'string' ? JSON.parse(sections) : sections;
            } catch (e) {
                sectionsArray = [];
            }
        }
        
        // Update course
        const updatedCourse = {
            ...courses[courseIndex],
            slug: slug,
            title: title.trim() || courses[courseIndex].title,
            category: category || courses[courseIndex].category,
            instructor: instructor || courses[courseIndex].instructor,
            teacher: teacher || courses[courseIndex].teacher,
            teacherImage: teacher ? courses[courseIndex].teacherImage : '',
            price: price || courses[courseIndex].price,
            duration: duration || courses[courseIndex].duration,
            level: level || courses[courseIndex].level,
            requirements: requirementsArray.length ? requirementsArray : courses[courseIndex].requirements,
            outcomes: outcomesArray.length ? outcomesArray : courses[courseIndex].outcomes,
            targetAudience: targetAudienceArray.length ? targetAudienceArray : courses[courseIndex].targetAudience,
            overview: overviewArray.length ? overviewArray : courses[courseIndex].overview,
            faqs: faqsArray.length ? faqsArray : courses[courseIndex].faqs,
            sections: sectionsArray.length ? sectionsArray : courses[courseIndex].sections,
            excerpt: excerpt || courses[courseIndex].excerpt || ''
        };
        
        // Update image if new one uploaded
        if (imageFile) {
            if (courses[courseIndex].image && !courses[courseIndex].image.includes('default.jpg')) {
                const oldImagePath = path.join(__dirname, '../../public', courses[courseIndex].image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updatedCourse.image = `/assets/img/course/${imageFile.filename}`;
        }
        
        courses[courseIndex] = updatedCourse;
        data.courses = courses;
        writeData(data);
        
        res.redirect('/admin/courses?success=دوره با موفقیت ویرایش شد');
        
    } catch (error) {
        console.error('Error updating course:', error);
        res.redirect(`/admin/courses/edit/${slug}?error=خطا در ویرایش دوره`);
    }
});

// Delete course
router.get('/delete/:slug', (req, res) => {
    try {
        const slug = req.params.slug;
        const data = getData();
        const courses = data.courses || [];
        const courseIndex = courses.findIndex(c => c.slug === slug);
        
        if (courseIndex === -1) {
            return res.redirect('/admin/courses?error=دوره یافت نشد');
        }
        
        // Delete image if not default
        const course = courses[courseIndex];
        if (course.image && !course.image.includes('default.jpg')) {
            const imagePath = path.join(__dirname, '../../public', course.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        courses.splice(courseIndex, 1);
        data.courses = courses;
        writeData(data);
        
        res.redirect('/admin/courses?success=دوره با موفقیت حذف شد');
        
    } catch (error) {
        console.error('Error deleting course:', error);
        res.redirect('/admin/courses?error=خطا در حذف دوره');
    }
});

export default router;