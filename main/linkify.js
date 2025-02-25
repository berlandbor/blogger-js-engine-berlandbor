function linkify(text) {
    const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;

    return text.replace(urlRegex, (url) => {
        const hyperlink = url.startsWith('http') ? url : `https://${url}`;

  // === Проверка на Google Drive ===
        const googleDriveMatch = hyperlink.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
        if (googleDriveMatch && googleDriveMatch[1]) {
            const fileId = googleDriveMatch[1];
            const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

            // Проверка на /preview
            if (hyperlink.includes('/preview')) {
                return `
                    <div style="position: relative; max-width: 90%; text-align: center; margin: auto;">
                        <iframe src="https://drive.google.com/file/d/${fileId}/preview" 
                                allow="autoplay" allowfullscreen style="display: block; margin: 0 auto; width: 90%; height: 580px;"></iframe>
                        <button onclick="openFullScreen('gdrive-${fileId}')" style="margin-top: 2px; background-color: rgba(0, 0, 0, 0.7); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                            Полный экран
                        </button>
                    </div>`;
            }

            // Определяем тип файла
            if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(hyperlink) || hyperlink.includes("image")) {
                return `<img src="${directLink}" alt="Google Drive Image" style="max-width:100%; height:auto; display: block; margin: 5px auto;">`;
            }

            if (/\.(mp4|webm|ogg)$/i.test(hyperlink) || hyperlink.includes("video")) {
                return `
                    <div style="position: relative; max-width: 100%; text-align: center;">
                        <video controls style="max-width:100%; height:auto;">
                            <source src="${directLink}" type="video/mp4">
                            Ваш браузер не поддерживает видео.
                        </video>
                    </div>`;
            }

            if (/\.(mp3|wav|ogg|aacp)$/i.test(hyperlink) || hyperlink.includes("audio")) {
                return `<audio controls style="width:100%;">
                            <source src="${directLink}" type="audio/mpeg">
                            Ваш браузер не поддерживает аудио.
                        </audio>`;
            }

            // Если тип неизвестен — даем ссылку для скачивания
            return `<a href="${directLink}" target="_blank" rel="noopener noreferrer">Скачать файл с Google Диска</a>`;
        }

        // === Проверка на стандартные изображения (.png, .jpg, .gif и т.д.) ===
        if (/\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i.test(hyperlink)) {
            return `<img src="${hyperlink}" alt="Image" style="max-width:100%; height:auto; display: block; margin: 5px auto;">`;
        }

        // === YOUTUBE SUPPORT ===
        const youtubeMatch = hyperlink.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([^\s&]+)/);
        if (youtubeMatch && youtubeMatch[1]) {
            const videoId = youtubeMatch[1];
            return `
                <div style="position: relative; max-width: 100%; text-align: center;">
                    <iframe id="youtube-${videoId}" style="max-width:100%; height:auto;" src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen style="display: block; margin: 0 auto;"></iframe>
                    <button onclick="openFullScreen('youtube-${videoId}')" style="margin-top: 5px; background-color: rgba(0, 0, 0, 0.7); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        Полный экран
                    </button>
                </div>`;
        }

        // === ПОДДЕРЖКА HLS .m3u8 ===
        if (/\.m3u8(\?.*)?$/.test(hyperlink)) {
            const fileId = `hls-${Math.random().toString(36).substr(2, 9)}`;
            return `
                <div style="position: relative; max-width: 100%; text-align: center;">
                    <video id="${fileId}" controls style="max-width:100%; height:auto;">
                        <source src="${hyperlink}" type="application/vnd.apple.mpegurl">
                        Ваш браузер не поддерживает HLS.
                    </video>
                    <button onclick="openFullScreen('${fileId}')" style="margin-top: 5px; background-color: rgba(0, 0, 0, 0.7); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        Полный экран
                    </button>
                </div>`;
        }

        // === ПРЯМЫЕ ССЫЛКИ НА ВИДЕО ===
        if (/\.(mp4|webm|ogg)$/i.test(hyperlink)) {
            const fileId = `video-${Math.random().toString(36).substr(2, 9)}`;
            return `
                <div style="position: relative; max-width: 100%; text-align: center;">
                    <video id="${fileId}" controls style="max-width:100%; height:auto;">
                        <source src="${hyperlink}" type="video/${hyperlink.split('.').pop()}">
                        Ваш браузер не поддерживает видео.
                    </video>
                    <button onclick="openFullScreen('${fileId}')" style="margin-top: 5px; background-color: rgba(0, 0, 0, 0.7); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        Полный экран
                    </button>
                </div>`;
        }

        // === Аудио файлы ===
        if (/\.(mp3|wav|ogg|aacp)$/i.test(hyperlink)) {
            let audioType = hyperlink.endsWith('.aacp') ? 'aac' : hyperlink.split('.').pop();
            return `<audio controls style="width:100%;">
                        <source src="${hyperlink}" type="audio/${audioType}">
                        Ваш браузер не поддерживает аудио.
                    </audio>`;
        }

        // === Обычные ссылки ===
        return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    // === Обработка Markdown-разметки ===
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Нумерованные списки
    .replace(/(^\s*\d+\.\s+.+(?:\n|$))/gm, (match) => {
        const items = match.trim().split('\n').map(item => {
            return item.replace(/^\s*\d+\.\s+(.+)$/, '<li>$1</li>');
        }).join('');
        return `<ol>${items}</ol>`;
    })
    // Маркированные списки
    .replace(/(^- .+(?:\n- .+)*)/gm, (match) => {
        const items = match.split('\n').map(item => item.replace(/^- (.+)$/, '<li>$1</li>')).join('');
        return `<ul>${items}</ul>`;
    })
    // Жирный текст
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Курсив
    .replace(/(^|[^*])\*(?!\s)(.+?)(?!\s)\*(?!\*)/g, '$1<em>$2</em>')
    // Кодовые блоки и строки
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Переносы строк
    .replace(/\n/g, '<br>');
}

// === Функция для открытия полного экрана ===
function openFullScreen(elementId) {
    const element = document.getElementById(elementId);
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}