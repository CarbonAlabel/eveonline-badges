// Add a badge to the badge area, using the given image URL and name, with an optional background color toggle.
function addBadge(url, name = "", bgSelector = false) {
    let badge = document.createElement("div");
    badge.innerHTML = `<img src="${url}"><br>${name}<br>
<select onchange="this.parentElement.firstElementChild.className = this.value">
    <option value="none">No border</option>
    <option value="gold">Gold</option>
    <option value="yellow">Amarr</option>
    <option value="blue">Caldari</option>
    <option value="green">Gallente</option>
    <option value="red">Minmatar</option>
</select>
<select onchange="this.parentElement.firstElementChild.style.backgroundColor = this.value" class="${bgSelector ? "" : "hide"}">
    <option value="white">White BG</option>
    <option value="black">Black BG</option>
</select>
<button onclick="this.parentElement.remove()">Remove</button>`;
    document.getElementById("badges").appendChild(badge);
}

// Add a badge for an EVE entity.
function addEntity({id, name, category}) {
    switch (category) {
        case "characters":
        case "inventory_types":
            // Character portraits and type renders are solid images, the background color selector would serve no purpose.
            addBadge(entityImageURL({id, category}), name);
            break;
        case "corporations":
        case "alliances":
        case "factions":
            // Logos might have transparency in them, the background color selector should be displayed.
            addBadge(entityImageURL({id, category}), name, true);
            break;
        default:
            throw new Error(`Invalid category "${category}"`);
    }
}

// Return the URL of a logo/render for an EVE entity, in the highest resolution available.
function entityImageURL({id, category}) {
    switch (category) {
        case "characters":
            return `https://images.evetech.net/characters/${id}/portrait`
        case "corporations":
        case "factions":
            return `https://images.evetech.net/corporations/${id}/logo`;
        case "alliances":
            return `https://images.evetech.net/alliances/${id}/logo`;
        case "inventory_types":
            return `https://images.evetech.net/types/${id}/render`;
        default:
            throw new Error(`Invalid category "${category}"`);
    }
}

// Add a search result card to the search result area.
function addSearchResult({id, name, category}) {
    let searchResult = document.createElement("div");
    // Some entity types should be shown above others.
    searchResult.style.order = {
        "inventory_types": 2,
        "factions": 1,
        "alliances": 3,
        "corporations": 4,
        "characters": 5
    }[category];
    searchResult.innerHTML = `<img src="${entityImageURL({id, category})}">
<span>${name} (${category})</span>
<button onclick="addEntity(this.dataset)" data-id="${id}" data-name="${name}" data-category="${category}">Add</button>`;
    document.getElementById("search-results").appendChild(searchResult);
}

// Make a request to ESI, throwing an error if it fails, or returning the parsed JSON response.
async function request(...args) {
    let request = await fetch(...args);
    if (!request.ok) {
        throw new Error(`ESI responded with a ${request.status} error`);
    }
    return request.json();
}

// Empty an element of any children.
function removeAllChildren(parentElement) {
    Array.from(parentElement.children).forEach(element => element.remove());
}

// Add a badge for a character with the exact name entered.
async function addPortrait({character}) {
    let response = await request("https://esi.evetech.net/v1/universe/ids/", {method: "POST", body: JSON.stringify([character])});
    if (!response.characters) {
        throw new Error(`Couldn't find character with name "${character}"`);
    }
    let {id, name} = response.characters.find(match => match.name.toLowerCase() === character.toLowerCase());
    addEntity({id, name, category: "characters"});
}

// Perform a search.
async function search({query}) {
    let searchResults = document.getElementById("search-results");
    // Clear the search result area.
    removeAllChildren(searchResults);
    let search = await request("https://esi.evetech.net/v1/universe/ids/", {method: "POST", body: JSON.stringify([query])});
    // Merge all the search result categories into a single array.
    let results = [];
    for (let category in search) {
        if (Array.isArray(search[category])) {
            for (let item of search[category]){
                results.push({...item, category: category});
            }
        }
    }
    // Add the search result header.
    let header = document.createElement("header");
    header.textContent = `Search results for "${query}":`;
    searchResults.appendChild(header);
    // Add search result cards for each of the results.
    results.forEach(addSearchResult);
}

// Add a badge for the entered image URL and name.
function addImage({url, name}) {
    addBadge(url, name, true);
}

// Remove all badges from the badge area, asking the user for confirmation first.
function removeAll() {
    if (confirm("Are you sure you want to remove all badges?")) {
        removeAllChildren(document.getElementById("badges"));
    }
}

// Common form submission handling.
function onFormSubmit(formName, submitFunction) {
    let form = document.forms[formName];
    form.addEventListener("submit", event => {
        // Prevent form submission.
        event.preventDefault();
        // Convert the form data to an object.
        let formData = {};
        for (let [key, value] of new FormData(form)) {
            formData[key] = value.trim();
        }
        // Run the associated function, passing it the form data.
        // Use the browser alert function to handle any errors.
        Promise.resolve(submitFunction(formData)).catch(alert);
        // Clear the form.
        form.reset();
    });
}

// Register all the form actions.
document.addEventListener("DOMContentLoaded", () => {
    onFormSubmit("add-char-form", addPortrait);
    onFormSubmit("add-image-form", addImage);
    onFormSubmit("search-form", search);
    onFormSubmit("remove-all", removeAll);
});
