// Continuation of script.js with Filtering System

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem('selectedCategory');
  if (lastSelected) {
    categoryFilter.value = lastSelected;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = '';

  const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes found for this category.';
  } else {
    filteredQuotes.forEach(q => {
      const p = document.createElement('p');
      p.textContent = `"${q.text}" - (${q.category})`;
      quoteDisplay.appendChild(p);
    });
  }
}

// Update createAddQuoteForm to re-populate categories
function addQuote(text, category) {
  if (!text || !category) {
    alert('Both quote and category are required!');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert('Quote added successfully!');
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
});

