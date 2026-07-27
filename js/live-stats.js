/* ==========================================
   BookBridge - Dynamic Real-Time Live Stats Manager
========================================== */

const DEFAULT_STATS = {
    students: 10480,
    books: 50210,
    exchanges: 8950
};

// Retrieve current live stats from LocalStorage (starting from baseline)
function getLiveStats() {
    try {
        const stored = JSON.parse(localStorage.getItem("bookbridge_live_stats") || "null");
        const customBooks = JSON.parse(localStorage.getItem("user_uploaded_books") || "[]");
        const extraBooks = Array.isArray(customBooks) ? customBooks.length : 0;

        if (stored && typeof stored === "object") {
            return {
                students: Math.max(DEFAULT_STATS.students, Number(stored.students) || DEFAULT_STATS.students),
                books: Math.max(DEFAULT_STATS.books, (Number(stored.books) || DEFAULT_STATS.books) + extraBooks),
                exchanges: Math.max(DEFAULT_STATS.exchanges, Number(stored.exchanges) || DEFAULT_STATS.exchanges)
            };
        }
    } catch (e) {
        console.error("Error reading live stats:", e);
    }
    return { ...DEFAULT_STATS };
}

// Save stats to LocalStorage
function saveLiveStats(stats) {
    try {
        localStorage.setItem("bookbridge_live_stats", JSON.stringify(stats));
    } catch (e) {
        console.error("Error saving live stats:", e);
    }
}

// Increment a specific stat dynamically
function incrementLiveStat(type, amount = 1) {
    const stats = getLiveStats();
    if (type in stats) {
        stats[type] += amount;
        saveLiveStats(stats);
        updateLiveStatsUI();
    }
}

// Format numbers with commas (e.g., 10,480)
function formatStatNumber(num) {
    return Number(num).toLocaleString('en-IN');
}

// Animate counter from 0 or current value to target value
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

// Update all stat counter elements on the page
function updateLiveStatsUI() {
    const stats = getLiveStats();

    // Select all elements with data-stat-type or data-count attribute
    document.querySelectorAll("[data-stat-type], .hero-stat-value, .stat-value").forEach(el => {
        const type = el.getAttribute("data-stat-type") ||
            (el.nextElementSibling && el.nextElementSibling.textContent.includes("Student") ? "students" :
                el.nextElementSibling && el.nextElementSibling.textContent.includes("Book") ? "books" :
                    el.nextElementSibling && el.nextElementSibling.textContent.includes("Exchange") ? "exchanges" : null);

        if (type && stats[type] !== undefined) {
            const targetVal = stats[type];
            el.setAttribute("data-count", targetVal);
            animateValue(el, 0, targetVal);
        }
    });
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    updateLiveStatsUI();
});
