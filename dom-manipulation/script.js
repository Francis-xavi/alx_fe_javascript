/let quotes = [];

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  restoreLastFilter();
  showRandomQuote();
  setInterval(fetchQuotesFromServer, 30000); // Sync every 30 seconds

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('exportQuotes').addEventListener('click', exportToJson);
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
});

function showRandomQuote() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = 'No quotes available for this category.';
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text === '' || category === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: 'Be yourself; everyone else is already taken.', category: 'Inspiration' },
      { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', category: 'Motivation' }
    ];
    saveQuotes();
  }
}

function populateCategories() {
  const dropdown = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
}

function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selected);
  showRandomQuote();
}

function restoreLastFilter() {
  const last = localStorage.getItem('lastCategory');
  if (last) {
    document.getElementById('categoryFilter').value = last;
  }
}

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid format. Please upload a valid JSON file.');
      }
    } catch {
      alert('Error parsing file. Make sure it is valid JSON.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(p => ({
      text: p.title,
      category: 'Server'
    }));

    let updated = false;
    serverQuotes.forEach(sq => {
      if (!quotes.some(lq => lq.text === sq.text && lq.category === sq.category)) {
        quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      notify('Quotes synced from server (server wins on conflict).');
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

function notify(message) {
  alert(message); // You can replace this with a nicer toast-style UI
}
