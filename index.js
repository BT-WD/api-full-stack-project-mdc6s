// Global Selectors
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const findMealBtn = document.getElementById('find-meal-btn');
const mealCategorySelect = document.getElementById('meal-category');
const recipeTitle = document.getElementById('recipe-title');
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
// Render Fetched Data to the UI
const recipeImg = document.getElementById('recipe-img');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsText = document.getElementById('instructions-text');

// Function to display the meal data on screen
function displayMeal(meal) {
    if (!meal) return;

    // 1. Update Title and Image
    recipeTitle.textContent = meal.strMeal;
    recipeImg.src = meal.strMealThumb;
    recipeImg.alt = meal.strMeal;

    // 2. Clear previous ingredients
    ingredientsList.innerHTML = '';

    // 3. Loop through the 20 possible ingredients from TheMealDB
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== '') {
            const li = document.createElement('li');
            li.textContent = `${measure} - ${ingredient}`;
            ingredientsList.appendChild(li);
        }
    }

    // 4. Populate Instructions
    instructionsText.textContent = meal.strInstructions;
}

// Modify the find button behavior to update the UI (appended to your existing click event or overwrite it)
document.getElementById('find-meal-btn').addEventListener('click', () => {
    if (window.currentFetchedMeal) {
        displayMeal(window.currentFetchedMeal);
    }
});