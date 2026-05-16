const express = require ('express');
const app = express();
const port = 3000;

// Middleware - JSON reader
app.use(express.json());

// Mock database - variable list array of objects:
const dataPasien = [
    { id:1, nama: "Budi Doremi", keluhan: "Demam Tinggi", poli: "umum" },
    { id:2, nama: "Siti tilulit", keluhan: "Sakit Gigi", poli: "Gigi" }
];

// Endpoint testing: root
app.get('/', (req, res) => {
    res.send("Endpoint root SIMRS Works!");
});

// Endpoint: pasien
app.get('/pasien', (req, res) => {
    // Mengirim dataPasien dari mockup db ke bentuk JSON
    res.json(dataPasien);
});

// Menambah data pasien baru
app.post('/pasien', (req, res) => {
    // Menangkap data JSON yang dikirim dari frontend/thunder client
    const pasienBaru = req.body;

    // Input data pasien baru ke db/backend
    dataPasien.push(pasienBaru);

    // Respon setelah data berhasil diinput ke db/backend
    res.json({ message: "Data pasien berhasil ditambahkan!", data: pasienBaru });
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});