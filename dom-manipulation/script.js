// Key for localStorage
const LOCAL_STORAGE_KEY = "quotes";
const SESSION_STORAGE_KEY = "lastQuoteIndex";

// Default quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

// Load quotes from localStorage if any
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch (e) {
      console.error("Failed to parse stored quotes:", e);
    }
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Show quote by index, or random if no index specified
function showQuote(index = null) {
  let idx = index;
  if (idx === null) {
    idx = Math.floor(Math.random() * quotes.length);
  }

  const quote = quotes[idx];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.category}</small>`;

  // Save last shown quote index to sessionStorage
  sessionStorage.setItem(SESSION_STORAGE_KEY, idx);
}

// Show a random quote (wrapper)
function showRandomQuote() {
  showQuote();
}

// Add new quote from form inputs
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
    showQuote(quotes.length - 1); // Show newly added quote
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Dynamically create the quote addition form
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
        // Optional: validate each quote object has text & category keys
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            quotes.push(q);
          }
        });
        saveQuotes();
        alert("Quotes imported successfully!");
        showQuote(quotes.length - 1); // Show last imported quote
      } else {
        alert("Invalid JSON format: Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();

  // Show last viewed quote from sessionStorage if available
  const lastIndex = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (lastIndex !== null && quotes[lastIndex]) {
    showQuote(parseInt(lastIndex, 10));
  } else {
    showRandomQuote();
  }

  createAddQuoteForm();

  // Event listeners
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
});
