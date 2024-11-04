import { bosses } from './bossesData.js';

// Initialize display area
const bossList = document.getElementById("bossList");  // Sidebar boss list
const dropList = document.getElementById("drops");
const selectedCounter = document.getElementById("selectedCounter"); // Counter for selected items

function populateBossList() {
    console.log("Populating boss list..."); // Debug line

    for (let boss in bosses) {
        let listItem = document.createElement("li");
        listItem.textContent = boss;
        listItem.className = "boss-item";  // Style this class in CSS for sidebar items

        // Add a click event listener for each boss
        listItem.onclick = () => {
            // Remove 'selected' class from all boss items
            document.querySelectorAll(".boss-item").forEach(item => item.classList.remove("selected"));

            // Add 'selected' class to the clicked boss item
            listItem.classList.add("selected");

            // Display drops for the selected boss
            displayDrops(boss);
        };
        
        bossList.appendChild(listItem);
    }
}

function updateTotalTracker() {
    let totalItems = 0;
    let obtainedItems = 0;

    // Loop through each boss and their items
    for (let boss in bosses) {
        const savedStatus = loadDropStatus(boss); // Load saved status for each boss
        bosses[boss].forEach(drop => {
            totalItems++;
            if (savedStatus[drop.name]) {
                obtainedItems++;
            }
        });
    }

    // Update the tracker display
    const tracker = document.getElementById("tracker");
    tracker.textContent = `Total Items Obtained: ${obtainedItems} / ${totalItems}`;
}

// Load saved drop status from localStorage
function loadDropStatus(boss) {
    const savedStatus = JSON.parse(localStorage.getItem(boss)) || {};
    return savedStatus;
}

// Save drop status to localStorage
function saveDropStatus(boss, drop, obtained) {
    let savedStatus = JSON.parse(localStorage.getItem(boss)) || {};
    savedStatus[drop] = obtained;
    localStorage.setItem(boss, JSON.stringify(savedStatus));
}

// Display drops with images for the selected boss
function displayDrops(boss) {
    console.log(`Displaying drops for boss: ${boss}`); // Debug line
    dropList.innerHTML = "";  // Clear previous list of drops
    
    // Update the h2 element with the boss name
    const bossHeader = document.getElementById("bossHeader");
    bossHeader.textContent = boss; // Set the header text

    if (bosses[boss]) {
        const savedStatus = loadDropStatus(boss);
        bosses[boss].forEach(drop => {
            let dropItem = document.createElement("li");
            dropItem.className = "drop-item";

            // Add the image element
            let img = document.createElement("img");
            img.src = drop.image;
            img.alt = drop.name;
            img.className = "drop-image greyed-out";  // Start greyed out
            dropItem.appendChild(img);

            // Create a span for the text (for mouseover display)
            let text = document.createElement("span");
            text.className = "drop-text";
            text.textContent = drop.name;
            dropItem.appendChild(text);

            // Apply 'obtained' status if previously saved
            if (savedStatus[drop.name]) {
                dropItem.classList.add("obtained");
                img.classList.remove("greyed-out"); // Remove greyed-out if previously obtained
            }

            // Toggle status on click
            dropItem.onclick = () => {
                toggleDropStatus(dropItem, boss, drop.name);
                updateSelectedCounter(); // Update the counter when an item is clicked
                updateTotalTracker(); // Update the total tracker when status changes
            };
            dropList.appendChild(dropItem);
        });

        // Update the counter for the current boss after displaying drops
        updateSelectedCounter(); // Ensure the counter reflects the current boss's items
    }
}

// Function to update the selected items counter
function updateSelectedCounter() {
    // Count all obtained items for the current boss
    const obtainedItems = document.querySelectorAll('.drop-item.obtained').length;
    const totalItems = document.querySelectorAll('.drop-item').length; // Total items for the current boss
    selectedCounter.textContent = `Obtained Items: ${obtainedItems} / ${totalItems}`; // Update the counter display
}

// Toggle drop status and update local storage and tracker
function toggleDropStatus(item, boss, drop) {
    item.classList.toggle("obtained");  // Toggle 'obtained' class
    const img = item.querySelector("img");
    img.classList.toggle("greyed-out", !item.classList.contains("obtained")); // Update image greying

    const obtained = item.classList.contains("obtained");
    saveDropStatus(boss, drop, obtained);

    // Update the total tracker
    updateTotalTracker();
}

// Initialize the app
function init() {
    populateBossList();  // Populate sidebar list
    updateTotalTracker();  // Initialize total tracker on load
}

// Run the init function when the script loads
init();
