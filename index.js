function addBadge(name, url) {
    const badge = document.createElement("div");
    badge.innerHTML = `<img src="${url}"><br/>${name}<br/>
<select onchange="this.parentElement.children[0].className = this.value + '-border'">
    <option value="none">None</option>
    <option value="gold">Gold</option>
    <option value="yellow">Amarr</option>
    <option value="blue">Caldari</option>
    <option value="green">Gallente</option>
    <option value="red">Minmatar</option>
</select>
<button class="print-hide" onclick="this.parentElement.parentElement.removeChild(this.parentElement)">Remove</button>`;
    document.getElementById("portraits").appendChild(badge);
}

async function addPortrait() {
    let input = document.getElementById("char-name").value;
    document.getElementById("add-char-form").reset();
    let request = fetch("https://esi.evetech.net/v1/universe/ids/", {method: "POST", body: JSON.stringify([input])});
    let response = await request.then(response => response.json());
    if (!response.characters) {
        throw new Error(`Couldn't find character with name "${input}"`);
    }
    let {id, name} = response.characters.find(character => character.name.toLowerCase() === input.trim().toLowerCase());
    addBadge(name, `https://imageserver.eveonline.com/Character/${id}_1024.jpg`);
}

function addImage() {
    let input = document.getElementById("image-url").value;
    document.getElementById("add-image-form").reset();
    addBadge("", input);
}

function removeAll() {
    const portraits = document.getElementById("portraits");
    for (let e of portraits.querySelectorAll("div")) {
        portraits.removeChild(e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-char-form").addEventListener("submit", event => {
        event.preventDefault();
        addPortrait().catch(error => alert(error.message));
    });
    document.getElementById("add-image-form").addEventListener("submit", event => {
        event.preventDefault();
        addImage();
    });
});
