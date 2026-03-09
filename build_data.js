const fetch = require('node-fetch');
const fs = require('fs');
const OpenCC = require('opencc-js');

const sources = {
    // 简体中文 (和合本 CUVS - 找不到直接叫 cuvs 的，我用另一个仓库的 cmn-hans)
    'zh-cn': 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/zh_ncv.json', // 暂时用新译本代替，一会儿再找精准的和合本简体
    // 繁体中文 (和合本 CUV)
    'zh-tw': 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/zh_cuv.json',
    // 英文 (KJV)
    'en': 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json',
    // 韩文
    'ko': 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json',
    // 日文 (口語訳) - 找遍了 GitHub，尝试一个可用的：
    'ja': 'https://raw.githubusercontent.com/ajsonbible/JC/master/JC.json'
};

const finalData = {};

async function fetchWithBOMStrip(url) {
    try {
        console.log(`Fetching from ${url}...`);
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`HTTP Error: ${res.status} for ${url}`);
            return null;
        }
        let text = await res.text();

        // Remove UTF-8 Byte Order Mark (BOM) if present
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        let data = JSON.parse(text);

        // 正则清洗数据：清空半角/全角圆括号及其中的一切内容
        const reg = /[\(（][^\)）]*[\)）]/g;

        const cleanVerses = (books) => {
            books.forEach(b => {
                b.chapters.forEach(c => {
                    for (let i = 0; i < c.length; i++) {
                        if (typeof c[i] === 'string') {
                            c[i] = c[i].replace(reg, '');
                        }
                    }
                });
            });
        };

        cleanVerses(data);

        return data;
    } catch (err) {
        console.error(`Failed to fetch/parse ${url}: ${err.message}`);
        return null;
    }
}

async function main() {
    // 强制使用纯净繁体版 zh-tw
    const cuvData = await fetchWithBOMStrip(sources['zh-tw']);
    if (cuvData) {

        // 先删括号内容，再删所有空白符(\s包括全角半角空格)
        const reg = /[\(（][^\)）]*[\)）]/g;
        cuvData.forEach(b => {
            b.chapters.forEach(c => {
                for (let i = 0; i < c.length; i++) {
                    if (typeof c[i] === 'string') {
                        let t = c[i].replace(reg, '');
                        c[i] = t.replace(/\s+/g, ''); // 去空格
                    }
                }
            });
        });

        finalData['zh-tw'] = cuvData;
        console.log(`Loaded and cleaned zh-tw successfully`);

        // 使用 OpenCC-JS 转换出 100% 繁变简的 'zh-cn'
        console.log(`Converting zh-tw to zh-cn via opencc-js...`);
        const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

        // 深拷贝一份
        const zhCnData = JSON.parse(JSON.stringify(cuvData));
        zhCnData.forEach(b => {
            b.chapters.forEach(c => {
                for (let i = 0; i < c.length; i++) {
                    if (typeof c[i] === 'string') {
                        c[i] = converter(c[i]);
                    }
                }
            });
        });
        finalData['zh-cn'] = zhCnData;
        console.log(`Generated pure zh-cn successfully`);
    }

    // 下载其他门语言
    const enData = await fetchWithBOMStrip(sources['en']);
    if (enData) finalData['en'] = enData;

    const koData = await fetchWithBOMStrip(sources['ko']);
    if (koData) finalData['ko'] = koData;

    if (!finalData['ja']) {
        // fallback placeholder for ja to prevent crashes
        finalData['ja'] = [];
        console.warn('Japanese missing, setting empty array');
    }

    const content = `window.bibleDataLocales = ${JSON.stringify(finalData)};\nwindow.bibleData = window.bibleDataLocales['zh-cn'];`;

    fs.writeFileSync('cuv.js', content, 'utf8');
    console.log('🎉 Wrote combined languages to cuv.js');
}

main();
