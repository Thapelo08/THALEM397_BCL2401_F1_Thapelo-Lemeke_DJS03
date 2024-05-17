import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Initialize global variables
let page = 1;
let matches = books;

// Utility function to create an element with innerHTML
const createElement = (tag, className, innerHTML, attributes = {}) => {
    const element = document.createElement(tag);
    element.className = className;
    element.innerHTML = innerHTML;
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
    return element;
};

// Function to create book previews
const createBookPreview = (book) => {
    const { author, id, image, title } = book;
    return createElement('button', 'preview', `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `, { 'data-preview': id });
};
// Function to append book previews to the list
const appendBookPreviews = (books, container) => {
    const fragment = document.createDocumentFragment();
    books.forEach(book => fragment.appendChild(createBookPreview(book)));
    container.appendChild(fragment);
};

// Function to create and append options to a select element
const populateSelect = (selectElement, options, defaultOptionText) => {
    const fragment = document.createDocumentFragment();
    const defaultOption = createElement('option', '', defaultOptionText, { value: 'any' });
    fragment.appendChild(defaultOption);

    Object.entries(options).forEach(([id, name]) => {
        const option = createElement('option', '', name, { value: id });
        fragment.appendChild(option);
    });

    selectElement.appendChild(fragment);
};


const applyTheme = (theme) => {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    document.querySelector('[data-settings-theme]').value = theme;
};

// Function to initialize the page with default values
const initializePage = () => {
    const bookContainer = document.querySelector('[data-list-items]');
    appendBookPreviews(matches.slice(0, BOOKS_PER_PAGE), bookContainer);

    populateSelect(document.querySelector('[data-search-genres]'), genres, 'All Genres');
    populateSelect(document.querySelector('[data-search-authors]'), authors, 'All Authors');

    applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');

    document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) <= 0;
};

const showMoreBooks = () => {
    const bookContainer = document.querySelector('[data-list-items]');
    appendBookPreviews(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE), bookContainer);
    page += 1;
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) <= 0;
};

// Function to filter books based on search criteria
const filterBooks = (filters) => {
    return books.filter(book => {
        const matchesGenre = filters.genre === 'any' || book.genres.includes(filters.genre);
        const matchesTitle = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const matchesAuthor = filters.author === 'any' || book.author === filters.author;
        return matchesGenre && matchesTitle && matchesAuthor;
    });
};

// Event listeners setup
const setupEventListeners = () => {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme);
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        matches = filterBooks(filters);
        page = 1;

        const bookContainer = document.querySelector('[data-list-items]');
        bookContainer.innerHTML = '';
        appendBookPreviews(matches.slice(0, BOOKS_PER_PAGE), bookContainer);

        document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length < 1);
        document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) <= 0;
        document.querySelector('[data-search-overlay]').open = false;

        document.querySelector('[data-list-button]').innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${Math.max(matches.length - (page * BOOKS_PER_PAGE), 0)})</span>
        `;
    });

    document.querySelector('[data-list-button]').addEventListener('click', showMoreBooks);

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node.dataset.preview);
                break;
            }
        }

        if (active) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = active.image;
            document.querySelector('[data-list-image]').src = active.image;
            document.querySelector('[data-list-title]').innerText = active.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = active.description;
        }
    });
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
});
