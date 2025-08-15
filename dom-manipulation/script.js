// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// --- STORAGE KEYS ---
const STORAGE_KEY = "quotes";
const FILTER_KEY = "selectedCategory";

// --- SERVER SYNC URL ---
// Replace this URL with your mock server endpoint URL serving JSON quotes
const SERVER_QUOTES_URL = "https://my-json-server.typicode.com/yourusername/yourrepo/quotes";

// --- Load quotes from localStorage on init ---
function loadQuotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// --- Save quotes to localStorage ---
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// --- Show a random quote based on current filter ---
function showRandomQuote() {
  const selectedCategory = localStorage.getItem(FILTER_KEY) || "all";
  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `<p>"${text}"</p><small>- ${category}</small>`;

  // Store last shown quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

// --- Add new quote and update storage and UI ---
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    populateCategories();
    filterQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    showRandomQuote();
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// --- Populate category dropdown dynamically ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  // Extract unique categories
  const categories = Array.from(new Set(quotes.map(q => q.category)));

  // Clear existing options except "all"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem(FILTER_KEY) || "all";
  categoryFilter.value = lastCategory;
}

// --- Filter quotes when user selects a category ---
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  showRandomQuote();
}

// --- Notification UI helpers ---
function createNotificationArea() {
  let notif = document.getElementById("syncNotification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "syncNotification";
    notif.style.position = "fixed";
    notif.style.bottom = "10px";
    notif.style.right = "10px";
    notif.style.background = "#ffc";
    notif.style.border = "1px solid #cc9";
    notif.style.padding = "10px";
    notif.style.borderRadius = "5px";
    notif.style.display = "none";
    notif.style.zIndex = "1000";
    document.body.appendChild(notif);
  }
  return notif;
}

function showNotification(message, duration = 4000) {
  const notif = createNotificationArea();
  notif.textContent = message;
  notif.style.display = "block";
  setTimeout(() => {
    notif.style.display = "none";
  }, duration);
}

// --- Fetch quotes from mock server ---
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_QUOTES_URL);
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
    const serverQuotes = await response.json();
    return serverQuotes;
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    showNotification("Failed to sync with server.");
    return null;
  }
}

// --- Merge server quotes with local quotes, server wins conflicts ---
function mergeQuotes(serverQuotes) {
  let updated = false;
  serverQuotes.forEach(serverQ => {
    const localIndex = quotes.findIndex(q => q.text === serverQ.text);
    if (localIndex === -1) {
      // New quote from server
      quotes.push(serverQ);
      updated = true;
    } else {
      // Conflict: server overrides category
      if (quotes[localIndex].category !== serverQ.category) {
        quotes[localIndex].category = serverQ.category;
        updated = true;
      }
    }
  });
  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes updated from server.");
  } else {
    showNotification("Quotes are already up-to-date.");
  }
}

// --- Sync quotes with server ---
async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  if (serverQuotes) {
    mergeQuotes(serverQuotes);
  }
}

// --- Periodic sync setup ---
function setupPeriodicSync() {
  syncWithServer();
  setInterval(syncWithServer, 30000); // every 30 seconds
}

// --- Create manual sync button ---
function createManualSyncButton() {
  let btn = document.getElementById("manualSyncBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "manualSyncBtn";
    btn.textContent = "Sync Quotes Now";
    btn.style.marginLeft = "10px";
    btn.addEventListener("click", syncWithServer);
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quoteDisplay) {
      quoteDisplay.parentNode.insertBefore(btn, quoteDisplay.nextSibling);
    } else {
      document.body.appendChild(btn);
    }
  }
}

// --- Event listeners ---
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  const addBtn = document.getElementById("addQuote");
  if (addBtn) addBtn.addEventListener("click", addQuote);

  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);

  createManualSyncButton();
  setupPeriodicSync();
});
