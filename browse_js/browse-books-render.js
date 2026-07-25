
/* ==========================================
   BookBridge - Browse Books Render
========================================== */

/* ==========================================
   Render Books Function
========================================== */

function renderBooks(bookList = books) {

    // Get the Books Container
    const booksContainer = document.getElementById("booksContainer");

    // Get the Book Count Element
    const bookCount = document.getElementById("bookCount");

    // Clear Previous Books
    booksContainer.innerHTML = "";

    // Update Total Books Count
    bookCount.textContent = bookList.length;

    // If No Books Are Available
    if (bookList.length === 0) {

        booksContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4 class="text-muted">No Books Found</h4>
                <p>Try changing your search or filters.</p>
            </div>
        `;

        return;
    }

    // Loop Through Every Book
    bookList.forEach(book => {

        // Show Price or Donate
        const priceText =
            book.type === "Donate"
                ? "Donate"
                : `₹${book.price}`;

        // Create Book Card
        const bookCard = `

            <div class="col-12 col-sm-6 col-md-4 col-lg-3 book-column">

                <div class="book-card">

                    <!-- Book Image -->
                    <img
                        src="${book.image}"
                        alt="${book.title}"
                        class="book-image">

                    <div class="book-content">

                        <!-- Book Badges -->
                        <div class="book-badges">

                            <span>${book.department}</span>

                            <span>Sem ${book.semester}</span>

                            <span>${book.category}</span>

                        </div>

                        <!-- Book Title -->
                        <h5 class="book-title">

                            ${book.title}

                        </h5>

                        <!-- Book Author -->
                        <p class="book-author">

                            ${book.author}

                        </p>

                        <!-- Book Price -->
                        <div class="book-price">

                            ${priceText}

                        </div>

                        <!-- Book Condition -->
                        <div class="book-condition">

                            ${book.condition}

                        </div>

                        <!-- View Details Button -->
                        <button
                            class="view-btn"
                            data-id="${book.id}">

                            View Details

                        </button>

                    </div>

                </div>

            </div>

        `;

        // Add Book Card To Page
        booksContainer.innerHTML += bookCard;

    });

}

/* ==========================================
   View Details Modal Event Listener
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const booksContainer = document.getElementById("booksContainer");
    if (booksContainer) {
        booksContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".view-btn");
            if (!btn) return;

            const bookId = Number(btn.getAttribute("data-id"));
            const book = books.find(b => b.id === bookId);
            if (!book) return;

            const modalImg = document.getElementById("modalBookImage");
            if (modalImg) { modalImg.src = book.image; modalImg.alt = book.title; }

            const titleEl = document.getElementById("modalBookTitle");
            if (titleEl) titleEl.textContent = book.title;

            const authorEl = document.getElementById("modalBookAuthor");
            if (authorEl) authorEl.textContent = book.author;

            const deptEl = document.getElementById("modalBookDepartment");
            if (deptEl) deptEl.textContent = book.department;

            const semEl = document.getElementById("modalBookSemester");
            if (semEl) semEl.textContent = `Semester ${book.semester}`;

            const catEl = document.getElementById("modalBookCategory");
            if (catEl) catEl.textContent = book.category;

            const condEl = document.getElementById("modalBookCondition");
            if (condEl) condEl.textContent = book.condition;

            const typeEl = document.getElementById("modalBookType");
            if (typeEl) typeEl.textContent = book.type;

            const priceEl = document.getElementById("modalBookPrice");
            if (priceEl) priceEl.textContent = book.type === "Donate" ? "Free (Donate)" : `₹${book.price}`;

            const modalElement = document.getElementById("bookDetailsModal");
            if (modalElement && typeof bootstrap !== "undefined") {
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                modal.show();
            }
        });
    }
});
