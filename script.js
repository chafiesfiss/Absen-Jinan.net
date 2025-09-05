let map;
let marker;
let absenData = [];

/**
 * Fungsi utama untuk inisialisasi peta dan geolokasi.
 * Dipanggil ketika dokumen sudah selesai dimuat.
 */
function initializeMapAndGeolocation() {
    // Sembunyikan pesan "Memuat peta..." dan tampilkan peta
    document.getElementById('loading-map').style.display = 'none';
    document.getElementById('map').style.display = 'block';

    // Periksa apakah browser mendukung Geolocation API
    if (navigator.geolocation) {
        // Ambil lokasi pengguna saat ini
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lokasiSaatIni = [latitude, longitude];

                // Isi input latitude dan longitude secara otomatis
                document.getElementById('latitude').value = latitude.toFixed(6);
                document.getElementById('longitude').value = longitude.toFixed(6);

                // Buat dan tampilkan peta
                map = L.map('map').setView(lokasiSaatIni, 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Tambahkan penanda (marker) di lokasi saat ini
                marker = L.marker(lokasiSaatIni).addTo(map)
                    .bindPopup("<b>Anda di sini!</b>").openPopup();

                document.getElementById('status').innerText = "Lokasi berhasil diambil. Siap untuk absen.";
            },
            (error) => {
                // Tangani kesalahan jika pengambilan lokasi gagal
                handleGeolocationError(error);
                // Tampilkan peta dengan lokasi default jika terjadi error
                const lokasiDefault = [-6.2088, 106.8456]; // Jakarta
                map = L.map('map').setView(lokasiDefault, 8);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                document.getElementById('status').innerText += " Peta menampilkan lokasi default.";
            }
        );
    } else {
        // Pesan jika browser tidak mendukung geolokasi
        document.getElementById('status').innerText = "Geolokasi tidak didukung oleh browser ini.";
        // Tampilkan peta dengan lokasi default
        const lokasiDefault = [-6.2088, 106.8456];
        map = L.map('map').setView(lokasiDefault, 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

/**
 * Menangani berbagai jenis kesalahan geolokasi.
 * @param {GeolocationPositionError} error
 */
function handleGeolocationError(error) {
    let message;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = "Akses lokasi ditolak. Harap izinkan akses di pengaturan browser.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Informasi lokasi tidak tersedia.";
            break;
        case error.TIMEOUT:
            message = "Permintaan lokasi habis waktu.";
            break;
        default:
            message = "Terjadi kesalahan tidak diketahui.";
            break;
    }
    document.getElementById('status').innerText = `Error: ${message}`;
}

/**
 * Mengambil waktu saat ini dan memperbarui nilainya setiap detik.
 */
function setWaktuOtomatis() {
    const now = new Date();
    const opsiWaktu = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('waktu').value = now.toLocaleDateString('id-ID', opsiWaktu);
}

/**
 * Fungsi utama untuk menyimpan data absensi.
 */
function absen() {
    const nama = document.getElementById('nama').value;
    const waktu = document.getElementById('waktu').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    if (!nama || !waktu || !latitude || !longitude) {
        document.getElementById('status').innerText = "Silakan isi nama dan pastikan lokasi sudah terisi.";
        return;
    }

    const newAbsen = { nama, waktu, latitude, longitude };
    absenData.push(newAbsen);
    updateAbsenList();
    document.getElementById('status').innerText = `${nama} berhasil absen!`;
    document.getElementById('nama').value = '';
}

/**
 * Memperbarui tampilan daftar absensi dalam bentuk tabel.
 */
function updateAbsenList() {
    let absenListDiv = document.getElementById('listAbsensi');
    if (absenData.length === 0) {
        absenListDiv.innerHTML = '<p>Belum ada karyawan yang absen.</p>';
        return;
    }

    let tableHTML = '<table><thead><tr><th>Nama</th><th>Waktu</th><th>Lokasi</th></tr></thead><tbody>';
    absenData.forEach(absen => {
        tableHTML += `<tr><td>${absen.nama}</td><td>${absen.waktu}</td><td>${absen.latitude}, ${absen.longitude}</td></tr>`;
    });
    tableHTML += '</tbody></table>';
    absenListDiv.innerHTML = tableHTML;
}

// Panggil fungsi inisialisasi saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    initializeMapAndGeolocation();
    setWaktuOtomatis();
    updateAbsenList();
    setInterval(setWaktuOtomatis, 1000);
});
