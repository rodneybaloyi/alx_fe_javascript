const LOCAL_STORAGE_KEY = "quotes";
const SESSION_STORAGE_KEY = "lastQuoteIndex";
const CATEGORY_FILTER_KEY = "selectedCategoryFilter";

let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

let filteredQuotes = [...quotes]; // Will hold quotes matching current filter

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch (e) {
      console.error("Failed to parse stored quotes:", e);
    }
  }
  filteredQuotes = [...quotes];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  // Clear existing options except 'All Categories'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Extract unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))].sort();

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category filter from localStorage
  const savedCategory = localStorage.getItem(CATEGORY_FILTER_KEY);
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === "all") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  // Save selected category filter to localStorage
  localStorage.setItem(CATEGORY_FILTER_KEY, selectedCategory);

  // Show first quote matching filter or notify if none
  if (filteredQuotes.length > 0) {
    showQuote(0);
    sessionStorage.setItem(SESSION_STORAGE_KEY, 0);
  } else {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
  }
}

// Show quote from filteredQuotes by index or random if no index
function showQuote(index = null) {
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available.</p>";
    return;
  }

  let idx = index;
  if (idx === null || idx >= filteredQuotes.length) {
    idx = Math.floor(Math.random() * filteredQuotes.length);
  }

  const quote = filteredQuotes[idx];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.category}</small>`;

  // Save last shown quote index in session storage
  sessionStorage.setItem(SESSION_STORAGE_KEY, idx);
}

function showRandomQuote() {
  showQuote();
}

// Add new quote & update categories + storage
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();

    textInput.value = "";
    categoryInput.value = "";

    populateCategories();

    // Refresh filter quotes based on current selected category
    filterQuotes();

    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Dynamically create add-quote form
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

// Export quotes as JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        let newCategoryAdded = false;
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            // Check if category is new
            if (!quotes.some(existing => existing.category === q.category)) {
              newCategoryAdded = true;
            }
            quotes.push(q);
          }
        });
        saveQuotes();

        if (newCategoryAdded) {
          populateCategories();
        }

        filterQuotes();

        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format: Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();

  // Restore last category filter from localStorage
  const categoryFilter = document.getElementById("categoryFilter");
  const savedCategory = localStorage.getItem(CATEGORY_FILTER_KEY) || "all";
  categoryFilter.value = savedCategory;

  // Set filteredQuotes accordingly
  filterQuotes();

  // Show last quote index in filteredQuotes if available
  const lastIndex = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (lastIndex !== null && filteredQuotes[lastIndex]) {
    showQuote(parseInt(lastIndex, 10));
  } else {
    showRandomQuote();
  }

  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
});
