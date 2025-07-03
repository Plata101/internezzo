// Lunch Proposal App
class LunchProposal {
  constructor() {
    this.apiUrl = "https://www.themealdb.com/api/json/v1/1/random.php";
    this.currentMeal = null;
    this.init();
  }

  async init() {
    await this.fetchRandomMeal();
    this.setupEventListeners();
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
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LunchProposal();
});
