const express = require ('express');
const mongoose = require ('mongoose');
// import model Pasien
const Pasien = require ('./models/Pasien');

const app = express();
const port = 3000;

// Middleware - JSON reader
app.use(express.json());

// Key mongoDB:
const mongoURI = 'mongodb+srv://mfadhol380_db_user:Jhnti9Y79yn22A14@mini-simrs.euqqlbd.mongodb.net/?appName=mini-simrs';

// Menghubungkan Node.js ke MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Berhasil terhubung ke MongoDB Atlas!'))
    .catch((err) => console.log('Gagal terhubung ke MongoDB', err));

// MONGODB:
// READ semua pasien dari MongoDB
app.get('/pasien', async (req, res) => {
    try {
        // Mongoose mencari semua data di database
        const dataPasien = await Pasien.find();
        res.json(dataPasien);
    } catch (error) {
        res.status(500).json({message: "Terjadi kesalahan server"});
    }
});

// CREATE data pasien baru ke MongoDB
app.post('/pasien', async (req, res) => {
    try {
        // Memberikan data dari req.body ke mongoose
        const pasienBaru = new Pasien(req.body);

        // Mongoose menyimpan data ke database scr permanent
        await pasienBaru.save();

        res.status(201).json({message: "Data pasien berhasil disimpan permanen", data: pasienBaru});
    } catch (error) {
        // Jika data tidak sesuai aturan (cth: nama kosong) mongoose akan menolak
        res.status(400).json({message: "Gagal menyimpan data", error: error.message});
    }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});