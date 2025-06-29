document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const categoryFilter = document.getElementById('categoryFilter');
  const importInput = document.getElementById('importFile');

  let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
  let lastQuote = sessionStorage.getItem('lastQuote') || '';
  if (lastQuote) quoteDisplay.textContent = lastQuote;

  populateCategories();
  displayQuote();

  newQuoteBtn.addEventListener('click', displayQuote);
  importInput.addEventListener('change', importFromJsonFile);

  document.getElementById('addQuoteBtn').addEventListener('click', () => {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (text && category) addQuote({ text, category });
  });

  async function fetchQuotesFromServer() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverData = await response.json();
    return serverData.map(p => ({ text: p.title, category: 'server' }));
  }

  async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    const existing = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !existing.has(q.text));
    quotes = [...quotes, ...newQuotes];
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    alert('Quotes synced with server.');
  }

  async function postQuoteToServer(quote) {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
  }

  function displayQuote() {
    const selected = categoryFilter.value;
    const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = random?.text || 'No quote found';
    sessionStorage.setItem('lastQuote', random?.text || '');
  }

  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    const savedFilter = localStorage.getItem('selectedCategory');
    if (savedFilter) categoryFilter.value = savedFilter;
  }

  function addQuote(quote, sync = true) {
    quotes.push(quote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    if (sync) postQuoteToServer(quote);
  }

  categoryFilter.addEventListener('change', () => {
    localStorage.setItem('selectedCategory', categoryFilter.value);
    displayQuote();
  });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
  });

  window.importFromJsonFile = function(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      alert('Quotes imported successfully!');
    };
    reader.readAsText(event.target.files[0]);
  };

  // Trigger sync at startup
  syncQuotes();
});
