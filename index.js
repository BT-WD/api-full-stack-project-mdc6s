// Import Firebase SDK & Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAha4VKuvPV00KpmWM4qZzsds6if8mhoHs",
    authDomain: "recipefinder-2a094.firebaseapp.com",
    projectId: "recipefinder-2a094",
    storageBucket: "recipefinder-2a094.firebasestorage.app",
    messagingSenderId: "996492877277",
    appId: "1:996492877277:web:4c2b8e605fd468bad92a34"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Selectors
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const findMealBtn = document.getElementById('find-meal-btn');
const mealCategory = document.getElementById('meal-category');
const recipeTitle = document.getElementById('recipe-title');
const recipeImg = document.getElementById('recipe-img');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsText = document.getElementById('instructions-text');
const recipeCard = document.getElementById('recipe-card');
const recipeInfo = document.getElementById('recipe-info');

const loginModal = document.getElementById('login-modal');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('username-input');
const welcomeMessage = document.getElementById('welcome-message');
const favBtn = document.getElementById('fav-btn');

let currentUser = localStorage.getItem('username') || '';

function checkAuth() {
    if (currentUser) {
        loginModal.style.display = 'none';
        appContainer.style.display = 'flex';
        welcomeMessage.textContent = `Hello, ${currentUser}!`;
        loadFavorites(); 
    } else {
        loginModal.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

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

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    currentUser = '';
    checkAuth();
});

checkAuth();

// Fetch the 14 categories from the API
async function fetchCategories() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
        const data = await response.json();
        
        // Added a default "Random" option
        mealCategory.innerHTML = '<option value="">Surprise Me (Random)</option>';
        
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

fetchCategories();

function displayMeal(meal) {
    if (!meal) return;

    // Unhide layout elements 
    recipeImg.style.display = 'block';
    recipeInfo.style.display = 'block';
    favBtn.style.display = 'block';

    // Trigger Animation 
    recipeCard.classList.remove('fade-in');
    void recipeCard.offsetWidth; // Force DOM reflow
    recipeCard.classList.add('fade-in');

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

    let formattedInstructions = meal.strInstructions || '';
    if (formattedInstructions) {
        formattedInstructions = formattedInstructions
            .replace(/step\s+(\d+)/gi, '\n\nStep $1. ')
            .trim();
    }
    instructionsText.textContent = formattedInstructions;
}

findMealBtn.addEventListener('click', async () => {
    const selectedCategory = mealCategory.value;
    
    // UI Loading state
    const originalBtnText = findMealBtn.textContent;
    findMealBtn.textContent = 'Fetching...';
    findMealBtn.disabled = true;

    try {
        let meal;
        if (selectedCategory) {
            const filterResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`);
            const filterData = await filterResponse.json();
            
            if (filterData.meals) {
                const randomIndex = Math.floor(Math.random() * filterData.meals.length);
                const randomMeal = filterData.meals[randomIndex];
                
                const detailsResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`);
                const detailsData = await detailsResponse.json();
                meal = detailsData.meals[0];
            } else {
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
                const data = await response.json();
                meal = data.meals[0];
            }
        } else {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data = await response.json();
            meal = data.meals[0];
        }
        
        window.currentFetchedMeal = meal;
        displayMeal(meal);
    } catch (error) {
        console.error("Error fetching meal data:", error);
        alert("Failed to fetch meal. Check console for details.");
    } finally {
        // Reset loading state
        findMealBtn.textContent = originalBtnText;
        findMealBtn.disabled = false;
    }
});

// Firebase Firestore Favorites Functionality
async function loadFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '<li>Loading...</li>';

    if (!currentUser) return;

    try {
        const q = query(collection(db, "favorites"), where("username", "==", currentUser));
        const querySnapshot = await getDocs(q);
        
        favoritesList.innerHTML = ''; // Clear loading text

        if (querySnapshot.empty) {
            favoritesList.innerHTML = '<li class="empty-state">No favorites yet.</li>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const meal = docSnap.data();
            const li = document.createElement('li');
            
            // Cleaned up the layout and added a specific class to the text span
            li.innerHTML = `
                <span class="fav-meal-name" title="Click to view recipe">${meal.strMeal}</span>
                <button class="remove-fav-btn" title="Remove">❌</button>
            `;

            // 1. Event Listener to view the recipe
            const nameSpan = li.querySelector('.fav-meal-name');
            nameSpan.addEventListener('click', async () => {
                // Optional: Show loading state
                recipeTitle.textContent = "Loading recipe...";
                
                try {
                    // Fetch the full details using the saved idMeal
                    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const data = await response.json();
                    
                    if (data.meals) {
                        const fullMeal = data.meals[0];
                        window.currentFetchedMeal = fullMeal; // Update current meal
                        displayMeal(fullMeal); 
                    }
                } catch (error) {
                    console.error("Error fetching favorite meal:", error);
                    alert("Could not load recipe details.");
                }
            });

            // 2. Event listener for the remove button
            const removeBtn = li.querySelector('.remove-fav-btn');
            removeBtn.addEventListener('click', async () => {
                await deleteDoc(doc(db, "favorites", docSnap.id));
                loadFavorites(); 
            });

            favoritesList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading favorites from Firestore: ", error);
        favoritesList.innerHTML = '<li class="empty-state" style="color:red;">Error connecting to DB. Check Rules.</li>';
    }
}

// Event listener for Add to Favs button
favBtn.addEventListener('click', async () => {
    if (window.currentFetchedMeal) {
        const originalText = favBtn.textContent;
        favBtn.textContent = 'Saving...';
        favBtn.disabled = true;

        try {
            const q = query(
                collection(db, "favorites"), 
                where("username", "==", currentUser), 
                where("idMeal", "==", window.currentFetchedMeal.idMeal)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                alert("This meal is already in your favorites list.");
                favBtn.textContent = originalText;
                favBtn.disabled = false;
                return;
            }

            await addDoc(collection(db, "favorites"), {
                username: currentUser,
                idMeal: window.currentFetchedMeal.idMeal,
                strMeal: window.currentFetchedMeal.strMeal,
                strMealThumb: window.currentFetchedMeal.strMealThumb
            });

            loadFavorites();
            favBtn.textContent = '❤️ Added!';
            
            // Reset text after 2 seconds
            setTimeout(() => {
                favBtn.textContent = originalText;
                favBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error("Error adding to favorites: ", error);
            alert("Database Error! Have you set your Firebase Firestore Rules to 'true'?");
            favBtn.textContent = originalText;
            favBtn.disabled = false;
        }
    }
});