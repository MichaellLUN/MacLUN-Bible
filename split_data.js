const fs = require('fs');
const path = require('path');

// 构造一个沙盒环境来读取 window.bibleDataLocales
const content = fs.readFileSync(path.join(__dirname, 'cuv.js'), 'utf8');
const sandbox = { window: {} };
require('vm').runInNewContext(content, sandbox);

const localesData = sandbox.window.bibleDataLocales;
if (!localesData) {
    console.error("Failed to load bibleDataLocales from cuv.js");
    process.exit(1);
}

const outputDir = path.join(__dirname, 'data', 'cuv');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const langs = Object.keys(localesData);
console.log('Available languages:', langs);

// 生成 catalog.json，只需一份即可
// 基于 zh-tw 的数据提取书卷目录以及每卷书对应的章节数量
const catalog = [];
// 实际上不同语言版本通常章节切割一致，我们使用 zh-cn 作为基准提取章节长度
const baseLang = 'zh-cn';
const baseData = localesData[baseLang] || localesData['zh-tw'];

if (baseData) {
    baseData.forEach((book, index) => {
        catalog.push({
            index: index,
            abbrev: book.abbrev,
            chaptersCount: book.chapters.length
        });
    });
    fs.writeFileSync(path.join(outputDir, 'catalog.json'), JSON.stringify(catalog));
    console.log('Generated catalog.json successfully.');
} else {
    console.error('Base language for catalog not found, cannot generate catalog.json');
}

// 切割 JSON 并保存
let fileCount = 0;
for (const lang of langs) {
    const langData = localesData[lang];
    if (!langData || !Array.isArray(langData) || langData.length === 0) {
        console.log(`Skipping empty language: ${lang}`);
        continue;
    }

    const langDir = path.join(outputDir, lang);
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
    }

    langData.forEach((book, index) => {
        const filePath = path.join(langDir, `${index}.json`);
        fs.writeFileSync(filePath, JSON.stringify(book)); // 可选不带缩排以最小化体积 JSON.stringify(book, null, 0)
        fileCount++;
    });
    console.log(`Generated splits for ${lang} (${langData.length} files)`);
}

console.log(`Successfully generated ${fileCount} split JSON files.`);
