// Array to hold quotes
let quotes = [];

// Load quotes from local storage on initialization
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none are stored
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
            { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
            { text: "The best way to predict the future is to create it.", category: "Inspiration" },
        ];
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p><p><em>Category: ${quotes[randomIndex].category}</em></p>`;
}

// Event listener for the button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;

    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes(); // Save to local storage
        populateCategories(); // Update categories in the dropdown
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert("Quote added successfully!");
        filterQuotes(); // Refresh displayed quotes
    } else {
        alert("Please enter both quote and category.");
    }
}
// Load quotes when the page is initialized
loadQuotes();
// Function to store the last viewed quote in session storage
function storeLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Modify showRandomQuote to store the last viewed quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');
    const selectedQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>${selectedQuote.text}</p><p><em>Category: ${selectedQuote.category}</em></p>`;
    storeLastViewedQuote(selectedQuote);
}
// Function to export quotes to a JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Event listener for the export button
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes(); // Save updated quotes to local storage
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}
// Function to populate categories in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Call populateCategories after loading quotes
loadQuotes();
populateCategories();
// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear current quotes
    quoteDisplay.innerHTML = '';

    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);

    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('p');
        quoteElement.innerHTML = `<strong>${quote.text}</strong> <em>(${quote.category})</em>`;
        quoteDisplay.appendChild(quoteElement);
    });

    // Save the last selected filter in local storage
    localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// Restore the last selected filter when loading quotes
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
    // Restore last selected category
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    document.getElementById('categoryFilter').value = lastSelectedCategory;
    filterQuotes(); // Display quotes based on the last selected category
}
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API URL

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Transform the data to match the quote format
        const fetchedQuotes = data.map(item => ({
            text: item.title, // Using title as quote text
            category: "General" // Default category
        }));

        return fetchedQuotes;
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        return [];
    }
}

// Periodically fetch new quotes
setInterval(async () => {
    const serverQuotes = await fetchQuotesFromServer();
    syncQuotesWithServer(serverQuotes);
}, 30000); // Fetch every 30 seconds
function syncQuotesWithServer(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

    // Conflict resolution: Use server data if there are discrepancies
    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = localQuotes.findIndex(localQuote => localQuote.text === serverQuote.text);
        
        if (existingQuoteIndex === -1) {
            // If the quote does not exist locally, add it
            localQuotes.push(serverQuote);
        } else {
            // If it exists, update it to the server version
            localQuotes[existingQuoteIndex] = serverQuote;
        }
    });

    // Save updated quotes back to local storage
    localStorage.setItem('quotes', JSON.stringify(localQuotes));
    alert("Quotes have been synced with the server!");
}
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = 'lightblue';
    notification.style.padding = '10px';
    notification.style.border = '1px solid blue';
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}

// Modify syncQuotesWithServer to notify users
function syncQuotesWithServer(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    let updated = false; // Flag to check if updates occurred

    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = localQuotes.findIndex(localQuote => localQuote.text === serverQuote.text);
        
        if (existingQuoteIndex === -1) {
            localQuotes.push(serverQuote);
            updated = true; // New quote added
        } else if (localQuotes[existingQuoteIndex].text !== serverQuote.text) {
            localQuotes[existingQuoteIndex] = serverQuote;
            updated = true; // Existing quote updated
        }
    });

    if (updated) {
        localStorage.setItem('quotes', JSON.stringify(localQuotes));
        notifyUser("Quotes have been synced with the server!");
    }
}
