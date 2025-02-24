// CoreBlog.js с Lazy Loading и кэшированием

document.addEventListener("DOMContentLoaded", async () => { const postsListFile = "posts/list.txt"; let currentPage = 0; let allPosts = [];

const blogContainer = document.getElementById("blog");
const tocContainer = document.getElementById("toc");
const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");
const searchInput = document.getElementById("searchInput");

// Транслитерация для URL
function transliterate(text) {
    const ruToEn = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh",
        "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
        "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts",
        "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya"
    };
    return text.toLowerCase()
        .replace(/[а-яё]/g, char => ruToEn[char] || char)
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .trim("-");
}

// Загрузка списка заголовков
async function loadPostList() {
    try {
        const response = await fetch(postsListFile);
        if (!response.ok) throw new Error("Ошибка загрузки списка статей");

        const text = await response.text();
        const postFiles = text.split("\n").map(line => line.trim()).filter(line => line !== "");

        allPosts = postFiles.map(file => ({ file, title: "", date: "", content: null }));

        await loadPostHeaders(postFiles);
        generateTOC();

        const params = new URLSearchParams(window.location.search);
        const articleIndex = params.has("article") ? parseInt(params.get("article")) : 0;
        loadPostContent(articleIndex);
    } catch (error) {
        console.error(error);
    }
}

// Загрузка заголовков и дат
async function loadPostHeaders(postFiles) {
    for (let i = 0; i < postFiles.length; i++) {
        try {
            const response = await fetch(postFiles[i]);
            if (!response.ok) throw new Error(`Ошибка загрузки: ${postFiles[i]}`);

            const text = await response.text();
            const lines = text.split("\n");
            allPosts[i].title = lines[0].trim();
            allPosts[i].date = lines[1].trim();
        } catch (error) {
            console.error(error);
        }
    }
}

// Генерация оглавления
function generateTOC() {
    tocContainer.innerHTML = "<ul>";
    allPosts.forEach((post, index) => {
        const postSlug = transliterate(post.title);
        tocContainer.innerHTML += `<li><a href="#" data-index="${index}" class="load-post">${post.title}</a> <small>${post.date}</small></li>`;
    });
    tocContainer.innerHTML += "</ul>";

    document.querySelectorAll(".load-post").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const postIndex = e.target.getAttribute("data-index");
            loadPostContent(postIndex);
        });
    });
}

// Загрузка содержимого статьи с кэшированием
async function loadPostContent(index) {
    const post = allPosts[index];

    const cachedPost = localStorage.getItem(post.file);
    if (cachedPost) {
        const cachedData = JSON.parse(cachedPost);
        post.title = cachedData.title;
        post.date = cachedData.date;
        post.content = cachedData.content;
        displayPost(post);
        return;
    }

    try {
        const response = await fetch(post.file);
        if (!response.ok) throw new Error(`Ошибка загрузки: ${post.file}`);

        const text = await response.text();
        const lines = text.split("\n");
        post.title = lines[0].trim();
        post.date = lines[1].trim();
        post.content = lines.slice(2).join("\n");

        localStorage.setItem(post.file, JSON.stringify(post));

        displayPost(post);
    } catch (error) {
        console.error(error);
    }
}

// Отображение статьи
function displayPost(post) {
    blogContainer.innerHTML = "";

    const article = document.createElement("div");
    article.classList.add("post");
    article.innerHTML = `
        <h2>${post.title}</h2>
        <p><small>${post.date}</small></p>
        <div>${linkify(post.content)}</div>
        <p>
            <button class="copy-link" data-link="${post.file}">🔗 Скопировать ссылку</button>
            <button class="speak-text" data-text="${post.content}">🔊 Озвучить</button>
        </p>
        <hr>
    `;

    blogContainer.appendChild(article);
    scrollToTop();
}

// Прокрутка вверх
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Навигация по страницам
prevButton.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        loadPostContent(currentPage);
    }
});

nextButton.addEventListener("click", () => {
    if (currentPage < allPosts.length - 1) {
        currentPage++;
        loadPostContent(currentPage);
    }
});

// Очистка кэша
document.getElementById("clearCache").addEventListener("click", () => {
    localStorage.clear();
    alert("Кэш очищен!");
});

// Запуск
await loadPostList();

});

