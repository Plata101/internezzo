// Lunch Proposal App
class LunchProposal {
  constructor() {
    this.apiUrl = "https://www.themealdb.com/api/json/v1/1/random.php";
    this.currentMeal = null;
    this.currentLanguage = "en";
    this.favorites = this.loadFavorites();
    this.init();
  }

  async init() {
    await this.fetchRandomMeal();
    this.setupEventListeners();
    this.updateFavoritesUI();
    // Wait for Google Translate to initialize
    this.waitForGoogleTranslate();
  }

  async fetchRandomMeal() {
    try {
      this.showLoading();
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.currentMeal = data.meals[0];
      this.displayMeal();
    } catch (error) {
      console.error("Error fetching meal:", error);
      this.showError();
    }
  }

  displayMeal() {
    if (!this.currentMeal) return;

    const meal = this.currentMeal;

    // Update meal details
    document.getElementById("meal-image").src = meal.strMealThumb;
    document.getElementById("meal-image").alt = meal.strMeal;
    document.getElementById("meal-title").textContent = meal.strMeal;
    document.getElementById("meal-category").textContent = meal.strCategory;
    document.getElementById("meal-area").textContent =
      meal.strArea || "International";
    document.getElementById("meal-category-detail").textContent =
      meal.strCategory;
    document.getElementById("meal-instructions").textContent =
      meal.strInstructions;

    // Build ingredients list
    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        const li = document.createElement("li");
        li.className = "flex items-center text-gray-700";
        li.innerHTML = `
          <span class="mr-3 w-2 h-2 bg-orange-400 rounded-full"></span>
          <span class="font-medium">${measure ? measure.trim() : ""}</span>
          <span class="ml-1">${ingredient.trim()}</span>
        `;
        ingredientsList.appendChild(li);
      }
    }

    this.hideLoading();
    this.showMeal();
    this.updateFavoritesUI();
  }

  setupEventListeners() {
    // New proposal buttons
    document
      .getElementById("new-proposal-btn")
      .addEventListener("click", () => {
        this.fetchRandomMeal();
      });

    document
      .getElementById("another-proposal-btn")
      .addEventListener("click", () => {
        this.fetchRandomMeal();
      });

    // Retry button
    document.getElementById("retry-btn").addEventListener("click", () => {
      this.fetchRandomMeal();
    });

    // Language toggle
    document.getElementById("language-toggle").addEventListener("click", () => {
      this.toggleLanguage();
    });

    // Favorites functionality
    document.getElementById("favorite-heart").addEventListener("click", () => {
      if (this.currentMeal) {
        if (this.isFavorite(this.currentMeal.idMeal)) {
          this.removeFromFavorites(this.currentMeal.idMeal);
        } else {
          this.addToFavorites(this.currentMeal);
        }
      }
    });

    // Favorites dropdown toggle
    document.getElementById("favorites-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleFavoritesDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("favorites-dropdown");
      const favoritesBtn = document.getElementById("favorites-btn");

      if (!dropdown.contains(e.target) && !favoritesBtn.contains(e.target)) {
        this.closeFavoritesDropdown();
      }
    });

    // Show more instructions
    document.getElementById("show-more-btn").addEventListener("click", (e) => {
      const instructionsElement = document.getElementById("meal-instructions");
      const button = e.target;

      if (instructionsElement.classList.contains("line-clamp-4")) {
        instructionsElement.classList.remove("line-clamp-4");
        button.textContent = "← Show less";
      } else {
        instructionsElement.classList.add("line-clamp-4");
        button.textContent = "Show full recipe →";
      }
    });
  }

  toggleLanguage() {
    const languageText = document.getElementById("language-text");

    if (this.currentLanguage === "en") {
      // Switch to German
      this.translateToGerman();
      languageText.textContent = "DE";
      this.currentLanguage = "de";
    } else {
      // Switch to English
      this.translateToEnglish();
      languageText.textContent = "EN";
      this.currentLanguage = "en";
    }
  }

  waitForGoogleTranslate() {
    // Wait for Google Translate to be fully loaded
    const checkGoogleTranslate = () => {
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        console.log("Google Translate loaded successfully");
        return true;
      }
      return false;
    };

    // Check every 100ms for up to 10 seconds
    let attempts = 0;
    const maxAttempts = 100;

    const interval = setInterval(() => {
      attempts++;
      if (checkGoogleTranslate() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          console.log("Google Translate failed to load");
        }
      }
    }, 100);
  }

  translateToGerman() {
    console.log("Switching to German");

    // Set Google Translate cookie to German
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/de; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/de; path=/`;

    // Reload the page to apply translation
    window.location.reload();
  }

  translateToEnglish() {
    console.log("Switching to English");

    // Clear Google Translate cookie to return to original language
    const domain = window.location.hostname;
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Reload the page to remove translation
    window.location.reload();
  }

  showLoading() {
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("meal-card").classList.add("hidden");
    document.getElementById("error-state").classList.add("hidden");
  }

  hideLoading() {
    document.getElementById("loading").classList.add("hidden");
  }

  showMeal() {
    document.getElementById("meal-card").classList.remove("hidden");
    document.getElementById("error-state").classList.add("hidden");
  }

  showError() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("meal-card").classList.add("hidden");
    document.getElementById("error-state").classList.remove("hidden");
  }

  // Favorites functionality
  loadFavorites() {
    const saved = sessionStorage.getItem("lunchFavorites");
    return saved ? JSON.parse(saved) : [];
  }

  saveFavorites() {
    sessionStorage.setItem("lunchFavorites", JSON.stringify(this.favorites));
  }

  addToFavorites(meal) {
    const exists = this.favorites.find((fav) => fav.idMeal === meal.idMeal);
    if (!exists) {
      this.favorites.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea,
        savedAt: new Date().toISOString(),
      });
      this.saveFavorites();
      this.updateFavoritesUI();
      return true;
    }
    return false;
  }

  removeFromFavorites(mealId) {
    this.favorites = this.favorites.filter((fav) => fav.idMeal !== mealId);
    this.saveFavorites();
    this.updateFavoritesUI();
  }

  isFavorite(mealId) {
    return this.favorites.some((fav) => fav.idMeal === mealId);
  }

  updateFavoritesUI() {
    // Update favorites count
    document.getElementById("favorites-count").textContent =
      this.favorites.length;

    // Update heart icon
    const heartIcon = document.getElementById("heart-icon");
    const heartButton = document.getElementById("favorite-heart");
    if (this.currentMeal && this.isFavorite(this.currentMeal.idMeal)) {
      heartIcon.textContent = "♥";
      heartButton.style.color = "#ef4444";
      heartButton.title = "Remove from favorites";
    } else {
      heartIcon.textContent = "♡";
      heartButton.style.color = "#6b7280";
      heartButton.title = "Add to favorites";
    }

    // Update favorites dropdown
    this.updateFavoritesDropdown();
  }

  updateFavoritesDropdown() {
    const favoritesList = document.getElementById("favorites-list");

    if (this.favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <span class="text-4xl">♥</span>
          <p class="mt-2">No favorites yet</p>
          <p class="text-sm text-gray-400">Click the heart on any meal to save it!</p>
        </div>
      `;
      return;
    }

    favoritesList.innerHTML = this.favorites
      .map(
        (favorite) => `
      <div class="p-3 rounded-lg border-b border-gray-100 transition-colors cursor-pointer favorite-item hover:bg-gray-50 last:border-b-0" data-meal-id="${
        favorite.idMeal
      }">
        <div class="flex items-center space-x-3">
          <img src="${favorite.strMealThumb}" alt="${
          favorite.strMeal
        }" class="object-cover w-12 h-12 rounded-lg">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-800 truncate">${
              favorite.strMeal
            }</h4>
            <p class="text-xs text-gray-500">${favorite.strCategory} • ${
          favorite.strArea || "International"
        }</p>
          </div>
          <button class="text-gray-400 transition-colors remove-favorite hover:text-red-500" data-meal-id="${
            favorite.idMeal
          }" title="Remove from favorites">
            <span class="text-lg">×</span>
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners for favorite items
    favoritesList.querySelectorAll(".favorite-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".remove-favorite")) {
          const mealId = item.dataset.mealId;
          this.loadFavoriteMeal(mealId);
          this.closeFavoritesDropdown();
        }
      });
    });

    // Add event listeners for remove buttons
    favoritesList.querySelectorAll(".remove-favorite").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const mealId = button.dataset.mealId;
        this.removeFromFavorites(mealId);
      });
    });
  }

  async loadFavoriteMeal(mealId) {
    try {
      this.showLoading();
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.meals && data.meals[0]) {
        this.currentMeal = data.meals[0];
        this.displayMeal();
      } else {
        throw new Error("Meal not found");
      }
    } catch (error) {
      console.error("Error loading favorite meal:", error);
      this.showError();
    }
  }

  toggleFavoritesDropdown() {
    const dropdown = document.getElementById("favorites-dropdown");
    dropdown.classList.toggle("hidden");
  }

  closeFavoritesDropdown() {
    document.getElementById("favorites-dropdown").classList.add("hidden");
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LunchProposal();
});
