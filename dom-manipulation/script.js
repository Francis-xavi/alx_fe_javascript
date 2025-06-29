
document.addEventListener('DOMContentLoaded', () => {
  /* 1 – Initial data ........................................................ */
  const quotes = [
    { text: 'The only true wisdom is in knowing you know nothing.', category: 'Philosophy' },
    { text: 'Do or do not. There is no try.',                       category: 'Motivation' },
    { text: 'Creativity is intelligence having fun.',                category: 'Creativity' }
  ];

  /* 2 – DOM references ....................................................... */
  const quoteDisplay   = document.getElementById('quoteDisplay');
  const newQuoteBtn    = document.getElementById('newQuote');

  /* 3 – Create the “category select” and “add-quote form” on the fly .......... */
  // (a) Category <select>
  const categorySelect = document.createElement('select');
  categorySelect.id = 'categorySelect';
  categorySelect.style.marginRight = '10px';
  categorySelect.addEventListener('change', showRandomQuote);
  document.body.insertBefore(categorySelect, newQuoteBtn); // insert before the “Show New Quote” button

  // (b) Add-quote form (wrapper <div>)
  const formWrapper = document.createElement('div');
  formWrapper.style.marginTop = '30px';
  formWrapper.innerHTML = `
    <input id="newQuoteText"      type="text" placeholder="Enter a new quote"       />
    <input id="newQuoteCategory"  type="text" placeholder="Enter quote category"    />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formWrapper);

  const addQuoteBtn     = document.getElementById('addQuoteBtn');
  const newQuoteTextInp = document.getElementById('newQuoteText');
  const newQuoteCatInp  = document.getElementById('newQuoteCategory');

  /* 4 – Utility: keep the <select> options in sync with the quotes array ...... */
  function rebuildCategoryOptions() {
    // Gather unique categories
    const categories = Array.from(new Set(quotes.map(q => q.category))).sort();
    categorySelect.innerHTML = '';                       // clear current <option>s
    const allOpt = new Option('All Categories', 'ALL');  // default “all” choice
    categorySelect.appendChild(allOpt);
    categories.forEach(cat => categorySelect.appendChild(new Option(cat, cat)));
  }

  /* 5 – Display logic ......................................................... */
  function showRandomQuote() {
    const filter = categorySelect.value;
    const pool   = (filter === 'ALL')
      ? quotes
      : quotes.filter(q => q.category === filter);

    // Guard: no quotes in this category
    if (pool.length === 0) {
      quoteDisplay.textContent = `No quotes in category “${filter}”.`;
      return;
    }

    const { text, category } = pool[Math.floor(Math.random() * pool.length)];
    quoteDisplay.innerHTML = `
      <blockquote style="font-style:italic;">${text}</blockquote>
      <p style="margin-top:5px;color:gray;">— ${category}</p>
    `;
  }

  /* 6 – Add-quote handler ..................................................... */
  function addQuote() {
    const text      = newQuoteTextInp.value.trim();
    const category  = newQuoteCatInp.value.trim() || 'Uncategorized';

    if (!text) {
      alert('Please enter a quote before adding.');
      return;
    }

    quotes.push({ text, category });
    newQuoteTextInp.value = '';
    newQuoteCatInp.value  = '';

    rebuildCategoryOptions();   // reflect new category (if new)
    categorySelect.value = category; // auto-select new category
    showRandomQuote();          // immediately display one of the new category quotes
  }

  /* 7 – Initial setup & event wiring .......................................... */
  rebuildCategoryOptions();
  showRandomQuote();                // show something on first load

  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn .addEventListener('click', addQuote);
});