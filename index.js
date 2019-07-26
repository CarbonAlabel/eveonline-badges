function addBadge(url, name = "", bgSelector = false) {
    const badge = document.createElement("div");
    badge.innerHTML = `<img src="${url}"><br>${name}<br>
<select onchange="this.parentElement.firstElementChild.className = this.value + '-border'">
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

function addEntity({id, name, category}) {
    switch (category) {
        case "character":
        case "inventory_type":
            addBadge(entityImageURL({id, category}), name);
            break;
        case "corporation":
        case "alliance":
        case "faction":
            addBadge(entityImageURL({id, category}), name, true);
            break;
        default:
            throw new Error(`Invalid category "${category}"`);
    }
}

function entityImageURL({id, category}) {
    switch (category) {
        case "character":
            return `https://imageserver.eveonline.com/Character/${id}_1024.jpg`
        case "corporation":
            return `https://imageserver.eveonline.com/Corporation/${id}_256.png`;
        case "alliance":
        case "faction":
            return `https://imageserver.eveonline.com/Alliance/${id}_128.png`;
        case "inventory_type":
            return `https://imageserver.eveonline.com/Render/${id}_512.png`;
        default:
            throw new Error(`Invalid category "${category}"`);
    }
}

function addSearchResult({id, name, category}) {
    let searchResult = document.createElement("div");
    searchResult.style.order = {
        "inventory_type": 1,
        "faction": 2,
        "alliance": 3,
        "corporation": 4,
        "character": 5
    }[category];
    searchResult.innerHTML = `<img src="${entityImageURL({id, category})}">
<span>${name} (${category})</span>
<button onclick="addEntity({id:${id},name:'${name}',category:'${category}'})">Add</button>`;
    document.getElementById("search-results").appendChild(searchResult);
}

async function request(...args) {
    let request = await fetch(...args);
    if (!request.ok) {
        throw new Error(`ESI responded with a ${request.status} error`);
    }
    return request.json();
}

async function addPortrait({character}) {
    let response = await request("https://esi.evetech.net/v1/universe/ids/", {method: "POST", body: JSON.stringify([character])});
    if (!response.characters) {
        throw new Error(`Couldn't find character with name "${character}"`);
    }
    let {id, name} = response.characters.find(match => match.name.toLowerCase() === character.toLowerCase());
    addBadge(`https://imageserver.eveonline.com/Character/${id}_1024.jpg`, name);
}

async function search({query}) {
    let searchResults = document.getElementById("search-results");
    Array.from(searchResults.children).forEach(element => element.remove());
    let search = await request(`https://esi.evetech.net/v2/search/?categories=alliance,character,corporation,faction,inventory_type&search=${encodeURIComponent(query)}`);
    let ids = [];
    for (let category in search) {
        if (Array.isArray(search[category])) {
            ids.push(...search[category]);
        }
    }
    let names = await request("https://esi.evetech.net/v3/universe/names/", {method: "POST", body: JSON.stringify(ids)});
    if (!Array.isArray(names) || !names.length) {
        throw new Error(`No search results for "${query}"`);
    }
    let header = document.createElement("header");
    header.textContent = `Search results for "${query}":`;
    searchResults.appendChild(header);
    names.forEach(addSearchResult);
}

function addImage({url, name}) {
    addBadge(url, name, true);
}

function removeAll() {
    if (!confirm("Are you sure you want to remove all badges?")) {
        return;
    }
    const badges = document.getElementById("badges");
    for (let badge of Array.from(badges.children)) {
        badges.removeChild(badge);
    }
}

function onFormSubmit(formName, submitFunction) {
    const form = document.forms[formName];
    form.addEventListener("submit", event => {
        event.preventDefault();
        const formData = {};
        for (let [key, value] of new FormData(form).entries()) {
            formData[key] = value.trim();
        }
        Promise.resolve(submitFunction(formData)).catch(alert);
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    onFormSubmit("add-char-form", addPortrait);
    onFormSubmit("add-image-form", addImage);
    onFormSubmit("search-form", search);
});
