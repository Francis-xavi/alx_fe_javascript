// Simulated server interaction and conflict resolution for Dynamic Quote Generator

const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Mock endpoint
let syncInterval = 10000; // 10 seconds for demo

// Start syncing after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setInterval(syncWithServer, syncInterval);
});

function syncWithServer() {
  fetch(serverUrl)
    .then(response => response.json())
    .then(serverQuotes => {
      const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

      // Simulate server quote format
      const simulatedQuotes = serverQuotes.slice(0, 5).map(q => ({
        text: q.title,
        category: 'Server'
      }));

      let updated = false;
      simulatedQuotes.forEach(serverQuote => {
        if (!localQuotes.some(local => local.text === serverQuote.text)) {
          localQuotes.push(serverQuote);
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem('quotes', JSON.stringify(localQuotes));
        populateCategories();
        filterQuotes();
        notifyUser("Quotes updated from server.");
      }
    })
    .catch(err => console.error('Sync error:', err));
}

function notifyUser(message) {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.background = '#ffeeba';
  note.style.border = '1px solid #ffc107';
  note.style.padding = '10px';
  note.style.margin = '10px';
  note.style.color = '#856404';
  note.style.borderRadius = '5px';
  document.body.insertBefore(note, document.body.firstChild);

  setTimeout(() => note.remove(), 5000);
}

// Optional: Manual conflict resolution interface (could be expanded)
window.resolveConflictsManually = function() {
  alert('Manual conflict resolution not implemented. Server always wins by default.');
};

