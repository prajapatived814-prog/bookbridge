
/* ==========================================
   BookBridge - Browse Books Sort
========================================== */

/* ==========================================
   Sort Books
========================================== */

function sortBooks(bookList) {

    // Get Selected Sort Option
    const sortOption = document.getElementById("sortBooks").value;

    // Create Copy Of Book List
    let sortedBooks = [...bookList];

    /* ==========================================
       Sort : Name (A - Z)
    ========================================== */

    if (sortOption === "titleAZ") {

        sortedBooks.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    }

    /* ==========================================
       Sort : Name (Z - A)
    ========================================== */

    else if (sortOption === "titleZA") {

        sortedBooks.sort((a, b) =>
            b.title.localeCompare(a.title)
        );

    }

    /* ==========================================
       Sort : Price (Low - High)
    ========================================== */

    else if (sortOption === "priceLowHigh") {

        sortedBooks.sort((a, b) =>
            a.price - b.price
        );

    }

    /* ==========================================
       Sort : Price (High - Low)
    ========================================== */

    else if (sortOption === "priceHighLow") {

        sortedBooks.sort((a, b) =>
            b.price - a.price
        );

    }

    // Return Sorted Books
    return sortedBooks;

}

/* ==========================================
   Sort Dropdown Event
========================================== */

document
    .getElementById("sortBooks")
    .addEventListener("change", applyFilters);





