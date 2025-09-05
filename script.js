let map;
let marker;

/**
 * Fungsi utama untuk inisialisasi peta dan geolokasi.
 * Dipanggil ketika dokumen sudah selesai dimuat.
 */
function initMap() {
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

// Panggil fungsi inisialisasi peta saat dokumen sudah siap
document.addEventListener('DOMContentLoaded', initMap);
