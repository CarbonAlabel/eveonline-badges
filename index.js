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
<select onchange="this.parentElement.firstElementChild.style.backgroundColor = this.value" style="display: ${bgSelector ? "inline-block" : "none"};">
    <option value="white">White BG</option>
    <option value="black">Black BG</option>
</select>
<button onclick="this.parentElement.remove()">Remove</button>`;
    document.getElementById("badges").appendChild(badge);
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
});
