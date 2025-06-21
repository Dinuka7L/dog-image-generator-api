let timer;
let deletefirstphotodelay;

async function start() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all');
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        createbreedlist(data.message);
    } catch (e) {
        console.error("Error fetching breed list:", e);
        document.getElementById("breed").innerHTML = `<p>Error loading breeds. Please try again later.</p>`;
    }
}

start();

function createbreedlist(breedlist) {
    document.getElementById("breed").innerHTML = `
    <select onchange="loadbybreed(this.value)">
        <option>Select a breed</option>
        ${Object.keys(breedlist).map(function (breed) {
            return `<option value="${breed}">${breed}</option>`;
        }).join('')}
    </select>
    `;
}

async function loadbybreed(breed) {
    if (breed !== "Select a breed") {
        try {
            const response = await fetch(`https://dog.ceo/api/breed/${breed}/list`);
            if (!response.ok) throw new Error('Error fetching sub-breeds.');
            const data = await response.json();
            if (data.message.length > 0) {
                createsubreedlist(breed, data.message);
            } else {
                document.getElementById("sub-breed").innerHTML = '';
                loadImages(breed);
            }
        } catch (e) {
            console.error("Error loading sub-breed list:", e);
        }
    }
}

function createsubreedlist(breed, subbreeds) {
    document.getElementById("sub-breed").innerHTML = `
    <select onchange="loadImages('${breed}', this.value)">
        <option>Select a sub-breed</option>
        ${subbreeds.map(function (sub) {
            return `<option value="${sub}">${sub}</option>`;
        }).join('')}
    </select>
    `;
}

async function loadImages(breed, subbreed = null) {
    let url = subbreed ?
        `https://dog.ceo/api/breed/${breed}/${subbreed}/images` :
        `https://dog.ceo/api/breed/${breed}/images`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error fetching images.');
        const data = await response.json();
        createslideshow(data.message);
    } catch (e) {
        console.error("Error loading images:", e);
        document.getElementById("slideshow").innerHTML = `<p style="color:white; text-align:center;">Failed to load images. Try again later.</p>`;
    }
}

function createslideshow(images) {
    let currentIndex = 0;
    clearInterval(timer);
    clearTimeout(deletefirstphotodelay);

    if (images.length > 1) {
        document.getElementById("slideshow").innerHTML = `
        <div class="slide" style="background-image: url('${images[0]}')"></div>
        <div class="slide" style="background-image: url('${images[1]}')"></div>
        `;
        currentIndex += 2;
        if (images.length === 2) currentIndex = 0;

        timer = setInterval(nextslide, 3000);
    } else {
        document.getElementById("slideshow").innerHTML = `
        <div class="slide" style="background-image: url('${images[0]}')"></div>
        <div class="slide"></div>
        `;
    }

    function nextslide() {
        document.getElementById("slideshow").insertAdjacentHTML('beforeend',
            `<div class="slide" style="background-image: url('${images[currentIndex]}')"></div>`);
        deletefirstphotodelay = setTimeout(function () {
            document.querySelectorAll(".slide")[0].remove();
            currentIndex++;
            if (currentIndex >= images.length) {
                currentIndex = 0;
            }
        }, 1000);
    }
}
