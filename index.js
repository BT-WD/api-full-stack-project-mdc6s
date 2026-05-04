// Global Selectors
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const findMealBtn = document.getElementById('find-meal-btn');
const mealCategorySelect = document.getElementById('meal-category');
const recipeTitle = document.getElementById('recipe-title');

console.log("UI components styled");
const favBtn = document.getElementById('fav-btn');

// Login and Modal Logic
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

// TheMealDB API Integration
const mealCategory = document.getElementById('meal-category');

// Fetch the 14 categories from the API
async function fetchCategories() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        
        // Clear existing placeholder
        mealCategory.innerHTML = '';
        
        // Populate dropdown with categories
        data.meals.forEach(category => {
            const option = document.createElement('option');
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            mealCategory.appendChild(option);
        });
    } catch (error) {
        console.error("Could not fetch categories:", error);
        mealCategory.innerHTML = '<option value="">Error loading categories</option>';
    }
}

// Initialize the dropdown on load
fetchCategories();

// Function to fetch a random meal from the API
findMealBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        const meal = data.meals[0];
        
        // Store the meal data globally so we can display/save it later
        window.currentFetchedMeal = meal;
        console.log("Meal successfully fetched:", meal.strMeal);
        
        // Let user know it was fetched successfully
        alert(`Fetched: ${meal.strMeal}`);
    } catch (error) {
        console.error("Error fetching meal data:", error);
        alert("Failed to fetch meal. Check console for details.");
    }
});