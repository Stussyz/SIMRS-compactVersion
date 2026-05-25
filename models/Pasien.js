const mongoose = require('mongoose');

// Membuat blueprint aturan data
const pasienSchema = new mongoose.Schema({
    nama: {
        type: String,
        // required = data nama bersifat wajib
        required: true 
    },
    keluhan: {
        type: String,
        required: true
    },
    poli: {
        type: String,
        required: true
    },
    tanggalDaftar: {
        type: Date,
        // jika date tidak diisi maka otomatis diisi tanggal sekarang
        default: Date.now
    },
    nomorBpjs: {
        type: String,
        required: true
    },
    statusBpjs: {
        type: String
    },
    tanggalDaftar: {
        type: Date,
        default: Date.now
    }
});

// Mengubah blueprint menjadi "Model" dan diexport
module.exports = mongoose.model('Pasien', pasienSchema);