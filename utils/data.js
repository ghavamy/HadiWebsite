const fs = require("fs");
const path = require("path");

// Helper function to load blog posts
function getData() {
    const data = fs.readFileSync(path.join(__dirname, '../data', 'data.json'), 'utf8');
    return JSON.parse(data);
}

module.exports = { getData };