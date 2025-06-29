document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const categoryFilter = document.getElementById('categoryFilter');
  const newQuoteBtn = document.getElementById('newQuote');

  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Believe in yourself.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  ];

  // Load last filter
  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }

  populateCategories();
  filterQuotes();

  newQuoteBtn.addEventListener('click', () => {
    const selectedCategory = categoryFilter.value;
    const filtered = selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);
    showRandomQuote(filtered);
  });

  function showRandomQuote(quoteArray) {
    if (quoteArray.length === 0) {
      quoteDisplay.textContent = "No quotes available for this category.";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quoteArray.length);
    quoteDisplay.textContent = quoteArray[randomIndex].text;
    sessionStorage.setItem('lastQuote', quoteArray[randomIndex].text);
  }

  window.addQuote = function () {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    if (!text || !category) return alert("Both fields are required.");

    const newQ = { text, category };
    quotes.push(newQ);
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  };

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  window.filterQuotes = function () {
    const selected = categoryFilter.value;
    localStorage.setItem('selectedCategory', selected);

    const filtered = selected === 'all'
      ? quotes
      : quotes.filter(q => q.category === selected);

    showRandomQuote(filtered);
  };

  function populateCategories() {
    const categories = Array.from(new Set(quotes.map(q => q.category)));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });

    const saved = localStorage.getItem('selectedCategory');
    if (saved) categoryFilter.value = saved;
  }

  window.importFromJsonFile = function (event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error();
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    fileReader.readAsText(event.target.files[0]);
  };

  window.exportToJson = function () {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "quotes.json";
    link.click();
  };
});
