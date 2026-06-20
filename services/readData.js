import { readFileSync } from "fs";
import { fileURLToPath } from 'url';
import { join , dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const data = readFileSync(join(__dirname, '../data', 'data.json'), 'utf8');

// Helper function to load blog posts
export function getData() {
    return JSON.parse(data);
}