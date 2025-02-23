let synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;

// Загружаем голоса при старте
window.addEventListener("load", () => {
    loadVoices();
    document.getElementById("languageSelect").addEventListener("change", filterVoicesByLanguage);
});

// Загружаем доступные голоса
function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) {
        setTimeout(loadVoices, 100); // Повторная попытка через 100 мс, если голоса ещё не загружены
        return;
    }
    populateLanguageSelect();
    filterVoicesByLanguage();
}

// Обработчик, если голоса подгрузились после старта
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Заполняем список языков для выбора
function populateLanguageSelect() {
    const languageSelect = document.getElementById("languageSelect");
    const uniqueLanguages = [...new Set(voices.map(voice => voice.lang.split('-')[0]))];

    languageSelect.innerHTML = '';
    uniqueLanguages.forEach(lang => {
        const option = document.createElement("option");
        option.value = lang;
        option.textContent = lang.toUpperCase();
        languageSelect.appendChild(option);
    });
}

// Фильтруем голоса по выбранному языку
function filterVoicesByLanguage() {
    const selectedLang = document.getElementById("languageSelect").value;
    const voiceSelect = document.getElementById("voiceSelect");
    voiceSelect.innerHTML = '';

    voices
        .filter(voice => voice.lang.startsWith(selectedLang))
        .forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = voices.indexOf(voice);
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
}

// Функция для очистки текста от смайликов и знаков препинания
function cleanText(text) {
    // Удаляем смайлики (по диапазонам Unicode)
    text = text.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Смайлики
    text = text.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Символы и пиктограммы
    text = text.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Транспорт и карты
    text = text.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Разные символы
    text = text.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats

    // Удаляем знаки препинания и спецсимволы, оставляем буквы и цифры
    text = text.replace(/[^\w\sа-яА-ЯёЁ0-9.,!?]/g, '');

    // Убираем лишние пробелы
    return text.replace(/\s+/g, ' ').trim();
}

// Озвучка текста
function speakText(text) {
    if (synth.speaking) {
        stopSpeech();
        return;
    }

    // ✅ Очищаем текст перед озвучкой
    const clean = cleanText(text);

    const voiceIndex = document.getElementById("voiceSelect").value;
    const rate = document.getElementById("rateInput").value;
    const pitch = document.getElementById("pitchInput").value;

    currentUtterance = new SpeechSynthesisUtterance(clean);
    currentUtterance.voice = voices[voiceIndex];
    currentUtterance.rate = parseFloat(rate);
    currentUtterance.pitch = parseFloat(pitch);
    currentUtterance.lang = currentUtterance.voice.lang;

    synth.speak(currentUtterance);
}

// Остановка озвучки
function stopSpeech() {
    if (synth.speaking) {
        synth.cancel();
    }
}

// ✅ Открытие модального окна для озвучки
function openSpeechModal(text) {
    const modal = document.getElementById("speechModal");
    modal.style.display = "block";

    // Закрыть модалку по клику на крестик
    document.getElementById("closeModal").onclick = () => {
        modal.style.display = "none";
        stopSpeech();
    };

    // Начать озвучку
    document.getElementById("startSpeech").onclick = () => {
        speakText(text);
    };

    // Остановить озвучку
    document.getElementById("stopSpeech").onclick = () => {
        stopSpeech();
    };
}

// Закрываем модалку при клике вне окна
window.onclick = function(event) {
    const modal = document.getElementById("speechModal");
    if (event.target == modal) {
        modal.style.display = "none";
        stopSpeech();
    }
};