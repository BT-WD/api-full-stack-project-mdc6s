// Firebase Initialization & Filtered API Logic

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhA4VKuvPV00KpmWM4qZzsds6if8mhoHs",
    authDomain: "recipefinder-2a094.firebaseapp.com",
    projectId: "recipefinder-2a094",
    storageBucket: "recipefinder-2a094.firebasestorage.app",
    messagingSenderId: "996492877277",
    appId: "1:996492877277:web:4c2b8e605fd468bad92a34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully.");

// Global Selectors
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const findMealBtn = document.getElementById('find-meal-btn');
const mealCategory = document.getElementById('meal-category');
const recipeTitle = document.getElementById('recipe-title');
const recipeImg = document.getElementById('recipe-img');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsText = document.getElementById('instructions-text');

const loginModal = document.getElementById('login-modal');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('username-input');
const welcomeMessage = document.getElementById('welcome-message');
const favBtn = document.getElementById('fav-btn');

console.log("UI components styled and selectors defined.");

// Check for existing user in local storage
let currentUser = localStorage.getItem('username') || '';

function checkAuth() {
    if (currentUser) {
        loginModal.style.display = 'none';
        appContainer.style.display = 'flex';
        welcomeMessage.textContent = `Hello, ${currentUser}!`;
    } else {
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

// Fetch the 14 categories from the API
async function fetchCategories() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        
        mealCategory.innerHTML = '';
        
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

// Function to display fetched data
function displayMeal(meal) {
    if (!meal) return;

    recipeTitle.textContent = meal.strMeal;
    recipeImg.src = meal.strMealThumb;
    recipeImg.alt = meal.strMeal;

    ingredientsList.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== '') {
            const li = document.createElement('li');
            li.textContent = `${measure} - ${ingredient}`;
            ingredientsList.appendChild(li);
        }
    }

    instructionsText.textContent = meal.strInstructions;
}

// Update the findMealBtn behavior to filter by Category first
findMealBtn.addEventListener('click', async () => {
    const selectedCategory = mealCategory.value;
    try {
        let meal;
        
        if (selectedCategory) {
            // Fetch the meals specific to the selected category
            const filterResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`);
            const filterData = await filterResponse.json();
            
            if (filterData.meals) {
                // Pick a random meal index from the filtered array
                const randomIndex = Math.floor(Math.random() * filterData.meals.length);
                const randomMeal = filterData.meals[randomIndex];
                
                // Fetch the full details for the specific meal
                const detailsResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`);
                const detailsData = await detailsResponse.json();
                meal = detailsData.meals[0];
            } else {
                alert("No meals found for this category, falling back to random selection.");
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
                const data = await response.json();
                meal = data.meals[0];
            }
        } else {
            // Default random
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data = await response.json();
            meal = data.meals[0];
        }
        
        window.currentFetchedMeal = meal;
        displayMeal(meal);
        console.log("Meal successfully fetched:", meal.strMeal);
    } catch (error) {
        console.error("Error fetching meal data:", error);
        alert("Failed to fetch meal. Check console for details.");
    }
});