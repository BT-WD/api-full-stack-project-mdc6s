// Global Selectors
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const findMealBtn = document.getElementById('find-meal-btn');
const mealCategorySelect = document.getElementById('meal-category');
const recipeTitle = document.getElementById('recipe-title');

console.log("UI components styled");
const favBtn = document.getElementById('fav-btn');

// Commit 5: Login and Modal Logic
const loginModal = document.getElementById('login-modal');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('username-input');
const welcomeMessage = document.getElementById('welcome-message');

// Check for existing user in local storage
let currentUser = localStorage.getItem('username') || '';

function checkAuth() {
    if (currentUser) {
        // Hide the modal and show the app
        loginModal.style.display = 'none';
        appContainer.style.display = 'flex';
        welcomeMessage.textContent = `Hello, ${currentUser}!`;
    } else {
        // Show the modal and hide the app
        loginModal.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

// Event listener for Log In button
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        localStorage.setItem('username', username);
        currentUser = username;
        checkAuth();
    } else {
        alert("Please enter a username to start cooking!");
    }
});

// Event listener for Log Out button
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    currentUser = '';
    checkAuth();
});

// Initial check on page load
checkAuth();