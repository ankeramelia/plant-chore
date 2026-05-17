const STORAGE_KEY = "plants";
let collection = [];

function getPlantFormValues() {
    return {
        type: document.getElementById("plantType").value.trim(),
        name: document.getElementById("plantName").value.trim(),
        substrate: document.getElementById("growingMed").value.trim(),
        water: document.getElementById("waterType").value,
        birthday: document.getElementById("plantBirth").value,
        imageFile: document.getElementById("firstImg").files[0] || null
    };
}

function resetPlantForm() {
    document.getElementById("plantType").value = "";
    document.getElementById("plantName").value = "";
    document.getElementById("growingMed").value = "";
    document.getElementById("waterType").value = "";
    document.getElementById("plantBirth").value = "";
    document.getElementById("firstImg").value = null;
}

function savePlants() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

function createPlantObject(formValues, imageData) {
    return {
        type: formValues.type,
        name: formValues.name,
        substrate: formValues.substrate,
        water: formValues.water,
        birthday: formValues.birthday,
        image: imageData,
        logs: []
    };
}

function addPlant() {
    const formValues = getPlantFormValues();
    const reader = new FileReader();

    reader.onload = () => {
        collection.push(createPlantObject(formValues, reader.result));
        savePlants();
        displayPlants();
        resetPlantForm();
        // redirect back to garden as confirmation
        window.location.href = "garden.html";
    };

    if (formValues.imageFile) {
        reader.readAsDataURL(formValues.imageFile);
    } else {
        collection.push(createPlantObject(formValues, ""));
        savePlants();
        displayPlants();
        resetPlantForm();
        window.location.href = "garden.html";
    }
}

function loadPlants() {
    const savedPlants = localStorage.getItem(STORAGE_KEY);
    collection = savedPlants ? JSON.parse(savedPlants) : [];
}

function displayPlants() {
    const noPlant = document.getElementById("noPlants");
    const plantList = document.getElementById("plantList");

    if (!plantList || !noPlant) {
        return;
    }

    plantList.innerHTML = "";

    if (collection.length === 0) {
        noPlant.style.display = "block";
        return;
    }

    noPlant.style.display = "none";

    collection.forEach((plant, index) => {
        plantList.innerHTML += `
            <div class="plantCard" data-index="${index}">
                <img src="${plant.image}">
                <h3>${plant.name}</h3>
                <p>${plant.type}</p>
                <p>${plant.substrate}</p>
                <p>${plant.birthday}</p>
                <p>${plant.water}</p>
                <button class="remove-btn">Remove Plant</button>
            </div>
        `;
    });

    attachPlantListHandlers();
}

function attachPlantListHandlers() {
    const plantList = document.getElementById('plantList');
    if (!plantList) return;

    // delegate clicks: open log on card click, remove on remove button
    plantList.onclick = function (e) {
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const card = e.target.closest('.plantCard');
            const idx = parseInt(card.dataset.index, 10);
            removePlant(idx);
            return;
        }

        const card = e.target.closest('.plantCard');
        if (card) {
            const idx = parseInt(card.dataset.index, 10);
            openPlantLog(idx);
        }
    };
}

function removePlant(index) {
    collection.splice(index, 1);
    savePlants();
    displayPlants();
}

// Modal for plant log
function ensureLogModal() {
    if (document.getElementById('plantLogModal')) return;

    const modal = document.createElement('div');
    modal.id = 'plantLogModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close">×</button>
            <div class="modal-content">
                <header class="modal-header">
                    <h2 id="logPlantName"></h2>
                    <img id="logPlantImage" alt="plant" />
                </header>
                <section id="logEntries"></section>
                <form id="logForm">
                    <label for="logType">Type</label>
                    <select id="logType">
                        <option value="water">Water</option>
                        <option value="fertilizer">Fertilizer</option>
                        <option value="note">Note</option>
                    </select>
                    <label for="logDate">Date</label>
                    <input id="logDate" type="date" />
                    <label for="logNotes">Notes</label>
                    <input id="logNotes" type="text" placeholder="What did you do?" />
                    <label for="logPhoto">Progress photo</label>
                    <input id="logPhoto" type="file" accept="image/*" />
                    <button type="submit">Add entry</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // handlers
    modal.querySelector('.modal-close').addEventListener('click', closePlantLog);
    modal.addEventListener('click', (e) => { if (e.target === modal) closePlantLog(); });
    modal.querySelector('#logForm').addEventListener('submit', handleLogSubmit);
}

let currentLogIndex = null;

function openPlantLog(index) {
    ensureLogModal();
    currentLogIndex = index;
    const plant = collection[index];
    const modal = document.getElementById('plantLogModal');
    modal.style.display = 'flex';
    document.getElementById('logPlantName').textContent = plant.name || 'Unnamed';
    const imgEl = document.getElementById('logPlantImage');
    imgEl.src = plant.image || '';
    renderLogEntries();
}

function closePlantLog() {
    const modal = document.getElementById('plantLogModal');
    if (modal) modal.style.display = 'none';
    currentLogIndex = null;
}

// close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlantLog();
});

function renderLogEntries() {
    const container = document.getElementById('logEntries');
    container.innerHTML = '';
    const plant = collection[currentLogIndex];
    if (!plant || !plant.logs || plant.logs.length === 0) {
        container.innerHTML = '<p>No entries yet.</p>';
        return;
    }

    plant.logs.slice().reverse().forEach((entry) => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <strong>${entry.type}</strong> — <em>${entry.date || ''}</em>
            <p>${entry.notes || ''}</p>
        `;
        if (entry.photo) {
            const img = document.createElement('img');
            img.src = entry.photo;
            img.className = 'log-photo';
            div.appendChild(img);
        }
        container.appendChild(div);
    });
}

function handleLogSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('logType').value;
    const date = document.getElementById('logDate').value;
    const notes = document.getElementById('logNotes').value.trim();
    const file = document.getElementById('logPhoto').files[0];

    function saveEntry(photoData) {
        const entry = { type, date, notes, photo: photoData || null };
        collection[currentLogIndex].logs = collection[currentLogIndex].logs || [];
        collection[currentLogIndex].logs.push(entry);
        savePlants();
        renderLogEntries();
        document.getElementById('logForm').reset();
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = () => saveEntry(reader.result);
        reader.readAsDataURL(file);
    } else {
        saveEntry(null);
    }
}

window.addEventListener('load', () => {
    loadPlants();
    displayPlants();
});
