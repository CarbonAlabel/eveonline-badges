// Make a request to ESI, throwing an error if it fails, or returning the parsed JSON response.
async function request(...args) {
    let request = await fetch(...args);
    if (!request.ok) {
        throw new Error(`ESI responded with a ${request.status} error`);
    }
    return request.json();
}

const esi = "https://esi.evetech.net";

function cachedGetter(url) {
    const promise = Symbol(), resolved = Symbol();
    return function () {
        if (this[resolved]) {
            return this[resolved];
        }
        if (!this[promise]) {
            this[promise] = request(url);
            this[promise].then(response => {
                this[resolved] = response;
            }).finally(() => {
                this[promise] = null;
            });
        }
        return this[promise];
    };
}

const universe = {};
Object.defineProperties(universe, {
    races: {get: cachedGetter(esi + "/v1/universe/races/")},
    bloodlines: {get: cachedGetter(esi + "/v1/universe/bloodlines/")},
    ancestries: {get: cachedGetter(esi + "/v1/universe/ancestries/")},
});

async function init() {
    const svg_request = await fetch("front.v2.svg");
    const svg_content = await svg_request.text();
    const svg_placeholders = document.querySelectorAll(".svg-placeholder");
    for (let placeholder of svg_placeholders) {
        placeholder.outerHTML = svg_content;
    }
    const svgs = document.querySelectorAll("svg");
    for (let svg of svgs) {
        svg.querySelector(".portrait").addEventListener("click", () => {
            fill(svg).catch(alert);
        });
    }
}

async function fill(svg) {
    let input = prompt("Enter character name:");
    if (!input) return;
    input = input.trim().toLowerCase();
    const ids = await request(esi + "/v1/universe/ids/", {method: "POST", body: JSON.stringify([input])});
    if (!ids.characters) {
        throw new Error(`Couldn't find character with name "${input}"`);
    }
    const {id, name} = ids.characters.find(match => match.name.toLowerCase() === input);
    const character = await request(esi + `/v4/characters/${id}/`);
    svg.querySelector(".portrait").setAttribute("href", `https://imageserver.eveonline.com/Character/${id}_1024.jpg`);
    svg.querySelector(".id").textContent = id;
    setText(svg.querySelector(".name"), name, 160);
    setText(svg.querySelector(".dob"), character.birthday.substring(0, 10), 95);
    setText(svg.querySelector(".race"), (await universe.races).find(race => race.race_id == character.race_id).name, 90);
    setText(svg.querySelector(".bloodline"), (await universe.bloodlines).find(bloodline => bloodline.bloodline_id == character.bloodline_id).name, 70);
    setText(svg.querySelector(".ancestry"), (await universe.ancestries).find(ancestry => ancestry.id == character.ancestry_id).name, 75);
}

function setText(element, text, maxWidth) {
    element.textContent = text;
    element.removeAttribute("textLength");
    if (element.getBBox().width > maxWidth) {
        element.setAttribute("textLength", maxWidth);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch(alert);
});