const fs = require('fs');
const appJsPath = 'd:/Code/bible/app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

// 1. 修改 state 结构
content = content.replace(
    /bibleData: null,          \/\/ 当前默认主数据 \(zh-cn\)/,
    `catalog: null,            // 书卷目录
    bookCache: {},            // 缓存的各个语言的书卷数据 bookCache['zh-cn'][0] = ...`
);

// 2. 修改 loadBibleData
content = content.replace(
    /async function loadBibleData\(\) \{[\s\S]*?\}\s*\n/m,
    `async function loadBibleData() {
    els.versesContainer.innerHTML = '<div class="loading-state"><i class="ri-loader-4-line ri-spin"></i> &nbsp; 正在加载目录...</div>';
    try {
        const res = await fetch('data/cuv/catalog.json');
        if (!res.ok) throw new Error('网络请求失败');
        state.catalog = await res.json();
    } catch (err) {
        throw new Error('无法加载目录数据: ' + err.message);
    }
}

// 工具：获取指定语言的书卷数据
async function fetchBookData(lang, bookIndex) {
    if (!state.bookCache[lang]) state.bookCache[lang] = {};
    if (state.bookCache[lang][bookIndex]) return state.bookCache[lang][bookIndex];
    
    try {
        const res = await fetch(\`data/cuv/\${lang}/\${bookIndex}.json\`);
        if (!res.ok) return null;
        const data = await res.json();
        state.bookCache[lang][bookIndex] = data;
        return data;
    } catch (e) {
        console.error(\`Failed to fetch \${lang} book \${bookIndex}\`, e);
        return null;
    }
}

`
);

// 3. 修改 renderBookList
content = content.replace(
    /if \(\!Array\.isArray\(state\.bibleData\)\) return;/,
    `if (!Array.isArray(state.catalog)) return;`
);

// 4. 修改 showChapters
content = content.replace(
    /const book = state\.bibleData\[bookIndex\];\s*if \(\!book\) return;/,
    `const bookMeta = state.catalog[bookIndex];\n    if (!bookMeta) return;`
);

content = content.replace(
    /const chapterCount = book\.chapters\.length;/,
    `const chapterCount = bookMeta.chaptersCount;`
);

content = content.replace(
    /showVersesInSidebar\(bIdx, cIdx\);/,
    `// 节列表会在加载详情后渲染\n            // showVersesInSidebar(bIdx, cIdx);`
);

// 5. 修改 showVersesInSidebar
content = content.replace(
    /function showVersesInSidebar\(bookIndex, chapterIndex\) \{[\s\S]*?const verseCount = book\.chapters\[chapterIndex\]\.length;/m,
    `function showVersesInSidebar(bookIndex, chapterIndex, verseCount) {
    els.currentChapterNameNav.textContent = \`当前所在：\${ALL_BOOKS[bookIndex]} \${chapterIndex + 1}章 (请选节)\`;
    if (els.verseSectionSidebar) els.verseSectionSidebar.classList.remove('hidden');`
);

// 6. 修改 loadChapter 逻辑
content = content.replace(
    /function loadChapter\(bookIndex, chapterIndex\) \{[\s\S]*?let html = `<div class="reader-header"><h1>\$\{bookName\} \$\{chapterIndex \+ 1\}<\/h1><\/div>`;[\s\S]*?for/m,
    `async function loadChapter(bookIndex, chapterIndex) {
    if (!state.catalog) return;

    state.currentBookIndex = bookIndex;
    state.currentChapterIndex = chapterIndex;

    const bookMeta = state.catalog[bookIndex];
    if (!bookMeta || chapterIndex < 0 || chapterIndex >= bookMeta.chaptersCount) return;

    els.versesContainer.innerHTML = '<div class="loading-state"><i class="ri-loader-4-line ri-spin"></i> &nbsp; 加载中...</div>';

    const promises = state.selectedLangs.map(lang => fetchBookData(lang, bookIndex));
    const booksData = await Promise.all(promises);

    let chapterLength = 0;
    for (let bd of booksData) {
        if (bd && bd.chapters && bd.chapters[chapterIndex]) {
            chapterLength = Math.max(chapterLength, bd.chapters[chapterIndex].length);
        }
    }

    if (chapterLength === 0) {
        els.versesContainer.innerHTML = '<div class="loading-state">本章数据加载失败或为空。</div>';
        return;
    }

    const bookName = ALL_BOOKS[bookIndex];
    els.currentBookTitle.textContent = \`\${bookName}第\${chapterIndex + 1}章\`;

    let html = \`<div class="reader-header"><h1>\${bookName} \${chapterIndex + 1}</h1></div>\`;

    for`
);

content = content.replace(
    /state\.selectedLangs\.forEach\(langCode => \{[\s\S]*?const db = window\.bibleDataLocales && window\.bibleDataLocales\[langCode\];[\s\S]*?let verseText = "";/m,
    `state.selectedLangs.forEach((langCode, index) => {
            const db = booksData[index];
            if (!db || !db.chapters || !db.chapters[chapterIndex]) return;
            let verseText = "";`
);

content = content.replace(
    /verseText = db\[bookIndex\]\.chapters\[chapterIndex\]\[vIndex\];/m,
    `verseText = db.chapters[chapterIndex][vIndex];`
);

content = content.replace(
    /updateSidebarActiveState\(\);\s*\}/m,
    `updateSidebarActiveState();

    if (!els.chaptersContainer.classList.contains('hidden') && els.verseSectionSidebar) {
        showVersesInSidebar(bookIndex, chapterIndex, chapterLength);
    }
}`
);

// 7. 修改 updateBottomNav
content = content.replace(
    /const isLastBook = state\.currentBookIndex === state\.bibleData\.length - 1;\s*const isLastChapter = state\.currentChapterIndex === state\.bibleData\[state\.currentBookIndex\]\.chapters\.length - 1;/m,
    `const isLastBook = state.currentBookIndex === state.catalog.length - 1;
    const isLastChapter = state.currentChapterIndex === state.catalog[state.currentBookIndex].chaptersCount - 1;`
);

// 8. 修改 navigateChapter
content = content.replace(
    /state\.bibleData\[nextBIdx\]\.chapters\.length/g,
    `state.catalog[nextBIdx].chaptersCount`
);

content = content.replace(
    /state\.bibleData\.length/g,
    `state.catalog.length`
);

// 9. 修改 performSearch
content = content.replace(
    /const searchDB = window\.bibleDataLocales && window\.bibleDataLocales\[state\.selectedLangs\[0\]\]\s*\? window\.bibleDataLocales\[state\.selectedLangs\[0\]\]\s*: state\.bibleData;\s*for \(let b = 0; b < searchDB\.length; b\+\) \{/m,
    `const lang = state.selectedLangs[0];
        const searchDB = state.bookCache[lang] || {};

        for (const [bStr, book] of Object.entries(searchDB)) {
            const b = parseInt(bStr);
            if (!book || !book.chapters) continue;`
);

// Fix regex escaping
content = content.replace(
    /if \(results\.length === 0\) \{\s*els\.searchResults\.innerHTML = '<div style="padding: 1rem; color: var\(--text-tertiary\); text-align: center;">未找到相关经文<\/div>';\s*return;\s*\}/,
    `if (results.length === 0) {
        els.searchResults.innerHTML = '<div style="padding: 1rem; color: var(--text-tertiary); text-align: center;">未在已加载内容中找到该词<br><small>(注: 目前搜索仅检索已打开过的书卷)</small></div>';
        return;
    }`
);

content = content.replace(
    /els\.searchResults\.innerHTML = '<div class="loading-state" style="font-size: 0\.9rem;">搜索中\.\.\.<\/div>';/m,
    `els.searchResults.innerHTML = '<div class="loading-state" style="font-size: 0.9rem;">搜索中(仅限已加载书卷)...</div>';`
);

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('App.js modified successfully with script!');
