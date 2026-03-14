const fs = require('fs');
const path = require('path');

const outputDir = path.join('d:/Code/bible', 'data', 'cuv');
const langs = ['zh-cn', 'zh-tw', 'ko', 'en'];

// 1. Rewrite catalog.json to catalog.js
const cat = fs.readFileSync(path.join(outputDir, 'catalog.json'), 'utf8');
fs.writeFileSync(path.join(outputDir, 'catalog.js'), `window.bibleCatalog = ${cat};`, 'utf8');

// 2. Rewrite chunked json files to chunked js files
for (const lang of langs) {
    const langDir = path.join(outputDir, lang);
    if (!fs.existsSync(langDir)) continue;

    for (let i = 0; i < 66; i++) {
        const jsonPath = path.join(langDir, `${i}.json`);
        const jsPath = path.join(langDir, `${i}.js`);
        if (fs.existsSync(jsonPath)) {
            const data = fs.readFileSync(jsonPath, 'utf8');
            // Assign to a global variable dynamically based on lang and index
            fs.writeFileSync(jsPath, `window.__bibleDataCb('${lang}', ${i}, ${data});`, 'utf8');
        }
    }
}
console.log('Successfully converted JSON to JS for local file protocol support');
