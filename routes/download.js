// routes/download.js
import { Router } from "express";
import { getDb } from "../database/database.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Get PDF exams from database (with optional type filter)
async function getPDFExams(type = null) {
    const db = await getDb();
    let query = 'SELECT * FROM pdf_exams ORDER BY year DESC, grade ASC';
    const params = [];
    
    if (type) {
        query = 'SELECT * FROM pdf_exams WHERE type = ? ORDER BY year DESC, grade ASC';
        params.push(type);
    }
    
    const exams = await db.all(query, params);
    return exams;
}

// ✅ Count PDF files from database (with optional type filter)
async function countPDFFiles(type = null) {
    const db = await getDb();
    let query = 'SELECT COUNT(*) as count FROM pdf_exams';
    const params = [];
    
    if (type) {
        query = 'SELECT COUNT(*) as count FROM pdf_exams WHERE type = ?';
        params.push(type);
    }
    
    const result = await db.get(query, params);
    return result ? result.count : 0;
}

// ✅ Get counts per type
async function getTypeCounts() {
    const db = await getDb();
    const result = await db.all('SELECT type, COUNT(*) as count FROM pdf_exams GROUP BY type');
    const counts = {
        'ماز': 0,
        'قلم چی': 0
    };
    
    result.forEach(row => {
        const type = row.type || 'قلم چی';
        if (counts[type] !== undefined) {
            counts[type] = row.count;
        }
    });
    
    return counts;
}

// ✅ Group PDF exams by subject (with optional type filter)
async function getPDFExamsGrouped(type = null) {
    const exams = await getPDFExams(type);
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

// Download PDF - Main route
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

// ✅ TestExams page - Get data from database with type filtering
router.get('/testExams', async (req, res) => {
    try {
        // Get type from query parameter (default to 'قلم چی')
        const type = req.query.type || 'قلم چی';
        
        // Get data filtered by type
        const groupedExams = await getPDFExamsGrouped(type);
        const totalExams = await countPDFFiles(type);
        const typeCounts = await getTypeCounts();
        
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
                        answer: exam.answer_path,
                        type: exam.type || 'قلم چی'
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
            totalLessons: totalExams,
            currentType: type,  // ✅ Pass current type to view
            typeCounts: typeCounts  // ✅ Pass type counts to view
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
            currentType: 'قلم چی',
            typeCounts: { 'ماز': 0, 'قلم چی': 0 },
            error: 'خطا در بارگذاری آزمون‌ها'
        });
    }
});

export default router;