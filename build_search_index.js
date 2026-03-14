const fs = require('fs');
const path = require('path');

const cuvJsPath = path.join('d:/Code/bible', 'data', 'cuv', 'zh-cn');
const catalogPath = path.join('d:/Code/bible', 'data', 'cuv', 'catalog.json');
const outputPath = path.join('d:/Code/bible', 'data', 'cuv', 'search_index.js');

try {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const allBooks = [];

    // Read all chinese books to create a monolithic search index
    for (let i = 0; i < 66; i++) {
        const bookPath = path.join(cuvJsPath, `${i}.json`);
        if (fs.existsSync(bookPath)) {
            const data = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
            allBooks.push(data);
        }
    }

    // Create a minified search index array that matches state.bibleData structure for backward compatibility
    const minifiedJson = JSON.stringify(allBooks);
    fs.writeFileSync(outputPath, `window.__bibleSearchIndex = ${minifiedJson};`, 'utf8');

    console.log(`Search index generated successfully at: ${outputPath} Size: ${(minifiedJson.length / 1024 / 1024).toFixed(2)}MB`);
} catch (e) {
    console.error('Failed to generate search index:', e);
}
