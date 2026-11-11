/* ==========================================================================
   Configurações Globais, Estado e Internacionalização (i18n)
   ========================================================================== */
const state = {
    theme: 'light',
    lang: 'pt',
    category: 'Pedagogia',
    searchQuery: '',
    books: []
};

const i18n = {
    pt: {
        title: "Biblioteca de Pedagogia & Psicologia",
        subtitle: "Explore obras essenciais, aprenda com resumos e escute o conteúdo com leitura em voz alta.",
        searchPlaceholder: "Buscar por título ou autor...",
        catPedagogy: "Pedagogia",
        catPsychology: "Psicologia",
        catPsychopedagogy: "Psicopedagogia",
        themeDark: "Escuro",
        themeLight: "Claro",
        readMore: "Ver mais",
        readLess: "Ver menos",
        listen: "🔊 Ouvir",
        stopListen: "⏹ Pausar",
        footerText: "© 2026 EduMind - Conhecimento Aberto e Acessível."
    },
    en: {
        title: "Pedagogy & Psychology Library",
        subtitle: "Explore essential works, learn from summaries, and listen to content using screen reader text-to-speech.",
        searchPlaceholder: "Search by title or author...",
        catPedagogy: "Pedagogy",
        catPsychology: "Psychology",
        catPsychopedagogy: "Psychopedagogy",
        themeDark: "Dark",
        themeLight: "Light",
        readMore: "Read more",
        readLess: "Read less",
        listen: "🔊 Listen",
        stopListen: "⏹ Stop",
        footerText: "© 2026 EduMind - Open & Accessible Knowledge."
    }
};

/* Base local de fallback caso haja limitação de taxa (HTTP 429) na API do Google */
const fallbackBooks = {
    Pedagogia: [
        {
            id: 'f1',
            title: 'Pedagogia do Oprimido',
            authors: ['Paulo Freire'],
            description: 'Uma das obras mais importantes da pedagogia mundial, propondo uma práxis libertadora baseada no diálogo e conscientização.',
            thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'
        },
        {
            id: 'f2',
            title: 'Pedagogia da Autonomia',
            authors: ['Paulo Freire'],
            description: 'Saberes necessários à prática educativa e à formação docente crítica e reflexiva.',
            thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=80'
        }
    ],
    Psicologia: [
        {
            id: 'f3',
            title: 'A Construção do Pensamento na Criança',
            authors: ['Jean Piaget'],
            description: 'Estudo clássico sobre o desenvolvimento cognitivo infantil e as etapas da inteligência.',
            thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&q=80'
        }
    ],
    Psicopedagogia: [
        {
            id: 'f4',
            title: 'O Processo de Aprendizagem',
            authors: ['Alicia Fernández'],
            description: 'Aprofundamento sobre a clínica psicopedagógica e a relação com o conhecimento e a família.',
            thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=80'
        }
    ]
};

/* ==========================================================================
   Inicialização e Eventos
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks(state.category);

    // Evento da barra de pesquisa com debounce
    let timeout = null;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.searchQuery = e.target.value.trim();
            fetchBooks(state.searchQuery ? state.searchQuery : state.category);
        }, 400);
    });
});

/* Função de Feedback Háptico (Vibração) */
function triggerVibration(pattern = 30) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

/* Alternância de Tema (Modo Claro / Escuro) */
function toggleTheme() {
    triggerVibration(25);
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', state.theme);
    
    const themeLabel = document.getElementById('theme-label');
    const themeIcon = state.theme === 'light' ? '🌙' : '☀️';
    themeLabel.setAttribute('data-i18n', state.theme === 'light' ? 'themeDark' : 'themeLight');
    themeLabel.previousSibling.textContent = themeIcon + ' ';
    updateTranslations();
}

/* Alternância de Idioma (Português / Inglês) */
function toggleLanguage() {
    triggerVibration(25);
    state.lang = state.lang === 'pt' ? 'en' : 'pt';
    document.getElementById('lang-label').textContent = state.lang.toUpperCase();
    updateTranslations();
}

function updateTranslations() {
    const t = i18n[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
}

/* Seleção de Categoria */
function selectCategory(element, category) {
    triggerVibration(20);
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    state.category = category;
    document.getElementById('search-input').value = '';
    state.searchQuery = '';
    fetchBooks(category);
}

/* ==========================================================================
   Integração com API (Google Books) e Renderização
   ========================================================================== */
async function fetchBooks(query) {
    const grid = document.getElementById('books-grid');
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Carregando livros...</p>';

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`);
        
        if (!response.ok) throw new Error('API Rate limit or error');
        
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            state.books = data.items.map(item => ({
                id: item.id,
                title: item.volumeInfo.title || 'Título Indisponível',
                authors: item.volumeInfo.authors || ['Autor Desconhecido'],
                description: item.volumeInfo.description || 'Sem resumo disponível.',
                thumbnail: item.volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80'
            }));
        } else {
            useFallback(query);
        }
    } catch (err) {
        useFallback(query);
    }

    renderBooks();
}

function useFallback(query) {
    state.books = fallbackBooks[query] || fallbackBooks['Pedagogia'];
}

function renderBooks() {
    const grid = document.getElementById('books-grid');
    const t = i18n[state.lang];
    grid.innerHTML = '';

    state.books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-cover-container">
                <img src="${book.thumbnail}" alt="${book.title}" class="book-cover">
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.authors.join(', ')}</p>
                <p class="book-description" id="desc-${book.id}">${book.description}</p>
                <div class="card-actions">
                    <button class="btn-card" onclick="toggleExpand('${book.id}', this)">${t.readMore}</button>
                    <button class="btn-card" onclick="speakText('${book.id}', this)">${t.listen}</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* Expandir/Recolher Descrição */
function toggleExpand(id, button) {
    triggerVibration(15);
    const desc = document.getElementById(`desc-${id}`);
    const isExpanded = desc.classList.toggle('expanded');
    const t = i18n[state.lang];
    button.textContent = isExpanded ? t.readLess : t.readMore;
}

/* ==========================================================================
   Recurso de Acessibilidade: Leitura em Voz Alta (Web Speech API)
   ========================================================================== */
function speakText(id, button) {
    triggerVibration(40);
    const t = i18n[state.lang];

    // Se já estiver lendo, para a leitura
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        button.textContent = t.listen;
        return;
    }

    const descText = document.getElementById(`desc-${id}`).textContent;
    if (!('speechSynthesis' in window)) {
        alert("Seu navegador não suporta leitura em voz alta.");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(descText);
    
    // Configura o idioma e busca voz prioritariamente em pt-BR se for em português
    utterance.lang = state.lang === 'pt' ? 'pt-BR' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.includes(state.lang === 'pt' ? 'pt' : 'en'));
    if (selectedVoice) utterance.voice = selectedVoice;

    button.textContent = t.stopListen;

    utterance.onend = () => {
        button.textContent = t.listen;
    };

    utterance.onerror = () => {
        button.textContent = t.listen;
    };

    window.speechSynthesis.speak(utterance);
}