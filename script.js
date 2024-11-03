import { bosses } from './bossesData.js';


// Initialize dropdown and display area
const bossSelect = document.getElementById("bossSelect");
const dropList = document.getElementById("drops");

function populateBossDropdown() {
    console.log("Populating boss dropdown..."); //debug line
    for (let boss in bosses) {
        let option = document.createElement("option");
        option.value = boss;
        option.textContent = boss;
        bossSelect.appendChild(option);
    }
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

// **displayDrops** Function to Show Drops with Images
function displayDrops(boss) {
    console.log('Displaying drops for boss: ${boss}'); //debug line
    dropList.innerHTML = "";  // Clear previous list of drops
    if (bosses[boss]) {
        const savedStatus = loadDropStatus(boss);
        bosses[boss].forEach(drop => {
            let dropItem = document.createElement("li");
            dropItem.className = "drop-item";

            // Add the image element
            let img = document.createElement("img");
            img.src = drop.image;
            img.alt = drop.name;
            img.className = "drop-image";  // Style this class in CSS
            dropItem.appendChild(img);

            // Add the text element
            let text = document.createTextNode(drop.name);
            dropItem.appendChild(text);

            // Apply 'obtained' status if previously saved
            if (savedStatus[drop.name]) {
                dropItem.classList.add("obtained");
            }

            // Toggle status on click
            dropItem.onclick = () => toggleDropStatus(dropItem, boss, drop.name);
            dropList.appendChild(dropItem);
        });
    }
}

// Toggle drop status and save to localStorage
function toggleDropStatus(item, boss, drop) {
    item.classList.toggle("obtained");  // Toggle 'obtained' class
    const obtained = item.classList.contains("obtained");
    saveDropStatus(boss, drop, obtained);
}

// Initialize the plugin
function init() {
    populateBossDropdown();
    bossSelect.addEventListener("change", () => displayDrops(bossSelect.value));
}

// Run the init function when the script loads
init();
