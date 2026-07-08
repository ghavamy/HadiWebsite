// routes/download.js
import { Router } from "express";
import { getData } from "../services/readData.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function countPDFFiles(pdfCourse) {
    let count = 0;
    const subjects = ['experimental', 'math', 'humanities', 'language'];
    
    subjects.forEach(subject => {
        if (pdfCourse[subject] && pdfCourse[subject].sections) {
            pdfCourse[subject].sections.forEach(section => {
                if (section.lessons) {
                    section.lessons.forEach(lesson => {
                        if (lesson.pdf) {
                            count++;
                        }
                    });
                }
            });
        }
    });
    
    return count;
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
        
        // Express built-in download method
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

router.get('/testExams', (req, res) => {
    const data = getData();
    const pdfCourse = data.pdfCourse;
    res.render('testExams', {
        title: 'دانلود آزمون',
        courseCss: true,
        fontAwesome: true,
        pdfCourse: pdfCourse,
        fileCount: countPDFFiles(pdfCourse)
    });
});

export default router;