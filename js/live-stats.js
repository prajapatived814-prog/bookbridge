/* ==========================================
   BookBridge - Dynamic Real-Time Live Stats Manager
   Calculates stats dynamically from real system database & API
========================================== */

async function getLiveStats() {
    try {
        let users = [];
        let books = [];
        let offers = [];

        if (window.BookAPI && typeof window.BookAPI.getAllUsers === 'function') {
            users = await window.BookAPI.getAllUsers();
            books = await window.BookAPI.getBooks();
        } else if (window.BookDB && typeof window.BookDB.getAllUsers === 'function') {
            users = await window.BookDB.getAllUsers();
            books = await window.BookDB.getBooks();
        } else {
            users = JSON.parse(localStorage.getItem('rcti_gtu_users') || '[]');
            books = JSON.parse(localStorage.getItem('rcti_gtu_lab_manual_books') || '[]');
        }

        offers = JSON.parse(localStorage.getItem('rcti_gtu_offers') || '[]');

        const totalStudents = Array.isArray(users) ? users.length : 0;
        const totalBooks = Array.isArray(books) ? books.length : 0;
        const exchangeBooks = Array.isArray(books) ? books.filter(b => b.mode === 'exchange').length : 0;
        const donatedBooks = Array.isArray(books) ? books.filter(b => b.mode === 'donate' || b.price === 0).length : 0;
        const totalSaved = Array.isArray(books) ? books.reduce((sum, b) => sum + (parseFloat(b.original) || 300), 0) : 0;

        return {
            students: totalStudents,
            books: totalBooks,
            exchanges: Math.max(exchangeBooks, offers.length),
            donated: donatedBooks,
            saved: totalSaved
        };
    } catch (e) {
        console.error("Error calculating real-time live stats:", e);
        return { students: 0, books: 0, exchanges: 0, donated: 0, saved: 0 };
    }
}

// Format numbers with commas (e.g., 1,048 or 10)
function formatStatNumber(num) {
    return Number(num).toLocaleString('en-IN');
}

// Animate counter from start to end value
function animateValue(element, start, end, duration = 1200) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        element.textContent = formatStatNumber(currentVal);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = formatStatNumber(end);
        }
    };
    window.requestAnimationFrame(step);
}

// Update all stat counter elements on the page with real database metrics
async function updateLiveStatsUI() {
    const stats = await getLiveStats();

    // Select all elements with data-stat-type or data-count attribute
    document.querySelectorAll("[data-stat-type], .hero-stat-value, .stat-value").forEach(el => {
        const type = el.getAttribute("data-stat-type") ||
            (el.nextElementSibling && el.nextElementSibling.textContent.includes("Student") ? "students" :
                el.nextElementSibling && el.nextElementSibling.textContent.includes("Book") ? "books" :
                    el.nextElementSibling && el.nextElementSibling.textContent.includes("Exchange") ? "exchanges" :
                        el.nextElementSibling && el.nextElementSibling.textContent.includes("Donate") ? "donated" : null);

        if (type && stats[type] !== undefined) {
            const targetVal = stats[type];
            const currentVal = parseInt(el.getAttribute("data-count")) || 0;
            el.setAttribute("data-count", targetVal);
            animateValue(el, currentVal, targetVal);
        }
    });

    // Update Category Counts dynamically if elements exist
    try {
        let books = [];
        if (window.BookAPI && typeof window.BookAPI.getBooks === 'function') {
            books = await window.BookAPI.getBooks();
        } else if (window.BookDB && typeof window.BookDB.getBooks === 'function') {
            books = await window.BookDB.getBooks();
        } else {
            books = JSON.parse(localStorage.getItem('rcti_gtu_lab_manual_books') || '[]');
        }

        if (Array.isArray(books)) {
            const counts = {
                CE: books.filter(b => (b.branch || '').toUpperCase() === 'CE').length,
                IT: books.filter(b => (b.branch || '').toUpperCase() === 'IT').length,
                EE: books.filter(b => (b.branch || '').toUpperCase() === 'EE').length,
                ME: books.filter(b => (b.branch || '').toUpperCase() === 'ME').length,
                Civil: books.filter(b => (b.branch || '').toUpperCase() === 'CIVIL').length,
                Science: books.filter(b => (b.branch || '').toUpperCase() === 'IC' || (b.subject || '').toLowerCase().includes('science') || (b.genre || '').toLowerCase().includes('science')).length,
                Physics: books.filter(b => (b.subject || '').toLowerCase().includes('physics') || (b.title || '').toLowerCase().includes('physics')).length,
                General: books.filter(b => !['CE', 'IT', 'EE', 'ME', 'CIVIL'].includes((b.branch || '').toUpperCase())).length
            };

            document.querySelectorAll('[data-dept-count]').forEach(el => {
                const dept = el.getAttribute('data-dept-count');
                if (dept && counts[dept] !== undefined) {
                    const cnt = counts[dept];
                    el.textContent = `${cnt} Book${cnt !== 1 ? 's' : ''} & Manuals`;
                }
            });
        }
    } catch (err) {
        console.error("Error updating category counts:", err);
    }
}

// Global hook to trigger live stats update after book additions / user registrations
window.updateLiveStatsUI = updateLiveStatsUI;

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    updateLiveStatsUI();
});
