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
        // Ambil payload dari frontend
        const {nama, keluhan, poli, nomorBpjs} = req.body;

        // Backend call API server BPJS (simulasi)
        // localhots:5000 akan diganti pakai url BPJS
        const responBpjs = await fetch (`http://localhost:5000/api-luar/bpjs/${nomorBpjs}`);
        const dataBpjs = await responBpjs.json();

        // Jika No. kartu ngawur/tidak valid, tolak registrasinya
        if (!responBpjs.ok) {
            return res.status(400).json({
                message: "Pendaftaran ditolak " + dataBpjs.message
            });
        }

        // Jika No. kartu BPJS Valid/Menunggak, lanjut membuat data pasien
        const pasienBaru = new Pasien({
            nama,
            keluhan,
            poli,
            nomorBpjs,
            statusBpjs: dataBpjs.status
        });

        // Mongoose menyimpan data ke database scr permanent
        await pasienBaru.save();

        res.status(201).json({
            message: "Data pasien berhasil didaftarkan",
            data: pasienBaru
        });
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

// Mengubah (PUT) status antrian berdasarkan ID Janji Temu
app.put('/janjitemu/:id', async (req, res) => {
    try {
        // Menangkap ID dari dari URL (req.params.id)
        const idJanji = req.params.id;

        // Menangkap status baru dari body/JSON (req.body.status)
        const statusBaru = req.body.status;

        // Meminta Mongoose mencari ID tsb dan langsung mengubah statusnya
        const janjiDiupdate = await JanjiTemu.findByIdAndUpdate(
            idJanji,
            {status: statusBaru},
            // Rules yg akan meminta Mongoose me-return data paling terbaru
            // RunValidators akan memaksa mongoose mengecek aturan enum-nya
            {
                new: true,
                runValidators: true
            }
        );

        // Jika ID tidak valid/tidak ditemukan di database
        if (!janjiDiupdate) {
            return res.status(404).json({message: "Data janji temu tidak ditemukan!"});
        }

        // Jika ID berhasil ditemukan
        res.json({message: "Status antrean berhasil diperbarui!", data: janjiDiupdate});
    } catch {
        res.status(400).json({message: "Gagal memperbarui status", error: error.message});
    }
});

// Menghapus (DELETE) data janji temu berdasarkan ID
app.delete('/janjitemu/:id', async (req, res) => {
    try {
        // Menangkap ID dari URL
        const idJanji = req.params.id;

        // Meminta mongoose mencari ID tsb dan menghapusnya dari DB
        const janjiDihapus = await JanjiTemu.findByIdAndDelete(idJanji);

        // Jika ID yang dikirim tidak ada di DB maka tampilkan pesan
        if (!janjiDihapus) {
            return res.status(404).json({message: "Data tidak ditemukan, gagal menghapus data!"});
        }

        // Jika berhasil dieksekusi maka tampilkan pesan
        res.json({message: "Data janji temu berhasil dihapus permanen!"});
    } catch (error) {
        res.status(500).json({message: "Terjadi kesalahan pada server", error: error.message});
    }
});


// Simulasi server BPJS:
// Memeriksa (GET) status kartu BPJS pasien
app.get('/api-luar/bpjs/:nomorKartu', (req, res) => {
    const nomor = req.params.nomorKartu;

    // Mock database peserta BPJS seluruh indonesia
    if (nomor === "1234567890") {
        return res.json({
            status: "AKTIF",
            namaPeserta: "Oksa",
            kelas: "Kelas 2"
        });
    } else if (nomor === "0987654321") {
        return res.json ({
            status: "MENUNGGAK",
            namaPeserta: "Ratna",
            kelas: "Kelas 1"
        });
    }

    // Jika nomor bpjs tidak ditemukan, berarti tidak terdaftar/palsu
    else {
        return res.status(404).json ({
            status: "TIDAK DITEMUKAN",
            pesan: "Nomor karu BPJS Anda tidak terdaftar dalam sistem."
        });
    }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});