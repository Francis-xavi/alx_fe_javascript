document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const categoryFilter = document.getElementById('categoryFilter');
    const newQuoteBtn = document.getElementById('newQuote');

    let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    let lastQuote = sessionStorage.getItem('lastQuote') || '';

    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function populateCategories() {
        const categories = [...new Set(quotes.map(q => q.category))];
        categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        const savedFilter = localStorage.getItem('selectedCategory');
        if (savedFilter) {
            categoryFilter.value = savedFilter;
        }
    }

    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        const filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = 'No quotes found for this category.';
            return;
        }

        const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
        sessionStorage.setItem('lastQuote', randomQuote.text);
    }

    function addQuote() {
        const textInput = document.getElementById('newQuoteText');
        const categoryInput = document.getElementById('newQuoteCategory');
        const text = textInput.value.trim();
        const category = categoryInput.value.trim();

        if (!text || !category) {
            alert('Please enter both quote text and category.');
            return;
        }

        const newQuote = { text, category };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        textInput.value = '';
        categoryInput.value = '';
        postQuoteToServer(newQuote);
    }

    function filterQuotes() {
        localStorage.setItem('selectedCategory', categoryFilter.value);
        showRandomQuote();
    }

    function exportToJson() {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function (event) {
            try {
                const importedQuotes = JSON.parse(event.target.result);
                if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                alert('Quotes imported successfully!');
            } catch (e) {
                alert('Error importing quotes: ' + e.message);
            }
        };
        fileReader.readAsText(event.target.files[0]);
    }

    async function fetchQuotesFromServer() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
            const data = await response.json();
            const serverQuotes = data.map(post => ({
                text: post.title,
                category: 'Server'
            }));
            quotes.push(...serverQuotes);
            saveQuotes();
            populateCategories();
        } catch (error) {
            console.error('Failed to fetch quotes from server:', error);
        }
    }

    async function postQuoteToServer(quote) {
        try {
            await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quote)
            });
        } catch (error) {
            console.error('Failed to post quote to server:', error);
        }
    }

    async function syncQuotes() {
        await fetchQuotesFromServer();
        console.log('Synced quotes from server.');
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);
    document.getElementById('exportJson').addEventListener('click', exportToJson);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

    // Initialize
    populateCategories();
    if (lastQuote) quoteDisplay.textContent = lastQuote;
    syncQuotes(); // Initial sync
    setInterval(syncQuotes, 60000); // Sync every 60 seconds
});
