const express = require ('express');
const mongoose = require ('mongoose');
// import model Pasien
const Pasien = require ('./models/Pasien');
const Dokter = require ('./models/Dokter');
const JanjiTemu = require ('./models/JanjiTemu');
const cors = require ('cors');

const app = express();
const port = 5000;

// Middleware:
// CORS permission agar frontend bebas ambil data
app.use(cors());
// JSON reader
app.use(express.json());

// Key mongoDB:
const mongoURI = 'mongodb+srv://mfadhol380_db_user:Jhnti9Y79yn22A14@mini-simrs.euqqlbd.mongodb.net/?appName=mini-simrs';

// Menghubungkan Node.js ke MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Berhasil terhubung ke MongoDB Atlas!'))
    .catch((err) => console.log('Gagal terhubung ke MongoDB', err));

// Pasien:
// Melihat (GET) semua data pasien dari MongoDB
app.get('/pasien', async (req, res) => {
    try {
        // Mongoose mencari semua data di database
        const dataPasien = await Pasien.find();
        res.json(dataPasien);
    } catch (error) {
        res.status(500).json({message: "Terjadi kesalahan server"});
    }
});

// Membuat (POST) data pasien baru ke MongoDB
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

// Dokter:
// Melihat (GET) semua list dokter
app.get('/dokter', async (req, res) => {
    try {
        const dataDokter = await Dokter.find();
        res.json(dataDokter);
    } catch (error) {
        res.status(500).json({message: "Terjadi kesalahan saat mengambil data dokter"});
    }
});

// Membuat (POST) data dokter baru
app.post('/dokter', async (req, res) => {
    try {
        const dokterBaru = new Dokter(req.body);
        await dokterBaru.save();
        res.status(201).json({message: "Berhasil menambah data dokter baru", data: dokterBaru});
    } catch (error) {
        res.status(400).json({message: "Gagal menyimpan data dokter baru", error: error.message});
    }
});

// Janji Temu Dokter:
// Melihat (GET) daftar antrian
app.get('/janjitemu', async (req, res) => {
    try {
        // .populate() = untuk mengganti ID menjadi data utuh
        const dataJanji = await JanjiTemu.find()
        // mengambil "nama dan keluhan" dari data pasien
        .populate('pasienId', 'nama keluhan')
        // mengambil "nama dan spesialis" dari data dokter
        .populate('dokterId', 'nama spesialisasi');

        res.json(dataJanji);
    } catch (error) {
        res.status(500).json({message: "Terjadi kesalahan pada server", error: error.message});
    }
});

// Membuat (POST) antrian baru
app.post('/janjitemu', async (req, res) => {
    try {
        const janjiBaru = new JanjiTemu(req.body);
        await janjiBaru.save();
        res.status(201).json({message: "Janji temu berhasil dibuat", data: janjiBaru});
    } catch (error) {
        res.status(400).json({message: "Gagal membuat janji temu", error: error.message});
    }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});