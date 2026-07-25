/* ==========================================================
                    BOOK BRIDGE LOGIN JS
========================================================== */

// ===========================
// Password Show / Hide
// ===========================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});


// ===========================
// Login Form Validation
// ===========================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = passwordInput.value.trim();

    // Empty Validation

    if (email === "" || password === "") {

        alert("Please fill in all fields.");

        return;

    }

    // Email Validation

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        return;

    }

    // Password Length

    if (password.length < 6) {

        alert("Password must be at least 6 characters.");

        return;

    }

    // Success

    alert("Login Successful!");

    // Redirect

    // Login successful
alert("Login Successful!");
window.location.href = "../BrowseBooks/browse-books.html";

});


// ===========================
// Enter Key Login
// ===========================

document.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        loginForm.requestSubmit();

    }

});


// ===========================
// Input Focus Animation
// ===========================

const inputs = document.querySelectorAll(".input-box input");

inputs.forEach((input) => {

    input.addEventListener("focus", () => {

        input.parentElement.style.borderColor = "#3E6B3A";

    });

    input.addEventListener("blur", () => {

        input.parentElement.style.borderColor = "#d9d9d9";

    });

});


// ===========================
// Google Button (Temporary)
// ===========================

const googleBtn = document.querySelector(".google-btn");

googleBtn.addEventListener("click", () => {

    alert("Google Login will be available soon.");

});


// ===========================
// Remember Me
// ===========================

const rememberCheckbox =
    document.querySelector('input[type="checkbox"]');

rememberCheckbox.addEventListener("change", () => {

    if (rememberCheckbox.checked) {

        console.log("Remember Me Enabled");

    } else {

        console.log("Remember Me Disabled");

    }

});


/* ==========================================================
                    END OF FILE
========================================================== */