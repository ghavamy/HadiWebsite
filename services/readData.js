import { writeFileSync , readFileSync } from "fs";
import { fileURLToPath } from 'url';
import { join , dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFilePath = join(__dirname, '../data', 'data.json');

// Helper function to load blog posts
export function getData() {
    try {
        const data = readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        // Return empty structure if file doesn't exist
        throw error;
    }
}

// Helper function to save blog posts
export function writeData(newData) {
    try {
        writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        throw error;
    }
}

export function countPDFFiles(pdfCourse) {
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