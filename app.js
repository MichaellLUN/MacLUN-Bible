
// DOM 元素引用
const els = {
    // 侧边栏与导航
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    bookListOT: document.getElementById('bookListOT'),
    bookListNT: document.getElementById('bookListNT'),
    booksContainer: document.querySelector('.books-container'),
    chaptersContainer: document.getElementById('chaptersContainer'),
    chapterGrid: document.getElementById('chapterGrid'),
    backToBooksBtn: document.getElementById('backToBooksBtn'),
    currentBookNameNav: document.getElementById('currentBookNameNav'),

    // 节导航栏
    verseSectionSidebar: document.getElementById('verseSectionSidebar'),
    currentChapterNameNav: document.getElementById('currentChapterNameNav'),
    verseGrid: document.getElementById('verseGrid'),

    // 头部工具
    currentBookTitle: document.getElementById('currentBookTitle'),
    searchBtn: document.getElementById('searchBtn'),
    fontSizeBtn: document.getElementById('fontSizeBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // 面板
    searchPanel: document.getElementById('searchPanel'),
    closeSearchBtn: document.getElementById('closeSearchBtn'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    fontPanel: document.getElementById('fontPanel'),
    fontSizeRange: document.getElementById('fontSizeRange'),

    // 内容区
    readerContent: document.getElementById('readerContent'),
    versesContainer: document.getElementById('versesContainer'),

    // 底部导航
    bottomNav: document.getElementById('bottomNav'),
    prevChapterBtn: document.getElementById('prevChapterBtn'),
    nextChapterBtn: document.getElementById('nextChapterBtn'),
    navInfo: document.getElementById('navInfo'),

    // 提示
    toast: document.getElementById('toast')
};

// 全局状态
const state = {
    catalog: null,            // 书卷目录
    bookCache: {},            // 缓存的各个语言的书卷数据 bookCache['zh-cn'][0] = ...
    currentBookIndex: 0,
    currentChapterIndex: 0,
    searchDebounceTimer: null,
    theme: localStorage.getItem('theme') || 'light',
    fontSize: localStorage.getItem('fontSize') || '18',
    // 第二个语言
    selectedLangs: JSON.parse(localStorage.getItem('selectedLangs')) || ['zh-cn']
};

// 书卷分类与缩写硬编码地图
const BOOKS_META = [
    // 摩西五经 - law
    { name: "创世记", abbr: "创", cat: "law", catName: "摩西五经" },
    { name: "出埃及记", abbr: "出", cat: "law" },
    { name: "利未记", abbr: "利", cat: "law" },
    { name: "民数记", abbr: "民", cat: "law" },
    { name: "申命记", abbr: "申", cat: "law" },
    // 历史书 - history
    { name: "约书亚记", abbr: "书", cat: "history", catName: "历史书" },
    { name: "士师记", abbr: "士", cat: "history" },
    { name: "路得记", abbr: "得", cat: "history" },
    { name: "撒母耳记上", abbr: "撒上", cat: "history" },
    { name: "撒母耳记下", abbr: "撒下", cat: "history" },
    { name: "列王纪上", abbr: "王上", cat: "history" },
    { name: "列王纪下", abbr: "王下", cat: "history" },
    { name: "历代志上", abbr: "代上", cat: "history" },
    { name: "历代志下", abbr: "代下", cat: "history" },
    { name: "以斯拉记", abbr: "拉", cat: "history" },
    { name: "尼希米记", abbr: "尼", cat: "history" },
    { name: "以斯帖记", abbr: "斯", cat: "history" },
    // 诗歌智慧书 - poetry
    { name: "约伯记", abbr: "伯", cat: "poetry", catName: "诗歌智慧书" },
    { name: "诗篇", abbr: "诗", cat: "poetry" },
    { name: "箴言", abbr: "箴", cat: "poetry" },
    { name: "传道书", abbr: "传", cat: "poetry" },
    { name: "雅歌", abbr: "歌", cat: "poetry" },
    // 大先知书 - major
    { name: "以赛亚书", abbr: "赛", cat: "major", catName: "大先知书" },
    { name: "耶利米书", abbr: "耶", cat: "major" },
    { name: "耶利米哀歌", abbr: "哀", cat: "major" },
    { name: "以西结书", abbr: "结", cat: "major" },
    { name: "但以理书", abbr: "但", cat: "major" },
    // 小先知书 - minor
    { name: "何西阿书", abbr: "何", cat: "minor", catName: "小先知书" },
    { name: "约珥书", abbr: "珥", cat: "minor" },
    { name: "阿摩司书", abbr: "摩", cat: "minor" },
    { name: "俄巴底亚书", abbr: "俄", cat: "minor" },
    { name: "约拿书", abbr: "拿", cat: "minor" },
    { name: "弥迦书", abbr: "弥", cat: "minor" },
    { name: "那鸿书", abbr: "鸿", cat: "minor" },
    { name: "哈巴谷书", abbr: "哈", cat: "minor" },
    { name: "西番雅书", abbr: "番", cat: "minor" },
    { name: "哈该书", abbr: "该", cat: "minor" },
    { name: "撒迦利亚书", abbr: "亚", cat: "minor" },
    { name: "玛拉基书", abbr: "玛", cat: "minor" },
    // --------- 新约 ---------
    // 四福音 - gospel
    { name: "马太福音", abbr: "太", cat: "gospel", catName: "四福音书" },
    { name: "马可福音", abbr: "可", cat: "gospel" },
    { name: "路加福音", abbr: "路", cat: "gospel" },
    { name: "约翰福音", abbr: "约", cat: "gospel" },
    // 历史 - acts
    { name: "使徒行传", abbr: "徒", cat: "acts", catName: "教会历史" },
    // 保罗书信 - paul
    { name: "罗马书", abbr: "罗", cat: "paul", catName: "保罗书信" },
    { name: "哥林多前书", abbr: "林前", cat: "paul" },
    { name: "哥林多后书", abbr: "林后", cat: "paul" },
    { name: "加拉太书", abbr: "加", cat: "paul" },
    { name: "以弗所书", abbr: "弗", cat: "paul" },
    { name: "腓立比书", abbr: "腓", cat: "paul" },
    { name: "歌罗西书", abbr: "西", cat: "paul" },
    { name: "帖撒罗尼迦前书", abbr: "帖前", cat: "paul" },
    { name: "帖撒罗尼迦后书", abbr: "帖后", cat: "paul" },
    { name: "提摩太前书", abbr: "提前", cat: "paul" },
    { name: "提摩太后书", abbr: "提后", cat: "paul" },
    { name: "提多书", abbr: "多", cat: "paul" },
    { name: "腓利门书", abbr: "门", cat: "paul" },
    // 其他书信 - epistle
    { name: "希伯来书", abbr: "来", cat: "epistle", catName: "其他书信" },
    { name: "雅各书", abbr: "雅", cat: "epistle" },
    { name: "彼得前书", abbr: "彼前", cat: "epistle" },
    { name: "彼得后书", abbr: "彼后", cat: "epistle" },
    { name: "约翰一书", abbr: "约一", cat: "epistle" },
    { name: "约翰二书", abbr: "约二", cat: "epistle" },
    { name: "约翰三书", abbr: "约三", cat: "epistle" },
    { name: "犹大书", abbr: "犹", cat: "epistle" },
    // 启示录 - revelation
    { name: "启示录", abbr: "启", cat: "revelation", catName: "启示文学" }
];

const ALL_BOOKS = BOOKS_META.map(b => b.name);

// 核心初始化
async function init() {
    initTheme();
    initFontSize();
    initLanguageSelector();
    bindEvents();

    try {
        await loadBibleData();
        renderBookList();
        restoreProgress(); // 尝试恢复上次阅读进度
    } catch (error) {
        console.error("加载圣经数据失败:", error);
        els.versesContainer.innerHTML = '<div class="loading-state">数据加载失败，请刷新重试。</div>';
    }
}

// 加载JSON数据 (现改为直接读取 JSONP 注入的 catalog)
async function loadBibleData() {
    els.versesContainer.innerHTML = '<div class="loading-state"><i class="ri-loader-4-line ri-spin"></i> &nbsp; 正在读取目录...</div>';

    // 我们等一小会儿确保 index.html 里的 script 标签已经成功执行加载
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const checkCatalog = setInterval(() => {
            if (window.bibleCatalog) {
                clearInterval(checkCatalog);
                state.catalog = window.bibleCatalog;
                resolve();
            } else if (attempts > 50) { // 约 2.5 秒超时
                clearInterval(checkCatalog);
                reject(new Error('无法读取目录数据 (catalog.js未加载)'));
            }
            attempts++;
        }, 50);
    });
}

// 工具：通过动态创建 script 标签加载 JS 变通解决跨域
function fetchBookData(lang, bookIndex) {
    if (!state.bookCache[lang]) state.bookCache[lang] = {};
    if (state.bookCache[lang][bookIndex]) return Promise.resolve(state.bookCache[lang][bookIndex]);

    return new Promise((resolve) => {
        const scriptId = `bible-data-${lang}-${bookIndex}`;
        if (document.getElementById(scriptId)) {
            // 请求已发出，但因网络还没回来，重试看 Cache
            setTimeout(() => { resolve(fetchBookData(lang, bookIndex)); }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `data/cuv/${lang}/${bookIndex}.js`;

        // 绑定一个全局的回调钩子，由生成的数据 .js 在自身末尾或者主动调用
        if (!window.__bibleDataCb) {
            window.__bibleDataCb = function (cbLang, cbIndex, cbData) {
                if (!state.bookCache[cbLang]) state.bookCache[cbLang] = {};
                state.bookCache[cbLang][cbIndex] = cbData;
            };
        }

        script.onload = () => {
            // 加载成功后，window.__bibleDataCb 应该已经被 .js 调用并填入了书卷缓存
            resolve(state.bookCache[lang][bookIndex] || null);
            script.remove(); // 清理 DOM
        };
        script.onerror = (e) => {
            console.error(`Failed to fetch ${lang} JS book ${bookIndex}`, e);
            resolve(null);
            script.remove();
        };

        document.body.appendChild(script);
    });
}

// 绑定事件
function bindEvents() {
    // 侧边栏开启/关闭
    els.menuToggleBtn.addEventListener('click', () => document.body.classList.add('sidebar-open'));
    els.closeSidebarBtn.addEventListener('click', closeSidebar);
    els.overlay.addEventListener('click', closeSidebar);

    // 书卷分页切换 (旧约/新约)
    els.tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.testament === 'OT') {
                els.bookListOT.classList.remove('hidden');
                els.bookListNT.classList.add('hidden');
            } else {
                els.bookListOT.classList.add('hidden');
                els.bookListNT.classList.remove('hidden');
            }
            // 切换时强制回到初始的各卷书列表状态，保证状态干净
            els.chaptersContainer.classList.add('hidden');
            if (els.verseSectionSidebar) els.verseSectionSidebar.classList.add('hidden');
            els.booksContainer.style.display = 'block';
        });
    });

    // 目录返回键 (返回书卷列表)
    els.backToBooksBtn.addEventListener('click', () => {
        els.chaptersContainer.classList.add('hidden');
        if (els.verseSectionSidebar) els.verseSectionSidebar.classList.add('hidden');
        els.booksContainer.style.display = 'block';
    });



    // 底部导航
    els.prevChapterBtn.addEventListener('click', () => navigateChapter(-1));
    els.nextChapterBtn.addEventListener('click', () => navigateChapter(1));

    // 主题与字号
    els.themeToggleBtn.addEventListener('click', toggleTheme);
    els.fontSizeBtn.addEventListener('click', () => {
        els.fontPanel.classList.toggle('hidden');
        els.searchPanel.classList.add('hidden');
    });

    // 回首页按钮
    document.getElementById('homeBtn').addEventListener('click', () => {
        goHome();
    });
    els.fontSizeRange.addEventListener('input', (e) => {
        const size = e.target.value;
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        localStorage.setItem('fontSize', size);
        state.fontSize = size;
    });

    // 翻译/语言面板
    const langBtn = document.getElementById('langBtn');
    const langPanel = document.getElementById('langPanel');
    const closeLangBtn = document.getElementById('closeLangBtn');

    langBtn.addEventListener('click', () => {
        langPanel.classList.toggle('hidden');
        els.fontPanel.classList.add('hidden');
        els.searchPanel.classList.add('hidden');
    });

    closeLangBtn.addEventListener('click', () => langPanel.classList.add('hidden'));

    // 搜索面板
    els.searchBtn.addEventListener('click', () => {
        els.searchPanel.classList.toggle('hidden');
        els.fontPanel.classList.add('hidden');
        langPanel.classList.add('hidden');
        if (!els.searchPanel.classList.contains('hidden')) {
            els.searchInput.value = ''; // 清空输入框
            showSearchHistory(); // 展示历史搜索记录
            els.searchInput.focus();
        }
    });
    els.closeSearchBtn.addEventListener('click', () => els.searchPanel.classList.add('hidden'));

    // 搜索实时输入
    els.searchInput.addEventListener('input', (e) => {
        clearTimeout(state.searchDebounceTimer);
        state.searchDebounceTimer = setTimeout(() => {
            performSearch(e.target.value.trim());
        }, 500);
    });

    // 经文复制代理事件
    els.versesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (btn) {
            const verseDiv = btn.closest('.verse');
            const num = verseDiv.querySelector('.verse-num').textContent;

            // 获取所有当前节展示的多语言文本
            const langGroups = verseDiv.querySelectorAll('.verse-lang-group');
            let text = "";
            if (langGroups.length > 0) {
                // 将多行合并，用空格或空行分隔均可
                text = Array.from(langGroups).map(g => g.textContent).join(' ');
            } else {
                // 兼容老版本单语 DOM 的可能性
                const vc = verseDiv.querySelector('.verse-content');
                if (vc) text = vc.textContent;
            }

            const ref = `${ALL_BOOKS[state.currentBookIndex]} ${state.currentChapterIndex + 1}:${num}`;
            copyToClipboard(`${ref} ${text}`);
        }
    });
}

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

// 初始化主题
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = els.themeToggleBtn.querySelector('i');
    if (state.theme === 'dark') {
        icon.className = 'ri-sun-line';
    } else {
        icon.className = 'ri-moon-line';
    }
}

// 初始化字号
function initFontSize() {
    els.fontSizeRange.value = state.fontSize;
    document.documentElement.style.setProperty('--base-font-size', `${state.fontSize}px`);
}

// 初始化语言选择器事件
function initLanguageSelector() {
    const checkboxes = document.querySelectorAll('.lang-checkbox');

    // 如果 localStorage 里有旧的 ja 选中记录，先清除
    if (state.selectedLangs.includes('ja')) {
        state.selectedLangs = state.selectedLangs.filter(l => l !== 'ja');
        if (state.selectedLangs.length === 0) state.selectedLangs = ['zh-cn'];
        localStorage.setItem('selectedLangs', JSON.stringify(state.selectedLangs));
    }

    // 同步初始化选中状态
    checkboxes.forEach(cb => {
        cb.checked = state.selectedLangs.includes(cb.value);
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const checkedBoxes = document.querySelectorAll('.lang-checkbox:checked');
            if (checkedBoxes.length > 2) {
                e.target.checked = false; // 超出2个，不让选
                showToast("最多只能同时选择两门语言");
                return;
            }
            if (checkedBoxes.length === 0) {
                e.target.checked = true; // 至少得选1个
                showToast("至少需要选择一门语言");
                return;
            }

            // 更新状态
            state.selectedLangs = Array.from(checkedBoxes).map(b => b.value);
            localStorage.setItem('selectedLangs', JSON.stringify(state.selectedLangs));

            // 立即重载当前章节
            if (state.catalog) {
                loadChapter(state.currentBookIndex, state.currentChapterIndex);
            }
        });
    });
}

// 渲染书卷列表
function renderBookList() {
    if (!Array.isArray(state.catalog)) return;

    let otHtml = '';
    let ntHtml = '';

    BOOKS_META.forEach((meta, index) => {
        let htmlBlock = '';
        if (meta.catName) {
            htmlBlock += `<div class="book-category-header">${meta.catName}</div>`;
        }

        htmlBlock += `
            <button class="book-item" data-index="${index}">
                <span class="book-tag tag-${meta.cat}">${meta.abbr}</span>
                ${meta.name}
            </button>
        `;

        if (index < 39) { // 旧约
            otHtml += htmlBlock;
        } else { // 新约
            ntHtml += htmlBlock;
        }
    });

    els.bookListOT.innerHTML = otHtml;
    els.bookListNT.innerHTML = ntHtml;

    // 绑定书卷点击
    document.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const btn = e.target.closest('.book-item');
            const bookIndex = parseInt(btn.dataset.index);
            showChapters(bookIndex);

            // 样式更新
            document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// 显示某一卷的章节列表
function showChapters(bookIndex) {
    const bookMeta = state.catalog[bookIndex];
    if (!bookMeta) return;

    els.currentBookNameNav.textContent = ALL_BOOKS[bookIndex];
    els.booksContainer.style.display = 'none';
    els.chaptersContainer.classList.remove('hidden');
    if (els.verseSectionSidebar) els.verseSectionSidebar.classList.add('hidden');

    // 给选中的章加一个 active 状态清空机制
    els.chapterGrid.querySelectorAll('.chapter-item').forEach(b => b.classList.remove('active'));

    const chapterCount = bookMeta.chaptersCount;
    let html = '';
    for (let i = 0; i < chapterCount; i++) {
        html += `<button class="chapter-item" data-book="${bookIndex}" data-chapter="${i}">${i + 1}</button>`;
    }

    els.chapterGrid.innerHTML = html;

    // 绑定章节点击
    els.chapterGrid.querySelectorAll('.chapter-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const bIdx = parseInt(e.target.dataset.book);
            const cIdx = parseInt(e.target.dataset.chapter);

            // 首次展示所有的节
            // 移除章的高亮
            els.chapterGrid.querySelectorAll('.chapter-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active'); // 当前章加上高亮(深蓝色之类的)

            // 节列表会在加载详情后渲染
            // showVersesInSidebar(bIdx, cIdx);

            // 加载正文（在背景偷偷加载好）
            loadChapter(bIdx, cIdx);
        });
    });
}

// 在侧边栏显示节列表
function showVersesInSidebar(bookIndex, chapterIndex, verseCount) {
    els.currentChapterNameNav.textContent = `当前所在：${ALL_BOOKS[bookIndex]} ${chapterIndex + 1}章 (请选节)`;
    if (els.verseSectionSidebar) els.verseSectionSidebar.classList.remove('hidden');
    let html = '';
    for (let i = 0; i < verseCount; i++) {
        html += `<button class="chapter-item verse-item-btn" data-v="${i}">${i + 1}</button>`;
    }

    els.verseGrid.innerHTML = html;

    // 绑定节点击，实现跳转
    els.verseGrid.querySelectorAll('.verse-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vIdx = parseInt(e.target.dataset.v);
            scrollToVerseAndHighlight(vIdx);

            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
}

// 供搜索和节导航共用的锚点跳转+闪烁 (CSS)
function scrollToVerseAndHighlight(vIdx) {
    const targetVerse = document.getElementById('v' + (vIdx + 1));
    if (!targetVerse) return;
    targetVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetVerse.classList.remove('verse-flash');
    void targetVerse.offsetWidth;
    targetVerse.classList.add('verse-flash');
    setTimeout(() => targetVerse.classList.remove('verse-flash'), 1800);
}

// 一键回首页（显示书卷列表）
function goHome() {
    els.chaptersContainer.classList.add('hidden');
    if (els.verseSectionSidebar) els.verseSectionSidebar.classList.add('hidden');
    els.booksContainer.style.display = 'block';

    // 还原对应旧/新约 Tab 状态
    const isNT = state.currentBookIndex >= 39;
    els.tabBtns.forEach(b => b.classList.remove('active'));
    els.tabBtns[isNT ? 1 : 0].classList.add('active');
    els.bookListOT.classList.toggle('hidden', isNT);
    els.bookListNT.classList.toggle('hidden', !isNT);

    // 手机端确保侧边栏展开
    if (window.innerWidth <= 768) {
        document.body.classList.add('sidebar-open');
    }
}

// 加载并显示具体章节内容
async function loadChapter(bookIndex, chapterIndex) {
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
    els.currentBookTitle.textContent = `${bookName}第${chapterIndex + 1}章`;

    let html = `<div class="reader-header"><h1>${bookName} ${chapterIndex + 1}</h1></div>`;

    for (let vIndex = 0; vIndex < chapterLength; vIndex++) {
        html += `<div class="verse" id="v${vIndex + 1}">
                    <div style="display:flex; align-items:flex-start;">
                        <span class="verse-num">${vIndex + 1}</span>
                        <div style="flex:1;">`;

        // 遍历目前所选的最多2个语言
        state.selectedLangs.forEach((langCode, index) => {
            const db = booksData[index];
            if (!db || !db.chapters || !db.chapters[chapterIndex]) return;
            let verseText = "";
            try {
                verseText = db.chapters[chapterIndex][vIndex];
            } catch (e) {
                verseText = ""; // 结构不匹配时静默跳过
            }
            if (!verseText) return; // 空节也跳过，不展示占位文字

            // 使用不同语言专属字体样式
            html += `<span class="verse-lang-group verse-lang-${langCode}">${verseText}</span>`;
        });

        html += `       </div>
                    </div>
                    <button class="copy-btn" title="复制此节" aria-label="复制全文"><i class="ri-file-copy-line"></i></button>
                </div>`;
    }

    els.versesContainer.innerHTML = html;
    els.readerContent.scrollTop = 0;

    // 更新底部导航
    updateBottomNav();

    // 保存进度
    saveProgress();

    // 更新侧边栏状态
    updateSidebarActiveState();

    if (!els.chaptersContainer.classList.contains('hidden') && els.verseSectionSidebar) {
        showVersesInSidebar(bookIndex, chapterIndex, chapterLength);
    }
}

function updateSidebarActiveState() {
    // 移除所有 active
    document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.chapter-item').forEach(c => c.classList.remove('active'));

    // 根据当前状态添加 active
    const activeBook = document.querySelector(`.book-item[data-index="${state.currentBookIndex}"]`);
    if (activeBook) activeBook.classList.add('active');

    const activeChapter = document.querySelector(`.chapter-item[data-book="${state.currentBookIndex}"][data-chapter="${state.currentChapterIndex}"]`);
    if (activeChapter) activeChapter.classList.add('active');
}

// 底部导航逻辑
function updateBottomNav() {
    els.bottomNav.classList.remove('hidden');
    els.navInfo.textContent = `${ALL_BOOKS[state.currentBookIndex]} ${state.currentChapterIndex + 1}`;

    // 判断是否可上/下导航
    const isFirstBook = state.currentBookIndex === 0;
    const isFirstChapter = state.currentChapterIndex === 0;
    const isLastBook = state.currentBookIndex === state.catalog.length - 1;
    const isLastChapter = state.currentChapterIndex === state.catalog[state.currentBookIndex].chaptersCount - 1;

    els.prevChapterBtn.disabled = isFirstBook && isFirstChapter;
    els.nextChapterBtn.disabled = isLastBook && isLastChapter;
}

function navigateChapter(direction) {
    let nextBIdx = state.currentBookIndex;
    let nextCIdx = state.currentChapterIndex + direction;

    if (nextCIdx < 0) {
        if (nextBIdx > 0) {
            nextBIdx--;
            nextCIdx = state.catalog[nextBIdx].chaptersCount - 1;
        } else {
            return; // 已经是开端
        }
    } else if (nextCIdx >= state.catalog[nextBIdx].chaptersCount) {
        if (nextBIdx < state.catalog.length - 1) {
            nextBIdx++;
            nextCIdx = 0;
        } else {
            return; // 已经是结尾
        }
    }

    loadChapter(nextBIdx, nextCIdx);
}

let isSearchIndexLoading = false;

// 搜索功能 (全域搜)
function performSearch(query) {
    if (!query || query.trim().length === 0) {
        showSearchHistory();
        return;
    }

    if (!window.__bibleSearchIndex) {
        els.searchResults.innerHTML = '<div class="loading-state" style="font-size: 0.9rem;">正在加载全库搜索引擎配置...</div>';

        if (isSearchIndexLoading) return;
        isSearchIndexLoading = true;

        const script = document.createElement('script');
        script.src = 'data/cuv/search_index.js';
        script.onload = () => {
            isSearchIndexLoading = false;
            executeGlobalSearch(query);
        };
        script.onerror = () => {
            isSearchIndexLoading = false;
            els.searchResults.innerHTML = '<div style="text-align:center;padding:1rem;">搜索组件加载失败，请检查网络或配置</div>';
        };
        document.body.appendChild(script);
    } else {
        executeGlobalSearch(query);
    }
}

function executeGlobalSearch(query) {
    els.searchResults.innerHTML = '<div class="loading-state" style="font-size: 0.9rem;">全局检索中...</div>';

    setTimeout(() => {
        const results = [];
        const maxResults = 50;
        const searchDB = window.__bibleSearchIndex || [];

        for (let b = 0; b < searchDB.length; b++) {
            const book = searchDB[b];
            if (!book || !book.chapters) continue;
            for (let c = 0; c < book.chapters.length; c++) {
                const chapter = book.chapters[c];
                for (let v = 0; v < chapter.length; v++) {
                    const text = chapter[v];
                    if (text && text.includes(query)) {
                        results.push({
                            bIdx: b,
                            cIdx: c,
                            vIdx: v,
                            ref: `${ALL_BOOKS[b]} ${c + 1}:${v + 1}`,
                            text: text
                        });
                        if (results.length >= maxResults) break;
                    }
                }
                if (results.length >= maxResults) break;
            }
            if (results.length >= maxResults) break;
        }

        saveSearchHistory(query);
        renderSearchResults(results, query);
    }, 10);
}

function getSearchHistory() {
    try {
        return JSON.parse(localStorage.getItem('bible_search_history')) || [];
    } catch { return []; }
}

function saveSearchHistory(query) {
    let history = getSearchHistory();
    history = history.filter(q => q !== query);
    history.unshift(query);
    if (history.length > 10) history.pop(); // Keep top 10
    localStorage.setItem('bible_search_history', JSON.stringify(history));
}

function showSearchHistory() {
    const history = getSearchHistory();
    if (history.length === 0) {
        els.searchResults.innerHTML = '<div style="padding:1rem;color:var(--text-tertiary);text-align:center;">暂无搜索记录，请输入关键词开始</div>';
        return;
    }

    let html = '<div style="padding:0.5rem 1rem;font-size:0.85rem;color:var(--text-tertiary);display:flex;justify-content:space-between;"><span>搜索历史</span><button style="color:var(--primary-color);font-size:0.85rem;" onclick="clearSearchHistory()">清空</button></div>';

    html += '<div style="padding:0 1rem;display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">';
    history.forEach(q => {
        html += `<span class="history-tag" style="background:var(--hover-bg);padding:0.3rem 0.6rem;border-radius:1rem;font-size:0.85rem;cursor:pointer;color:var(--primary-color)">${q}</span>`;
    });
    html += '</div>';

    els.searchResults.innerHTML = html;

    els.searchResults.querySelectorAll('.history-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const q = e.target.textContent;
            els.searchInput.value = q;
            performSearch(q);
        });
    });
}

window.clearSearchHistory = function () {
    localStorage.removeItem('bible_search_history');
    showSearchHistory();
}

function renderSearchResults(results, query) {
    if (results.length === 0) {
        els.searchResults.innerHTML = '<div style="padding: 1rem; color: var(--text-tertiary); text-align: center;">未找到相关经文</div>';
        return;
    }
    let html = '';
    results.forEach(res => {
        // 高亮关键词
        const highlightedText = res.text.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);

        html += `
            <div class="search-result-item" data-b="${res.bIdx}" data-c="${res.cIdx}" data-v="${res.vIdx}">
                <div class="search-result-ref">${res.ref}</div>
                <div class="search-result-text">${highlightedText}</div>
            </div>
        `;
    });

    if (results.length === 50) {
        html += '<div style="text-align: center; color: var(--text-tertiary); padding: 0.5rem; font-size: 0.85rem;">已达到最大显示数量，请尝试更精确的关键词</div>';
    }

    els.searchResults.innerHTML = html;

    // 绑定点击跳转事件
    els.searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const b = parseInt(e.currentTarget.dataset.b);
            const c = parseInt(e.currentTarget.dataset.c);
            const v = parseInt(e.currentTarget.dataset.v);

            // 加载章节
            loadChapter(b, c);

            // 隐藏搜索面板
            els.searchPanel.classList.add('hidden');

            // 滚动到具体经文节并高亮
            setTimeout(() => {
                scrollToVerseAndHighlight(v);
            }, 100);

            if (window.innerWidth <= 768) closeSidebar();
        });
    });
}

// 本地进度记忆
function saveProgress() {
    localStorage.setItem('lastBook', state.currentBookIndex);
    localStorage.setItem('lastChapter', state.currentChapterIndex);
}

function restoreProgress() {
    const lastB = localStorage.getItem('lastBook');
    const lastC = localStorage.getItem('lastChapter');

    if (lastB !== null && lastC !== null) {
        loadChapter(parseInt(lastB), parseInt(lastC));
        // 展开侧边栏对应的旧/新约 Tab
        if (parseInt(lastB) < 39) {
            els.tabBtns[0].click();
        } else {
            els.tabBtns[1].click();
        }
    } else {
        // 默认加载创世纪1章
        loadChapter(0, 0);
    }
}

// 复制工具
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('复制成功'))
            .catch(() => fallbackCopyTextToClipboard(text));
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // 避免滚动
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) showToast('复制成功');
        else showToast('复制失败，请手动选择复制');
    } catch (err) {
        showToast('复制失败，浏览器不支持');
    }
    document.body.removeChild(textArea);
}

let toastTimer;
function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        els.toast.classList.remove('show');
    }, 2000);
}

// 启动
document.addEventListener('DOMContentLoaded', init);
