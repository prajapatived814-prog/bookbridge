
/* ==========================================
   BookBridge - Browse Books Filter
========================================== */

/* ==========================================
   Apply Selected Filters
========================================== */

function applyFilters() {

    // Create Copy Of Books Array
    let filteredBooks = [...books];

    /* ==========================================
       Get Search Value
    ========================================== */

    const searchValue = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    /* ==========================================
       Get Selected Filter Values
    ========================================== */

    const category = document.getElementById("categoryFilter").value;
    const department = document.getElementById("departmentFilter").value;
    const semester = document.getElementById("semesterFilter").value;
    const condition = document.getElementById("conditionFilter").value;
    const maxPrice = Number(document.getElementById("priceRange").value);

    /* ==========================================
       Search Filter
    ========================================== */

    if (searchValue) {

        filteredBooks = filteredBooks.filter(book =>

            book.title.toLowerCase().includes(searchValue) ||

            book.author.toLowerCase().includes(searchValue) ||

            book.department.toLowerCase().includes(searchValue) ||

            book.category.toLowerCase().includes(searchValue)

        );

    }

    /* ==========================================
       Category Filter
    ========================================== */

    if (category) {

        filteredBooks = filteredBooks.filter(book =>

            book.category === category

        );

    }

    /* ==========================================
       Department Filter
    ========================================== */

    if (department) {

        filteredBooks = filteredBooks.filter(book =>

            book.department === department

        );

    }

    /* ==========================================
       Semester Filter
    ========================================== */

    if (semester) {

        filteredBooks = filteredBooks.filter(book =>

            book.semester.toString() === semester

        );

    }

    /* ==========================================
       Condition Filter
    ========================================== */

    if (condition) {

        filteredBooks = filteredBooks.filter(book =>

            book.condition === condition

        );

    }

    /* ==========================================
       Price Filter
    ========================================== */

    filteredBooks = filteredBooks.filter(book =>

        book.type === "Donate" ||

        book.price <= maxPrice

    );

    /* ==========================================
       Sort Books
    ========================================== */

    filteredBooks = sortBooks(filteredBooks);

    /* ==========================================
       Display Books
    ========================================== */

    renderBooks(filteredBooks);

}

/* ==========================================
   Clear All Filters
========================================== */

function clearFilters() {

    // Clear Search
    document.getElementById("searchInput").value = "";

    // Reset Filters
    document.getElementById("categoryFilter").value = "";
    document.getElementById("departmentFilter").value = "";
    document.getElementById("semesterFilter").value = "";
    document.getElementById("conditionFilter").value = "";

    // Reset Price
    document.getElementById("priceRange").value = 1200;
    document.getElementById("priceValue").textContent = "₹1200";

    // Display All Books
    let filteredBooks = [...books];

    filteredBooks = sortBooks(filteredBooks);

    renderBooks(filteredBooks);

}

/* ==========================================
   Apply Filter Button Event
========================================== */

document
    .getElementById("applyFilterBtn")
    .addEventListener("click", applyFilters);

/* ==========================================
   Clear Filter Button Event
========================================== */

document
    .getElementById("clearFilterBtn")
    .addEventListener("click", clearFilters);

/* ==========================================
   Price Range Event
========================================== */

const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

priceRange.addEventListener("input", () => {

    priceValue.textContent = `₹${priceRange.value}`;

});
