// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Constants for storage keys
const STORAGE_KEY = "quotes";
const FILTER_KEY = "selectedCategory";

// Mock API endpoint (JSONPlaceholder fake API)
const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Using posts endpoint as mock

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");

// Load saved quotes from localStorage or initialize
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch {
      console.warn("Could not parse stored quotes, using default.");
    }
  }
}

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  populateCategories();
}

// Show random quote (filtered by selected category)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value || "all";
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${text}"</p><small>- ${category}</small>`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

// Add a new quote from user input
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please fill in both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");

  // Sync new quote with server (POST)
  postQuoteToServer({ text, category });
}

// Populate categories dropdown dynamically
function populateCategories() {
  // Save currently selected to restore later
  const currentSelection = categoryFilter.value;

  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category (or saved in localStorage)
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter && categories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = currentSelection || "all";
  }
}

// Filter quotes when user changes category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selected);
  showRandomQuote();
}

// Simulate fetching quotes from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    // For demo, transform posts into quote-like objects:
    // Use 'title' as text, 'body' as category (just for mock)
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: post.body.length > 10 ? post.body.slice(0, 10) : "General"
    }));

    console.log("Fetched quotes from server:", serverQuotes);

    // Conflict resolution: Server data takes precedence
    mergeServerQuotes(serverQuotes);
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
  }
}

// Merge server quotes with local quotes, prioritizing server data
function mergeServerQuotes(serverQuotes) {
  // We replace local quotes with server quotes for simplicity
  quotes = serverQuotes;

  saveQuotes();
  populateCategories();
  showRandomQuote();

  notifyUser("Quotes updated from server.");
}

// Simulate POSTing a new quote to the server (mock)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });

    if (!response.ok) throw new Error("Failed to post quote to server");

    const result = await response.json();
    console.log("Posted quote to server:", result);
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// Sync quotes periodically by fetching from server
function syncQuotes() {
  fetchQuotesFromServer();
}

// Show notification area (create if not exist)
function notifyUser(message) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.bottom = "10px";
    notification.style.right = "10px";
    notification.style.backgroundColor = "#333";
    notification.style.color = "#fff";
    notification.style.padding = "10px 15px";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.style.opacity = "1";

  // Fade out after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
  }, 3000);
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);

// Initialization
loadQuotes();
populateCategories();

// Show last viewed quote from session or random quote on load
const lastQuoteJSON = sessionStorage.getItem("lastQuote");
if (lastQuoteJSON) {
  const lastQuote = JSON.parse(lastQuoteJSON);
  quoteDisplay.innerHTML = `<p>"${lastQuote.text}"</p><small>- ${lastQuote.category}</small>`;
} else {
  showRandomQuote();
}

// Start periodic sync every 30 seconds (30000 ms)
setInterval(syncQuotes, 30000);

// Initial sync on page load
syncQuotes();
