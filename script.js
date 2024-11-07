import { bosses } from './bossesData.js';

const bossList = document.getElementById("bossList");
const dropList = document.getElementById("drops");
const selectedCounter = document.getElementById("selectedCounter");
const obtainedItems = {};  // Global object to track obtained items across bosses

// Dashboard elements
const totalObtainedEl = document.getElementById("totalObtained");
const completedLogsEl = document.getElementById("completedLogs");
const completionPercentageEl = document.getElementById("completionPercentage");

function populateBossList() {
    // Create Dashboard item at the top
    const dashboardItem = document.createElement("li");
    dashboardItem.textContent = "Dashboard";
    dashboardItem.className = "boss-item dashboard-item";  // Assign a class for potential styling

    dashboardItem.onclick = () => {
        document.querySelectorAll(".boss-item").forEach(item => item.classList.remove("selected"));
        dashboardItem.classList.add("selected");

        // Hide drop list and show dashboard
        document.getElementById("dropList").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        updateTotalTracker();  // Refresh stats in case items have changed
    };

    bossList.appendChild(dashboardItem);

    // Add remaining bosses
    for (let boss in bosses) {
        let listItem = document.createElement("li");
        listItem.textContent = boss;
        listItem.className = "boss-item";

        listItem.onclick = () => {
            document.querySelectorAll(".boss-item").forEach(item => item.classList.remove("selected"));
            listItem.classList.add("selected");

            // Show drop list and hide dashboard
            document.getElementById("dropList").style.display = "block";
            document.getElementById("dashboard").style.display = "none";
            displayDrops(boss);
        };
        
        bossList.appendChild(listItem);
    }
}

function updateTotalTracker() {
    let totalItems = 0;
    let obtainedItemsCount = 0;
    let completedLogsCount = 0;
    let totalLogsCount = 0;  // Variable to keep track of total logs

    // Iterate through each boss to count total and obtained items
    for (let boss in bosses) {
        totalLogsCount++;  // Increment total logs count for each boss
        let bossCompleted = true;  // Assume boss log is complete initially

        bosses[boss].forEach(drop => {
            totalItems++;
            if (obtainedItems[drop.name]) {
                obtainedItemsCount++;
            } else {
                bossCompleted = false;  // Mark boss as incomplete if any drop is missing
            }
        });

        // Increment completedLogsCount if the entire boss log is obtained
        if (bossCompleted) completedLogsCount++;
    }

    // Update overall tracker for obtained items
    const tracker = document.getElementById('tracker');
    tracker.textContent = `Total Items Obtained: ${obtainedItemsCount} / ${totalItems}`;

    // Update dashboard stats
    totalObtainedEl.textContent = `${obtainedItemsCount} / ${totalItems}`;
    completedLogsEl.textContent = `${completedLogsCount} / ${totalLogsCount}`;  // Show completed logs out of total logs

    // Calculate and update the completion percentage
    const completionPercentage = totalItems > 0 ? ((obtainedItemsCount / totalItems) * 100).toFixed(2) : 0;
    completionPercentageEl.textContent = `${completionPercentage}%`;
}

// Load obtained items from localStorage at start
function loadObtainedItems() {
    const savedItems = JSON.parse(localStorage.getItem("obtainedItems")) || {};
    Object.assign(obtainedItems, savedItems);
}

// Save obtained items to localStorage
function saveObtainedItems() {
    localStorage.setItem("obtainedItems", JSON.stringify(obtainedItems));
}

// Display drops for the selected boss
function displayDrops(boss) {
    dropList.innerHTML = "";
    const bossHeader = document.getElementById("bossHeader");
    bossHeader.textContent = boss;

    if (bosses[boss]) {
        bosses[boss].forEach(drop => {
            let dropItem = document.createElement("li");
            dropItem.className = "drop-item";
            dropItem.setAttribute("data-item-name", drop.name);  // Unique identifier

            let img = document.createElement("img");
            img.src = drop.image;
            img.alt = drop.name;
            img.className = "drop-image";
            dropItem.appendChild(img);

            let text = document.createElement("span");
            text.className = "drop-text";
            text.textContent = drop.name;
            dropItem.appendChild(text);

            // Apply 'obtained' status if found in global obtainedItems
            if (obtainedItems[drop.name]) {
                dropItem.classList.add("obtained");
                img.classList.remove("greyed-out");
            } else {
                img.classList.add("greyed-out");
            }

            dropItem.onclick = () => {
                toggleDropStatus(dropItem, drop.name);
                updateSelectedCounter();
                updateTotalTracker();
            };

            dropList.appendChild(dropItem);
        });

        updateSelectedCounter();
    }
}

function updateSelectedCounter() {
    const obtainedItems = document.querySelectorAll('.drop-item.obtained').length;
    const totalItems = document.querySelectorAll('.drop-item').length;
    selectedCounter.textContent = `Obtained Items: ${obtainedItems} / ${totalItems}`;
}

function toggleDropStatus(item, drop) {
    item.classList.toggle("obtained");
    const img = item.querySelector("img");
    img.classList.toggle("greyed-out", !item.classList.contains("obtained"));

    obtainedItems[drop] = item.classList.contains("obtained");
    saveObtainedItems();
    updateAllBossLogs();
}

function updateAllBossLogs() {
    const allDropItems = document.querySelectorAll('.drop-item');
    allDropItems.forEach(item => {
        const itemName = item.getAttribute('data-item-name');
        const img = item.querySelector("img");
        
        if (obtainedItems[itemName]) {
            item.classList.add("obtained");
            img.classList.remove("greyed-out");
        } else {
            item.classList.remove("obtained");
            img.classList.add("greyed-out");
        }
    });
}

function init() {
    loadObtainedItems();  // Load obtained state from localStorage
    populateBossList();
    updateTotalTracker(); // Initialize total tracker on load

    // Open the dashboard by default
    const dashboardItem = document.querySelector('.dashboard-item');
    if (dashboardItem) {
        dashboardItem.click();  // Simulate a click on the Dashboard to display it on load
    }
}

// Function to export progress as a hash
function exportProgress() {
    const obtainedItemsJson = JSON.stringify(obtainedItems);
    const hash = btoa(obtainedItemsJson); // Convert JSON to Base64
    alert(`Your progress hash: ${hash}`); // Display or let the user copy the hash
}

// Function to import progress from a hash
function importProgress() {
    const hash = document.getElementById('importInput').value.trim();
    if (!hash) {
        alert("Please enter a valid hash.");
        return;
    }

    try {
        const obtainedItemsJson = atob(hash); // Decode from Base64
        const importedItems = JSON.parse(obtainedItemsJson);
        
        // Validate and apply the imported items
        Object.assign(obtainedItems, importedItems);
        saveObtainedItems();  // Save to localStorage
        updateTotalTracker(); // Update UI with imported progress
        alert("Progress successfully imported!");
    } catch (error) {
        alert("Invalid hash. Please ensure it was copied correctly.");
    }
}

// Attach event listeners for export and import
document.getElementById('exportBtn').onclick = exportProgress;
document.getElementById('importBtn').onclick = importProgress;

init();
