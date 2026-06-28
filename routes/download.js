import { Router } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Download PDF
router.get('/pdf/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/assets/pdf', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        req.flash('error', 'فایل مورد نظر یافت نشد');
        return res.redirect('/');
    }
    
    // Download the file
    res.download(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            req.flash('error', 'خطا در دانلود فایل');
            res.redirect('/');
        }
    });
});

// Download with custom filename
router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/assets/pdf', filename);
    
    // Custom filename for download
    const customFilename = 'guide.pdf';
    
    res.download(filePath, customFilename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).send('خطا در دانلود فایل');
        }
    });
});

// Stream download (for large files)
router.get('/stream/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/assets/pdf', filename);
    
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});

export default router;