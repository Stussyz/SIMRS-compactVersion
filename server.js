const express = require ('express');
const app = express();
const port = 3000;

// Mock database - variable list array of objects:
const dataPasien = [
    { id:1, nama: "Budi Doremi", keluhan: "Demam Tinggi", poli: "umum" },
    { id:2, nama: "Siti tilulit", keluhan: "Sakit Gigi", poli: "Gigi" }
];

// Endpoint: root
app.get('/', (req, res) => {
    res.send("Endpoint root SIMRS Works!");
});

// Endpoint: pasien
app.get('/pasien', (req, res) => {
    // Mengirim dataPasien dari mockup db ke bentuk JSON
    res.json(dataPasien);
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});