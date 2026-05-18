const express = require ('express');
const app = express();
const port = 3000;

// Middleware - JSON reader
app.use(express.json());

// Mock database - variable list array of objects:
// const dataPasien = [
//     { id:1, nama: "Budi Doremi", keluhan: "Demam Tinggi", poli: "umum" },
//     { id:2, nama: "Siti tilulit", keluhan: "Sakit Gigi", poli: "Gigi" },
//     { id:3, nama: "Fajar Mentari", keluhan: "Pusing", poli: "umum" },
//     { id:4, nama: "Afgan Syahreza", keluhan: "Batuk Berdahak", poli: "THT" }
// ];

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

// Pencarian/READ spesifik pasien dgn method GET by ID
app.get('/pasien/:id', (req, res) => {
    // Menangkap angka ID dari URL yg diketik, misal: /pasien/1/
    const idDicari = parseInt(req.params.id);

    // Mencari pasien dalam database mock yg ID nya cocok dgn yg dicari
    const pasienDitemukan = dataPasien.find(pasien => pasien.id === idDicari);

    if (pasienDitemukan) {
        // Jika ketemu, kirim data pasien itu dlm bntuk json
        res.json(pasienDitemukan);
    } else {
        // Kalo ngga ketemu tampilin respon code 400 (not found)
        res.status(400).json({message: "Pasien tidak ditemukan!"});
    }
});

// Menghapus data pasien
app.delete('/pasien/:id', (req, res) => {
    const idDicari = parseInt(req.params.id);
    // Mencari index (baris) ke berapa data pasien itu ada di mock database
     const index = dataPasien.findIndex(pasien => pasien.id === idDicari);

    // Jika index bukan -1, artinya data berhasil ditemukan
    if (index !== -1) {
        // Menghapus 1 data dari index itu
        dataPasien.splice(index, 1);
        res.json({message: `Data pasien dengan ID ${idDicari} berhasil dihapus`});
    } else {
        res.status(400).json({message: "Data pasien tidak ditemukan, data gagal dihapus"});
    }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});