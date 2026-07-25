
/* ==========================================
   BookBridge - Browse Books Search
========================================== */

/* ==========================================
   Search Books
========================================== */

function searchBooks() {

    // Apply Search, Filters and Sorting
    applyFilters();

}

/* ==========================================
   Search Event
========================================== */

document
    .getElementById("searchInput")
    .addEventListener("input", searchBooks);

