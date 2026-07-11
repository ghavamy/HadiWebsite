// routes/download.js
import { Router } from "express";
import { getDb } from "../database/database.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Get PDF exams from database
async function getPDFExams() {
    const db = await getDb();
    const exams = await db.all('SELECT * FROM pdf_exams ORDER BY year DESC, grade ASC');
    return exams;
}

// ✅ Count PDF files from database
async function countPDFFiles() {
    const db = await getDb();
    const result = await db.get('SELECT COUNT(*) as count FROM pdf_exams');
    return result ? result.count : 0;
}

// ✅ Group PDF exams by subject
async function getPDFExamsGrouped() {
    const exams = await getPDFExams();
    const grouped = {};
    
    exams.forEach(exam => {
        if (!grouped[exam.subject]) {
            grouped[exam.subject] = {};
        }
        if (!grouped[exam.subject][exam.grade]) {
            grouped[exam.subject][exam.grade] = [];
        }
        grouped[exam.subject][exam.grade].push(exam);
    });
    
    return grouped;
}

// Download PDF - Main route (✅ No changes needed here - still serves files)
router.get('/pdf/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../public/assets/pdf', filename);
        
        if (!fs.existsSync(filePath)) {
            req.flash('error', 'فایل مورد نظر یافت نشد');
            return res.redirect('/');
        }
        
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                req.flash('error', 'خطا در دانلود فایل');
                res.redirect('/');
            }
        });
        
    } catch (error) {
        console.error('Download error:', error);
        req.flash('error', 'خطا در دانلود فایل');
        res.redirect('/');
    }
});

// ✅ TestExams page - Get data from database
router.get('/testExams', async (req, res) => {
    try {
        const groupedExams = await getPDFExamsGrouped();
        const totalExams = await countPDFFiles();
        
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
        
        // Prepare data for view
        const examsData = {};
        subjects.forEach(subject => {
            examsData[subject] = {
                name: subjectNames[subject],
                icon: subjectIcons[subject],
                sections: []
            };
            
            if (groupedExams[subject]) {
                const grades = Object.keys(groupedExams[subject]);
                grades.forEach((grade, index) => {
                    const lessons = groupedExams[subject][grade].map((exam, examIndex) => ({
                        index: examIndex,
                        year: exam.year,
                        title: exam.title,
                        pdf: exam.pdf_path,
                        answer: exam.answer_path
                    }));
                    
                    examsData[subject].sections.push({
                        index: index,
                        title: grade,
                        description: 'آزمون',
                        lessons: lessons
                    });
                });
            }
        });
        
        res.render('testExams', {
            title: 'دانلود آزمون',
            courseCss: true,
            fontAwesome: true,
            subjects: subjects,
            examsData: examsData,
            subjectNames: subjectNames,
            fileCount: totalExams,
            pdfCounts: {}, // You can implement per-subject counts
            totalLessons: totalExams
        });
        
    } catch (error) {
        console.error('Test exams error:', error);
        res.render('testExams', {
            title: 'دانلود آزمون',
            courseCss: true,
            fontAwesome: true,
            subjects: [],
            examsData: {},
            subjectNames: {},
            fileCount: 0,
            pdfCounts: {},
            totalLessons: 0,
            error: 'خطا در بارگذاری آزمون‌ها'
        });
    }
});

export default router;