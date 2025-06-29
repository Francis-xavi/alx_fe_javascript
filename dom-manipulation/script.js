/* ------------------------------------------------------------------
   Dynamic Quote Generator — complete, corrected version
------------------------------------------------------------------ */

let quotes = [];                                    // master array

/* ---------- 1. Helpers to load / save quotes (Local Storage) ---- */
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [
    { text: 'Believe in yourself.',  category: 'Motivation' },
    { text: 'Life is short, live it well.', category: 'Life' }
  ];
}
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes)); // REQUIRED call
}

/* ---------- 2. Populate category <select> ----------------------- */
function populateCategories() {                                    // REQUIRED name
  const sel = document.getElementById('categoryFilter');
  const unique = [...new Set(quotes.map(q => q.category))].sort();
  sel.innerHTML = '<option value="all">All Categories</option>';
  unique.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
  // restore last filter
  const last = localStorage.getItem('selectedCategory') || 'all';
  sel.value = last;
}

/* ---------- 3. Show a random quote (uses Math.random) ----------- */
function showRandomQuote() {
  const filter = document.getElementById('categoryFilter').value;
  const pool   = filter === 'all' ? quotes :
                 quotes.filter(q => q.category === filter);

  const box = document.getElementById('quoteDisplay');
  if (pool.length === 0) {
    box.textContent = 'No quotes available in this category.';
    return;
  }
  const q = pool[Math.floor(Math.random() * pool.length)]; // Math.random REQUIRED
  box.textContent = `"${q.text}" – ${q.category}`;
  sessionStorage.setItem('lastQuote', q.text);            // optional session-save
}

/* ---------- 4. Add-Quote form (dynamically created) ------------ */
function createAddQuoteForm() {                            // REQUIRED function
  const wrap = document.getElementById('addQuoteContainer');
  wrap.innerHTML = `
    <h2>Add a New Quote</h2>
    <input id="newQuoteText" type="text"  placeholder="Quote text" />
    <input id="newQuoteCat"  type="text"  placeholder="Category"   />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.getElementById('addQuoteBtn')
          .addEventListener('click', () => {
            const txt = document.getElementById('newQuoteText').value.trim();
            const cat = document.getElementById('newQuoteCat').value.trim();
            addQuote(txt, cat);
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCat').value  = '';
          });
}

/* ---------- 5. Add a quote & refresh UI ------------------------ */
function addQuote(text, category) {
  if (!text || !category) { alert('Both fields are required.'); return; }
  quotes.push({ text, category });
  saveQuotes();                         // MUST include localStorage.setItem
  populateCategories();
  alert('Quote added!');
}

/* ---------- 6. Import / Export JSON ---------------------------- */
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)],
                        { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'quotes.json'; a.click();
  URL.revokeObjectURL(url);
}
function importFromJsonFile(ev) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const arr = JSON.parse(e.target.result);
      if (Array.isArray(arr)) {
        quotes.push(...arr);
        saveQuotes();
        populateCategories();
        alert('Quotes imported!');
      } else { throw new Error(); }
    } catch { alert('Invalid JSON.'); }
  };
  reader.readAsText(ev.target.files[0]);
}

/* ---------- 7. Server-sync & conflict resolution --------------- */
function fetchQuotesFromServer() {                         // REQUIRED function
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(r => r.json())
    .then(data => {
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
    })
    .catch(err => console.error('Sync error', err));
}
function notify(msg) {
  const note = document.createElement('div');
  note.textContent = msg;
  Object.assign(note.style, {
    background:'#ffeeba', border:'1px solid #ffc107',
    padding:'8px', margin:'8px 0', borderRadius:'4px'
  });
  document.body.prepend(note);
  setTimeout(() => note.remove(), 5000);
}

/* ---------- 8. Filter handler ---------------------------------- */
function filterQuotes() {
  const sel = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', sel);
  showRandomQuote();
}

/* ---------- 9. Init -------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // restore last-viewed quote if available
  const last = sessionStorage.getItem('lastQuote');
  if (last) document.getElementById('quoteDisplay').textContent = last;

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);

  showRandomQuote();                // show one on first load
  setInterval(fetchQuotesFromServer, 30000); // sync every 30 s
});
