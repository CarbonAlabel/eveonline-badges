function addBadge(url, name = "", bgSelector = false) {
    const badge = document.createElement("div");
    badge.innerHTML = `<img src="${url}"><br/>${name}<br/>
<select onchange="this.parentElement.children[0].className = this.value + '-border'">
    <option value="none">No border</option>
    <option value="gold">Gold</option>
    <option value="yellow">Amarr</option>
    <option value="blue">Caldari</option>
    <option value="green">Gallente</option>
    <option value="red">Minmatar</option>
</select>
<select onchange="this.parentElement.children[0].style.backgroundColor = this.value" style="display: ${bgSelector ? "inline-block" : "none"};">
    <option value="white">White BG</option>
    <option value="black">Black BG</option>
</select>
<button class="print-hide" onclick="this.parentElement.parentElement.removeChild(this.parentElement)">Remove</button>`;
    document.getElementById("badges").appendChild(badge);
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
        const formData = Object.fromEntries(new FormData(form));
        Promise.resolve(submitFunction(formData)).catch(alert);
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    onFormSubmit("add-char-form", addPortrait);
    onFormSubmit("add-image-form", addImage);
});
