const mongoose = require('mongoose');

const dokterSchema = new mongoose.Schema({
    nama : {
        type: String,
        // nama dokter wajib diisi
        required: true
    },
    spesialisasi : {
        type: String,
        // harus sesuai dengan poli yang dituju
        required: true
    },
    jadwalHari : {
        type: String,
        // misal: senin - rabu
        required: true
    },
    jamPraktik : {
        type: String,
        // misal: 09:00-12:00
        required: true
    }
});

// export blueprint ke mongoose utk dibuat sbg model
module.exports = mongoose.model('Dokter', dokterSchema);