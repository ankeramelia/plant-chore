let collection = [];

// add plant
function addPlant() {

    let plantType = document.getElementById("plantType").value;
    let plantName = document.getElementById("plantName").value;
    let substrate = document.getElementById("growingMed").value;
    let water = document.getElementById("waterType").value;
    let plantBday = document.getElementById("plantBirth").value;
    let file = document.getElementById("firstImg").files[0];

    let reader = new FileReader();

    reader.onload = function () {

        let plant = {
            type: plantType,
            name: plantName,
            substrate: substrate,
            water: water,
            birthday: plantBday,
            image: reader.result
        };

        collection.push(plant);

        localStorage.setItem("plants", JSON.stringify(collection));

        displayPlants();
    };

    if (file) {
        reader.readAsDataURL(file);
    }

    document.getElementById("plantType").value = "";
    document.getElementById("plantName").value = "";
    document.getElementById("growingMed").value = "";
    document.getElementById("waterType").value = "";
    document.getElementById("plantBirth").value = "";
    document.getElementById("firstImg").value = null;
}

// load from storage
window.onload = function () {

    let savedPlants = localStorage.getItem("plants");

    if (savedPlants) {
        collection = JSON.parse(savedPlants);
    } else {
        collection = [];
    }

    displayPlants();
};

// display plants
function displayPlants() {

    let noPlant = document.getElementById("noPlants");
    let plantList = document.getElementById("plantList");

    plantList.innerHTML = "";

    if (collection.length < 1) {
        noPlant.style.display = "block";
        return;
    } else {
        noPlant.style.display = "none";
    }

    for (let i = 0; i < collection.length; i++) {

        let plant = collection[i];

        plantList.innerHTML += `
            <div class="plantCard">
                <img src="${plant.image}">
                <h3>${plant.name}</h3>
                <p>${plant.type}</p>
                <p>${plant.substrate}</p>
                <p>${plant.birthday}</p>
                <p>${plant.water}</p>

                <button onclick="removePlant(${i})">Remove Plant</button>
            </div>
        `;
    }
}

// remove plant
function removePlant(index) {

    collection.splice(index, 1);

    localStorage.setItem("plants", JSON.stringify(collection));

    displayPlants();
}