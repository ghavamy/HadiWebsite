// routes/admin.js
import { Router } from "express";
import { getData, writeData } from "../services/readData.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/assets/pdf');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // ✅ We'll rename later in the route handler
        // Just use a temporary name for now
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('فایل باید PDF باشد'));
        }
    }
});

// Admin page
router.get('/', (req, res) => {
    const data = getData();
    const pdfCourse = data.pdfCourse;
    
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
        
        if (pdfCourse[subject]) {
            pdfCourse[subject].sections.forEach((section, sectionIndex) => {
                examsData[subject].sections.push({
                    index: sectionIndex,
                    title: section.title,
                    description: section.description,
                    lessons: section.lessons.map((lesson, lessonIndex) => ({
                        index: lessonIndex,
                        year: lesson.year,
                        title: lesson.title,
                        pdf: lesson.pdf,
                        answer: lesson.answer || null
                    }))
                });
            });
        }
    });
    
    res.render('admin', {
        title: 'مدیریت آزمون‌ها',
        layout: false,
        subjects: subjects,
        examsData: examsData,
        subjectNames: subjectNames,
        error: req.query.error || null,
        success: req.query.success || null
    });
});

// Add exam with file upload - RENAME files after upload
router.post('/add', upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'answerFile', maxCount: 1 }
]), (req, res) => {
    try {
        const { subject, grade, year, title } = req.body;
        const pdfFile = req.files['pdfFile'] ? req.files['pdfFile'][0] : null;
        const answerFile = req.files['answerFile'] ? req.files['answerFile'][0] : null;
        
        if (!subject || !grade || !year || !title || !pdfFile) {
            return res.redirect('/admin?error=لطفاً تمام فیلدهای الزامی را پر کنید');
        }
        
        // ✅ Create meaningful filenames
        const subjectMap = {
            experimental: 'تجربی',
            math: 'ریاضی',
            humanities: 'انسانی',
            language: 'زبان'
        };
        
        const subjectName = subjectMap[subject] || subject;
        const safeTitle = title.replace(/[\/\\:*?"<>|]/g, ''); // Remove invalid filename characters
        const safeGrade = grade.replace(/[\/\\:*?"<>|]/g, '');
        
        // ✅ Build new filenames
        const pdfNewName = `${safeTitle} - ${safeGrade} - ${subjectName} - سوال.pdf`;
        let answerNewName = null;
        
        if (answerFile) {
            answerNewName = `${safeTitle} - ${safeGrade} - ${subjectName} - پاسخ.pdf`;
        }
        
        // ✅ Rename the uploaded files
        const pdfOldPath = path.join(__dirname, '../public/assets/pdf', pdfFile.filename);
        const pdfNewPath = path.join(__dirname, '../public/assets/pdf', pdfNewName);
        
        // Rename PDF file
        if (fs.existsSync(pdfOldPath)) {
            fs.renameSync(pdfOldPath, pdfNewPath);
        }
        
        // Rename answer file if exists
        let answerPath = null;
        if (answerFile && answerNewName) {
            const answerOldPath = path.join(__dirname, '../public/assets/pdf', answerFile.filename);
            const answerNewPath = path.join(__dirname, '../public/assets/pdf', answerNewName);
            if (fs.existsSync(answerOldPath)) {
                fs.renameSync(answerOldPath, answerNewPath);
                answerPath = answerNewName;
            }
        }
        
        const data = getData();
        const pdfCourse = data.pdfCourse;
        
        if (!pdfCourse[subject]) {
            pdfCourse[subject] = { sections: [] };
        }
        
        let targetSection = pdfCourse[subject].sections.find(s => s.title === grade);
        
        if (!targetSection) {
            targetSection = {
                title: grade,
                description: 'قلم چی',
                lessons: []
            };
            pdfCourse[subject].sections.push(targetSection);
        }
        
        // ✅ Store the new meaningful names
        const newLesson = {
            year: parseInt(year),
            title: title,
            pdf: pdfNewName  // ✅ Now storing the meaningful name
        };
        
        if (answerPath) {
            newLesson.answer = answerPath;  // ✅ Now storing the meaningful name
        }
        
        targetSection.lessons.push(newLesson);
        writeData(data);
        
        res.redirect('/admin?success=آزمون با موفقیت اضافه شد');
        
    } catch (error) {
        console.error(error);
        res.redirect('/admin?error=خطا در افزودن آزمون');
    }
});

// Delete exam
router.get('/delete/:subject/:sectionIndex/:lessonIndex', (req, res) => {
    try {
        const { subject, sectionIndex, lessonIndex } = req.params;
        
        const data = getData();
        const pdfCourse = data.pdfCourse;
        
        if (pdfCourse[subject] && pdfCourse[subject].sections[sectionIndex]) {
            const section = pdfCourse[subject].sections[sectionIndex];
            const lesson = section.lessons[lessonIndex];
            
            // Delete the actual files from disk
            if (lesson.pdf) {
                const pdfPath = path.join(__dirname, '../public/assets/pdf', lesson.pdf);
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
            if (lesson.answer) {
                const answerPath = path.join(__dirname, '../public/assets/pdf', lesson.answer);
                if (fs.existsSync(answerPath)) {
                    fs.unlinkSync(answerPath);
                }
            }
            
            section.lessons.splice(parseInt(lessonIndex), 1);
            
            // if (section.lessons.length === 0) {
            //     pdfCourse[subject].sections.splice(parseInt(sectionIndex), 1);
            // }
            
            writeData(data);
            res.redirect('/admin?success=آزمون با موفقیت حذف شد');
        } else {
            res.redirect('/admin?error=آزمون یافت نشد');
        }
        
    } catch (error) {
        console.error(error);
        res.redirect('/admin?error=خطا در حذف آزمون');
    }
});

// Delete entire section
router.get('/delete-section/:subject/:sectionIndex', (req, res) => {
    try {
        const { subject, sectionIndex } = req.params;
        
        const data = getData();
        const pdfCourse = data.pdfCourse;
        
        if (pdfCourse[subject] && pdfCourse[subject].sections[sectionIndex]) {
            const section = pdfCourse[subject].sections[sectionIndex];
            
            // Delete all files in the section
            section.lessons.forEach(lesson => {
                if (lesson.pdf) {
                    const pdfPath = path.join(__dirname, '../public/assets/pdf', lesson.pdf);
                    if (fs.existsSync(pdfPath)) {
                        fs.unlinkSync(pdfPath);
                    }
                }
                if (lesson.answer) {
                    const answerPath = path.join(__dirname, '../public/assets/pdf', lesson.answer);
                    if (fs.existsSync(answerPath)) {
                        fs.unlinkSync(answerPath);
                    }
                }
            });
            
            pdfCourse[subject].sections.splice(parseInt(sectionIndex), 1);
            writeData(data);
            res.redirect('/admin?success=بخش با موفقیت حذف شد');
        } else {
            res.redirect('/admin?error=بخش یافت نشد');
        }
        
    } catch (error) {
        console.error(error);
        res.redirect('/admin?error=خطا در حذف بخش');
    }
});

export default router;