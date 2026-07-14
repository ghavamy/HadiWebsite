// routes/admin.js
import { Router } from "express";
import { getDb } from "../../database/database.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, '../../public/assets/pdf');


// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('فایل باید PDF باشد'));
        }
    }
});

// Helper function to create safe filename
function createSafeFilename(examType, title, grade, subject, type) {
    const maxTitleLength = 50;
    let safeTitle = title.replace(/[\/\\:*?"<>|]/g, '');
    if (safeTitle.length > maxTitleLength) {
        safeTitle = safeTitle.substring(0, maxTitleLength);
    }
    const safeGrade = grade.replace(/[\/\\:*?"<>|]/g, '');
    const subjectMap = {
        experimental: 'تجربی',
        math: 'ریاضی',
        humanities: 'انسانی',
        language: 'زبان'
    };
    const subjectName = subjectMap[subject] || subject;
    return `${examType} - ${safeTitle} - ${safeGrade} - ${subjectName} - ${type}.pdf`;
}

router.get('/', (req, res) => {
    res.redirect('/admin/exams');
});

// Admin page - ✅ Read from database
router.get('/exams', async (req, res) => {
    try {
        const db = await getDb();
        const exams = await db.all('SELECT * FROM pdf_exams ORDER BY year DESC, grade ASC');
        const examsCount = await db.all('SELECT COUNT(*) as count FROM pdf_exams');
        
        const subjects = ['experimental', 'math', 'humanities', 'language'];
        const subjectNames = {
            experimental: 'تجربی',
            math: 'ریاضی',
            humanities: 'انسانی',
            language: 'زبان'
        };
        const subjectIcons = {
            experimental: 'fa-flask',
            math: 'fa-square-root-variable',
            humanities: 'fa-book-open',
            language: 'fa-language'
        };
        
        const examsData = {};
        subjects.forEach(subject => {
            examsData[subject] = {
                name: subjectNames[subject],
                icon: subjectIcons[subject],
                sections: []
            };
        });
        
        // Group exams by subject and grade
        exams.forEach(exam => {
            if (!examsData[exam.subject]) return;
            
            let section = examsData[exam.subject].sections.find(s => s.title === exam.grade);
            if (!section) {
                section = {
                    title: exam.grade,
                    description: 'آزمون',
                    lessons: []
                };
                examsData[exam.subject].sections.push(section);
            }
            
            section.lessons.push({
                id: exam.id,
                year: exam.year,
                title: exam.title,
                pdf: exam.pdf_path,
                answer: exam.answer_path,
                type: exam.type || 'قلم چی'  // ✅ Added type
            });
        });
        
        // Add indexes for delete routes
        subjects.forEach(subject => {
            examsData[subject].sections.forEach((section, sectionIndex) => {
                section.index = sectionIndex;
                section.lessons.forEach((lesson, lessonIndex) => {
                    lesson.index = lessonIndex;
                });
            });
        });
        
        res.render('adminExams', {
            title: 'مدیریت آزمون‌ها',
            layout: 'layouts/admin',
            currentPage: 'exams',
            fileCount: examsCount.count,
            subjects: subjects,
            examsData: examsData,
            subjectNames: subjectNames,
            error: req.query.error || null,
            success: req.query.success || null
        });
        
    } catch (error) {
        console.error('Admin page error:', error);
        res.redirect('/admin/exams?error=خطا در بارگذاری صفحه');
    }
});

// Add exam - ✅ Save to database with type
router.post('/add/exam', upload.fields([
        { name: 'pdfFile', maxCount: 1 },
        { name: 'answerFile', maxCount: 1 }
    ]), async (req, res) => {
    try {
        // ✅ Added type to destructuring
        const { type, subject, grade, year, title } = req.body;
        const pdfFile = req.files['pdfFile'] ? req.files['pdfFile'][0] : null;
        const answerFile = req.files['answerFile'] ? req.files['answerFile'][0] : null;
        
        if (!type || !subject || !grade || !year || !title || !pdfFile) {
            return res.redirect('/admin/exams?error=لطفاً تمام فیلدهای الزامی را پر کنید');
        }
        
        // Create meaningful filenames
        const pdfNewName = createSafeFilename(type, title, grade, subject, 'سوال');
        const pdfOldPath = path.join(uploadPath, pdfFile.filename);
        const pdfNewPath = path.join(uploadPath, pdfNewName);
        
        // Rename PDF file
        if (fs.existsSync(pdfOldPath)) {
            fs.renameSync(pdfOldPath, pdfNewPath);
        } else {
            return res.redirect('/admin/exams?error=خطا در آپلود فایل');
        }
        
        let answerNewName = null;
        if (answerFile) {
            answerNewName = createSafeFilename(type, title, grade, subject, 'پاسخ');
            const answerOldPath = path.join(uploadPath, answerFile.filename);
            const answerNewPath = path.join(uploadPath, answerNewName);
            if (fs.existsSync(answerOldPath)) {
                fs.renameSync(answerOldPath, answerNewPath);
            }
        }
        
        // ✅ Save to database with type
        const db = await getDb();
        await db.run(
            `INSERT INTO pdf_exams (type, subject, grade, year, title, pdf_path, answer_path) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, subject, grade, parseInt(year), title, pdfNewName, answerNewName]
        );
        
        res.redirect('/admin/exams?success=آزمون با موفقیت اضافه شد');
        
    } catch (error) {
        console.error('Add exam error:', error);
        res.redirect('/admin/exams?error=خطا در افزودن آزمون');
    }
});

// Delete exam - ✅ Delete from database
router.get('/delete/exam/:id', async (req, res) => {
    try {
        const examId = parseInt(req.params.id);
        const db = await getDb();
        
        // Get exam info first to delete files
        const exam = await db.get('SELECT * FROM pdf_exams WHERE id = ?', examId);
        
        if (!exam) {
            return res.redirect('/admin/exams?error=آزمون یافت نشد');
        }
        
        // Delete PDF files from disk
        if (exam.pdf_path) {
            const pdfPath = path.join(uploadPath, exam.pdf_path);
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        }
        if (exam.answer_path) {
            const answerPath = path.join(uploadPath, exam.answer_path);
            if (fs.existsSync(answerPath)) {
                fs.unlinkSync(answerPath);
            }
        }
        
        // ✅ Delete from database
        await db.run('DELETE FROM pdf_exams WHERE id = ?', examId);
        
        res.redirect('/admin/exams?success=آزمون با موفقیت حذف شد');
        
    } catch (error) {
        console.error('Delete exam error:', error);
        res.redirect('/admin/exams?error=خطا در حذف آزمون');
    }
});

// Delete entire section - ✅ Delete multiple exams
router.get('/delete-section/:subject/:grade', async (req, res) => {
    try {
        const { subject, grade } = req.params;
        const db = await getDb();
        
        // Get all exams in this section
        const exams = await db.all(
            'SELECT * FROM pdf_exams WHERE subject = ? AND grade = ?',
            [subject, grade]
        );
        
        // Delete all files
        exams.forEach(exam => {
            if (exam.pdf_path) {
                const pdfPath = path.join(uploadPath, exam.pdf_path);
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
            if (exam.answer_path) {
                const answerPath = path.join(uploadPath, exam.answer_path);
                if (fs.existsSync(answerPath)) {
                    fs.unlinkSync(answerPath);
                }
            }
        });
        
        // ✅ Delete from database
        await db.run(
            'DELETE FROM pdf_exams WHERE subject = ? AND grade = ?',
            [subject, grade]
        );
        
        res.redirect('/admin/exams?success=بخش با موفقیت حذف شد');
        
    } catch (error) {
        console.error('Delete section error:', error);
        res.redirect('/admin/exams?error=خطا در حذف بخش');
    }
});

export default router;