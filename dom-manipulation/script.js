let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  } else {
    // Default quotes if none in storage
    quotes = [
      { text: "The only limit is your mind.", category: "Motivation" },
      { text: "Life is short, live it well.", category: "Life" }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  if (quotes.length === 0) return;
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").textContent = `"${random.text}" - (${random.category})`;

  // Optional sessionStorage
  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

function addQuote(text, category) {
  if (!text || !category) {
    alert('Both quote and category are required!');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  alert('Quote added successfully!');
}

function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteForm');
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteButton">Add Quote</button>
  `;

  document.getElementById('addQuoteButton').addEventListener('click', () => {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    addQuote(text, category);
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  });
}

function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format!');
      }
    } catch {
      alert('Error reading the file.');
    }
  };
  reader.readAsText(event.target.files[0]);
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  createAddQuoteForm();

  const button = document.getElementById('newQuote');
  button.addEventListener('click', showRandomQuote);
});
