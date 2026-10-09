"use strict";
const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const STORAGE_KEY = "shiguang:last-search:v1";
const searchInput = document.getElementById("search-input");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const statusText = document.getElementById("search-status");
let searchController;
let detailController;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function safeURL(value) {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; }
  catch { return ""; }
}
function mealImage(meal, className) {
  const img = element("img", className);
  const url = safeURL(meal.strMealThumb);
  if (url) img.src = url;
  img.alt = meal.strMeal || "Recipe image";
  img.loading = "lazy";
  return img;
}
async function fetchMeals(endpoint, controller) {
  const timeout = setTimeout(() => controller.abort("timeout"), 15000);
  try {
    const response = await fetch(BASE_URL + endpoint, { signal: controller.signal });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (data.meals !== null && !Array.isArray(data.meals)) throw new Error("Invalid response");
    return data.meals || [];
  } finally { clearTimeout(timeout); }
}
function showError(message) { errorContainer.textContent = message; errorContainer.classList.remove("hidden"); }
function displayMeals(meals) {
  mealsContainer.replaceChildren();
  for (const meal of meals) {
    const card = element("button", "meal");
    card.type = "button";
    card.dataset.mealId = meal.idMeal;
    card.setAttribute("aria-label", "View recipe for " + meal.strMeal);
    const info = element("div", "meal-info");
    info.append(element("span", "meal-category", meal.strCategory || "Recipe"), element("h3", "meal-title", meal.strMeal));
    const bottom = element("div", "card-bottom");
    bottom.append(element("span", "", meal.strArea || "World cuisine"), element("span", "", "View recipe ↗"));
    info.append(bottom);
    card.append(mealImage(meal), info);
    mealsContainer.append(card);
  }
}
function showResults(term, meals, restored = false) {
  resultHeading.textContent = `Search results for "${term}":`;
  document.getElementById("result-count").textContent = `${meals.length} recipes${restored ? " · Last search" : ""}`;
  displayMeals(meals);
  statusText.textContent = `Found ${meals.length} recipes`;
  if (!meals.length) showError(`No recipes found for "${term}". Try another search term!`);
}
async function searchMeals(event) {
  event?.preventDefault();
  const term = searchInput.value.trim();
  if (!term) { showError("Please enter a search term."); searchInput.focus(); return; }
  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  errorContainer.classList.add("hidden");
  document.getElementById("empty-state").classList.add("hidden");
  resultHeading.textContent = `Searching for "${term}"...`;
  statusText.textContent = "Searching for recipes";
  document.getElementById("result-count").textContent = "";
  mealsContainer.replaceChildren();
  mealsContainer.setAttribute("aria-busy", "true");
  try {
    const meals = await fetchMeals("search.php?s=" + encodeURIComponent(term), controller);
    if (controller !== searchController) return;
    showResults(term, meals);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ term, meals })); } catch { /* Storage is optional. */ }
  } catch {
    if (controller !== searchController) return;
    resultHeading.textContent = "Recipes are temporarily unavailable";
    statusText.textContent = "Search failed";
    showError("The connection failed or timed out. Please check your connection and try again.");
  } finally { if (controller === searchController) mealsContainer.removeAttribute("aria-busy"); }
}
function renderDetails(meal) {
  mealDetailsContent.replaceChildren();
  mealDetailsContent.append(mealImage(meal, "meal-details-img"));
  const title = element("h2", "meal-details-title", meal.strMeal);
  title.id = "detail-title";
  mealDetailsContent.append(title);
  for (const tag of [meal.strCategory, meal.strArea].filter(Boolean)) mealDetailsContent.append(element("span", "detail-tag", tag));
  const columns = element("div", "detail-columns");
  const ingredients = element("section");
  ingredients.append(element("h3", "", "Ingredients"));
  const list = element("ul", "ingredients-list");
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    if (ingredient) list.append(element("li", "", `${meal[`strMeasure${i}`]?.trim() || ""} ${ingredient}`.trim()));
  }
  ingredients.append(list);
  const instructions = element("section");
  instructions.append(element("h3", "", "Instructions"), element("p", "instructions", meal.strInstructions || "No instructions available."));
  columns.append(ingredients, instructions);
  mealDetailsContent.append(columns);
  const videoURL = safeURL(meal.strYoutube);
  if (videoURL) {
    const video = element("a", "youtube-link", "▷ Watch Video");
    video.href = videoURL; video.target = "_blank"; video.rel = "noopener noreferrer";
    mealDetailsContent.append(video);
  }
}
async function handleMealClick(event) {
  const card = event.target.closest(".meal");
  if (!card) return;
  detailController?.abort();
  const controller = new AbortController(); detailController = controller;
  const loading = element("h2", "", "Loading recipe..."); loading.id = "detail-title";
  mealDetailsContent.replaceChildren(loading);
  mealDetails.showModal(); mealDetails.scrollTop = 0;
  try {
    const meals = await fetchMeals("lookup.php?i=" + encodeURIComponent(card.dataset.mealId), controller);
    if (controller !== detailController || !mealDetails.open) return;
    if (!meals[0]) throw new Error("Recipe not found");
    renderDetails(meals[0]);
  } catch {
    if (controller !== detailController || !mealDetails.open) return;
    loading.textContent = "Could not load recipe";
    mealDetailsContent.append(element("p", "notice", "Please go back to the results and select the recipe to try again."));
  }
}
document.getElementById("search-form").addEventListener("submit", searchMeals);
document.querySelectorAll("[data-search]").forEach(button => button.addEventListener("click", () => { searchInput.value = button.dataset.search; searchMeals(); }));
mealsContainer.addEventListener("click", handleMealClick);
document.getElementById("back-btn").addEventListener("click", () => mealDetails.close());
mealDetails.addEventListener("close", () => { detailController?.abort(); detailController = null; });
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved.term === "string" && Array.isArray(saved.meals) && saved.meals.every(meal => meal && typeof meal.idMeal === "string" && typeof meal.strMeal === "string")) {
    searchInput.value = saved.term;
    document.getElementById("empty-state").classList.add("hidden");
    showResults(saved.term, saved.meals, true);
  }
} catch { /* Ignore unavailable or damaged local storage. */ }
