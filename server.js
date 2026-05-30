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
        const {nama, spesialisasi, jadwalHari, jamPraktik} = req.body
        const dokterBaru = new Dokter({
            nama,
            spesialisasi,
            jadwalHari,
            jamPraktik
        });
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

// Membuat (POST) antrian janji temu baru
app.post('/janjitemu', async (req, res) => {
    try {
        // 1. Ekstrak data yang dibutuhkan dari req.body untuk dihitung
        const { dokterId, tanggalJanji } = req.body;

        // 2. Cari dokter untuk mendapatkan polinya
        const dataDokter = await Dokter.findById(dokterId);
        if (!dataDokter) {
            return res.status(404).json({ message: "Dokter tidak ditemukan" });
        }

        // 3. Buat Kode Poli
        let kodePoli = dataDokter.spesialisasi.substring(0, 3).toUpperCase();
        if (kodePoli === "UMU") kodePoli = "UMM";

        // 4. Hitung rentang waktu hari tersebut
        const awalHari = new Date(tanggalJanji);
        awalHari.setHours(0, 0, 0, 0);
        const akhirHari = new Date(tanggalJanji);
        akhirHari.setHours(23, 59, 59, 999);

        // 5. Hitung jumlah pasien
        const jumlahPasienHariIni = await JanjiTemu.countDocuments({
            dokterId: dokterId,
            tanggalJanji: { $gte: awalHari, $lte: akhirHari }
        });

        // 6. Buat nomor antrean (Contoh: UMM-001)
        const urutanSelanjutnya = jumlahPasienHariIni + 1;
        const nomorAntreanResmi = `${kodePoli}-${urutanSelanjutnya.toString().padStart(3, '0')}`;

        // 7. Simpan ke DB dengan style Spread Operator
        // ...req.body artinya "ambil semua isi req.body yang asli, lalu tambahkan nomorAntrean di dalamnya"
        const janjiBaru = new JanjiTemu({
            ...req.body, 
            nomorAntrean: nomorAntreanResmi
        });
        
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
// 1. Variabel Penampung - Array of Objects (Mock Database BPJS)
const mockDatabaseBpjs = [
  {
    nomorKartu: "1234567890",
    namaPeserta: "Oksa",
    status: "AKTIF",
    kelas: "Kelas 2"
  },
  {
    nomorKartu: "0987654321",
    namaPeserta: "Ratna",
    status: "MENUNGGAK",
    kelas: "Kelas 3"
  },
  {
    nomorKartu: "1122334455",
    namaPeserta: "Dewi",
    status: "AKTIF",
    kelas: "Kelas 1"
  },
  {
    nomorKartu: "2233445566",
    namaPeserta: "Budi",
    status: "AKTIF",
    kelas: "Kelas 3"
  },
  {
    nomorKartu: "3344556677",
    namaPeserta: "Andi",
    status: "AKTIF",
    kelas: "Kelas 2"
  },
  {
    nomorKartu: "4455667788",
    namaPeserta: "Intan",
    status: "Menunggak",
    kelas: "Kelas 2"
  },
];

// 2. Pengecekan BPJS
app.get('/api-luar/bpjs/:nomorKartu', (req, res) => {
  const nomor = req.params.nomorKartu;

  // Mencari data di dalam array. 
  // Jika ketemu, seluruh data pasien itu akan masuk ke variabel 'pasienDitemukan'
  // Jika tidak ketemu, isinya akan menjadi 'undefined'
  const pasienDitemukan = mockDatabaseBpjs.find(pasien => pasien.nomorKartu === nomor);

  if (pasienDitemukan) {
    // Jika data ditemukan, kita kembalikan datanya ke Frontend
    return res.json({ 
      status: pasienDitemukan.status, 
      namaPeserta: pasienDitemukan.namaPeserta, 
      kelas: pasienDitemukan.kelas 
    });
  } else {
    // Jika data undefined (tidak ketemu)
    return res.status(404).json({ 
      status: "TIDAK DITEMUKAN", 
      pesan: "Nomor kartu BPJS Anda tidak terdaftar dalam sistem." 
    });
  }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Server running di port ${port}`);
});