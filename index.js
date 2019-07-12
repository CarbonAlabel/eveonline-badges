function addBadge(url, name = "") {
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

async function addPortrait({character}) {
    let request = fetch("https://esi.evetech.net/v1/universe/ids/", {method: "POST", body: JSON.stringify([character])});
    let response = await request.then(response => response.json());
    if (!response.characters) {
        throw new Error(`Couldn't find character with name "${character}"`);
    }
    let {id, name} = response.characters.find(match => match.name.toLowerCase() === character.toLowerCase());
    addBadge(`https://imageserver.eveonline.com/Character/${id}_1024.jpg`, name);
}

function addImage({url}) {
    addBadge(url);
}

function removeAll() {
    const portraits = document.getElementById("portraits");
    for (let e of Array.from(portraits.children)) {
        portraits.removeChild(e);
    }
}

function onFormSubmit(formName, submitFunction) {
    const form = document.forms[formName];
    form.addEventListener("submit", event => {
        event.preventDefault();
        submitFunction(Object.fromEntries(new FormData(form)));
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    onFormSubmit("add-char-form", addPortrait);
    onFormSubmit("add-image-form", addImage);
});
