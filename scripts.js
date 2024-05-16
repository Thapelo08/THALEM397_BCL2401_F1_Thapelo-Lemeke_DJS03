import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

function createBookElement(book) {
 const { author, id, image, title } = book;
 const element = document.createElement("button");
 element.classList = "preview";
 element.setAttribute("data-preview", id);

 element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
 return element;
}

function populateGenres() {
 const genreSelect = document.querySelector("[data-search-genres]");
 genreSelect.innerHTML = `<option value="any">All Genres</option>`;
 for (const [id, name] of Object.entries(genres)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  genreSelect.appendChild(option);
 }
}

function populateAuthors() {
 const authorSelect = document.querySelector("[data-search-authors]");
 authorSelect.innerHTML = `<option value="any">All Authors</option>`;
 for (const [id, name] of Object.entries(authors)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  authorSelect.appendChild(option);
 }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}


function updateListButton() {
 const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
 const button = document.querySelector("[data-list-button]");
 button.innerText = `Show more (${remaining})`;
 button.disabled = remaining <= 0;
}

function renderBooks() {
 const fragment = document.createDocumentFragment();
 const startIndex = (page - 1) * BOOKS_PER_PAGE;
 const endIndex = page * BOOKS_PER_PAGE;
 document.querySelector("[data-list-items]").innerHTML = "";
 for (let i = startIndex; i < endIndex && i < matches.length; i++) {
  const book = matches[i];
  const element = createBookElement(book);
  fragment.appendChild(element);
 }

 document.querySelector("[data-list-items]").appendChild(fragment);
}

function handleShowMore() {
 page += 1;
 updateListButton();
 renderBooks();
}

function handleBookClick(event) {
 const target = event.target;
 const previewId = target.closest(".preview")?.getAttribute("data-preview");
 if (!previewId) return;
 const activeBook = books.find((book) => book.id === previewId);
 if (!activeBook) return;
 document.querySelector("[data-list-active]").open = false;

 document.querySelector("[data-list-blur]").src = activeBook.image;
 document.querySelector("[data-list-image]").src = activeBook.image;
 document.querySelector("[data-list-title]").innerText = activeBook.title;
 document.querySelector("[data-list-subtitle]").innerText = `${
  authors[activeBook.author]
 } (${new Date(activeBook.published).getFullYear()})`;
 document.querySelector("[data-list-description]").innerText =
  activeBook.description;
}

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
 document.querySelector("[data-search-overlay]").open = false;
});

document
 .querySelector("[data-settings-cancel]")
 .addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = false;
 });

document.querySelector("[data-header-search]").addEventListener("click", () => {
 document.querySelector("[data-search-overlay]").open = true;
 document.querySelector("[data-search-title]").focus();
});

document
 .querySelector("[data-header-settings]")
 .addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = true;
 });

document.querySelector("[data-list-close]").addEventListener("click", () => {
 document.querySelector("[data-list-active]").open = false;
});

document
 .querySelector("[data-settings-form]")
 .addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);
  updateTheme(themeValue);

  document.querySelector("[data-settings-theme]").value = themeValue;
 });

document
 .querySelector("[data-search-form]")
 .addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  matches = books.filter(
   (book) =>
    (filters.title.trim() === "" ||
     book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
    (filters.author === "any" || book.author === filters.author) &&
    (filters.genre === "any" || book.genres.includes(filters.genre))
  );
  page = 1;
  renderBooks();
  updateListButton();
  document.querySelector("[data-search-overlay]").open = false;
 });

document
 .querySelector("[data-list-button]")
 .addEventListener("click", handleShowMore);
document
 .querySelector("[data-list-items]")
 .addEventListener("click", handleBookClick);

populateGenres();
populateAuthors();
updateTheme();
renderBooks();
updateListButton();

