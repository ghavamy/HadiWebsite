import { readFileSync } from "fs";
import { fileURLToPath } from 'url';
import { join , dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to load blog posts
export function getData() {
    const data = readFileSync(join(__dirname, '../data', 'data.json'), 'utf8');
    return JSON.parse(data);
}