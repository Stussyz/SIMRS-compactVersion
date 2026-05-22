const mongoose = require('mongoose');

// Membuat blueprint (schema) untuk janji temu
const janjiTemuSchema = new mongoose.Schema({
    // Menghubungkan ke id pasien
    pasienId: {
        // Tipe data khusus utk ID MongoDB
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasien',
        required: true
    },

    // Menghubungkan ke id dokter
    dokterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dokter',
        required: true
    },

    // Jadwal pasien
    tanggalJanji: {
        type: Date,
        required: true
    },

    // Status Antrian
    status: {
        type: String,
        // pilihan opsi tidak boleh diluar dari ke 3 kata tsb
        enum: ['Menunggu', 'Selesai', 'Dibatalkan'],
        default: 'Menunggu'
    },

    // Pembuatan data
    tanggalDibuat: {
        type: Date,
        default: Date.now
    }
});

// export blueprint ke mongoose
module.exports = mongoose.model('JanjiTemu', janjiTemuSchema);