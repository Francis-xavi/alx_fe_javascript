let quotes = [];

// Load quotes from localStorage or fallback to default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [
    { text: 'Be yourself; everyone else is already taken.', category: 'Inspiration' },
    { text: 'So many books, so little time.', category: 'Books' }
  ];
  saveQuotes();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = localStorage.getItem('lastCategory') || 'all';
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').textContent = quote ? quote.text : 'No quote available';
  sessionStorage.setItem('lastQuote', quote ? quote.text : '');
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please enter both quote and category.');
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  postQuoteToServer(newQuote);
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const unique = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = '<option value="all">All Categories</option>' +
    unique.map(c => `<option value="${c}">${c}</option>`).join('');
  select.value = localStorage.getItem('lastCategory') || 'all';
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', category);
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').textContent = quote ? quote.text : 'No quote available';
  sessionStorage.setItem('lastQuote', quote ? quote.text : '');
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const data = await res.json();
    const serverQuotes = data.map(p => ({ text: p.title, category: p.body.slice(0, 10) }));
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (e) {
    console.error('Error fetching from server:', e);
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 })
    });
    const result = await response.json();
    console.log('Posted to server:', result);
  } catch (error) {
    console.error('Failed to post quote:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  fetchQuotesFromServer();
});
