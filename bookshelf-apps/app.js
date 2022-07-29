/*
 * Class AppStorage
 */
class AppStorage {

	constructor(storageKey) {
		this._STORAGE_KEY = storageKey;
	}

	isStorageExist() {
		return typeof (Storage) !== undefined;
	}

	get datasStorage() {
		if(this.isStorageExist()) {
			const datas = localStorage.getItem(this._STORAGE_KEY);
			if(datas) {
				return JSON.parse(datas);
			}
		}

		return [];
	}

	set datasStorage(datas) {
		if(! this.isStorageExist()) return;

		localStorage.setItem(this._STORAGE_KEY, JSON.stringify(datas));
	}
}

/*
 * Class Bookshelf
 */
class Bookshelf extends AppStorage {

	constructor({ $form, $unreadBooks, $readedBooks, $searchInput, storageKey }) {
		super(storageKey);

		if(! this.isStorageExist()) {
			alert('Browser Kamu tidak mendukung localStorage');
		}

		this.$form = $form;
		this.$title = $form.querySelector('#title');
		this.$author = $form.querySelector('#author');
		this.$year = $form.querySelector('#year');
		this.$isComplete = $form.querySelector('#isComplete');

		this.$unreadBooks = $unreadBooks;
		this.$readedBooks = $readedBooks;
		this.$searchInput = $searchInput;

		this.books = this.datasStorage;
	}

	eventFormSubmit() {
		this.$form.addEventListener('submit', (event) => {
			event.preventDefault();

			if(! this.validateForm()) {
				return;
			}

			this.store()
				.formReset()
				.showBooks();
		});

		return this;
	}

	validateForm() {
		if(this.$title.value === '') {
			return false;
		}

		if(this.$author.value === '') {
			return false;
		}

		if(this.$year.value === '') {
			return false;
		}

		return true;
	}

	formReset() {
		this.$form.reset();
		return this;
	}

	store() {
		this.books.push({
			id: +new Date(),
			title: this.$title.value,
			author: this.$author.value,
			year: parseInt(this.$year.value),
			isComplete: this.$isComplete.checked,
		});

		this.datasStorage = this.books;

		alert('Buku berhasil disimpan');

		return this;
	}

	showUnreadBooks(books) {
		this.$unreadBooks.innerHTML = this.generateBookHtml(books);
		return this;
	}

	showReadedBooks(books) {
		this.$readedBooks.innerHTML = this.generateBookHtml(books);
		return this;
	}

	showBooks() {
		const unreadBooks = this.books.filter((book) => book.isComplete === false);
		const readedBooks = this.books.filter((book) => book.isComplete === true);

		this.showUnreadBooks(unreadBooks).showReadedBooks(readedBooks);
	}

	generateBookHtml(books) {
		if(books.length === 0) {
			return '<p class="empty-book">Tidak ada buku</p>';
		}

		return books.map(book => {
			const { id, title, author, year, isComplete } = book;

			return `
				<div class="book">
          <div>
              <p class="__title">${title}</p>
              <p class="__author">${author} | ${year}</p>
          </div>
          <div class="actions">
              <button
              	class="${isComplete === false ? 'btnReaded' : 'btnUnreaded'}"
              	data-id="${id}"
              	type="button"
              >
              	${isComplete === false ? 'Selesai' : 'Batal Selesai'}
              </button>
              <button
              	class="btnDelete"
              	data-id="${id}"
              	type="button"
              >
              	Hapus
              </button>
          </div>
      	</div>
			`;
		})
		.join('');
	}

	eventClickBooks() {
		const eventBook = (event) => {
			const dataId = parseInt(event.target.dataset.id);
			const className = event.target.className;

			// READED / UNREADED
			if(className === 'btnReaded') {
				this.updateBook(dataId, { isComplete: true })
					.showBooks();

				alert('Buku yang dipilih berhasil "Selesai" dibaca');
			}

			if(className === 'btnUnreaded') {
				this.updateBook(dataId, { isComplete: false })
					.showBooks();

				alert('Buku yang dipilih berhasil "Batal Selesai" dibaca');
			}

			// DELETE
			if(className === 'btnDelete') {
				if(confirm('Anda yakin ingin menghapus buku ini?')) {
					this.deleteBook(dataId).showBooks();
					alert('Buku yang dipilih berhasil dihapus');
				}
			}
		}

		this.$unreadBooks.addEventListener('click', event => eventBook(event));
		this.$readedBooks.addEventListener('click', event => eventBook(event));

		return this;
	}

	updateBook(id, newData) {
		this.books = this.books.map(book => {
			if(book.id === id) {
				Object.assign(book, newData);
			}

			return book;
		});

		this.datasStorage = this.books;

		return this;
	}

	deleteBook(id) {
		this.books = this.books.filter((book) => book.id !== id);
		this.datasStorage = this.books;
		return this;
	}

	eventSearchInput() {
		this.$searchInput.addEventListener('keyup', () => {
			const { value } = this.$searchInput;

			if(value === '') {
				this.showBooks();
				return;
			}

			const filterBooks = this.books.filter(book => book.title.toLowerCase().includes( value.toLowerCase() ));

			const unreadBooks = filterBooks.filter((book) => book.isComplete === false);
			this.showUnreadBooks(unreadBooks);

			const readedBooks = filterBooks.filter((book) => book.isComplete === true);
			this.showReadedBooks(readedBooks);
		});

		return this;
	}
}

/*
 * Init Apps
 */
document.addEventListener('DOMContentLoaded', function(){
	const bookshelf = new Bookshelf({
		$form: document.querySelector('#formBook'),
		$unreadBooks: document.querySelector('#unread-books'),
		$readedBooks: document.querySelector('#readed-books'),
		$searchInput: document.querySelector('#search-input'),
		storageKey: 'bookshelf-apps',
	});

	bookshelf.eventFormSubmit()
		.eventClickBooks()
		.eventSearchInput()
		.showBooks();
});
