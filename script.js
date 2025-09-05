let map;
let marker;
let absenData = [];

// Fungsi utama yang dipanggil oleh Google Maps API setelah dimuat
function initMap() {
    // Memeriksa apakah browser mendukung Geolocation API
    if (navigator.geolocation) {
        // Mengambil lokasi pengguna saat ini
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lokasiSaatIni = { lat: latitude, lng: longitude };

                // Mengisi input latitude dan longitude secara otomatis
                document.getElementById('latitude').value = latitude.toFixed(6);
                document.getElementById('longitude').value = longitude.toFixed(6);

                // Membuat dan menampilkan peta
                map = new google.maps.Map(document.getElementById("map"), {
                    center: lokasiSaatIni,
                    zoom: 15,
                });

                // Menambahkan marker di lokasi saat ini
                marker = new google.maps.Marker({
                    position: lokasiSaatIni,
                    map: map,
                });

                document.getElementById('status').innerText = "Lokasi berhasil diambil. Siap untuk absen.";
            },
            (error) => {
                // Menangani kesalahan jika pengambilan lokasi gagal
                handleGeolocationError(error);
                // Menampilkan peta dengan lokasi default jika terjadi error
                const lokasiDefault = { lat: -6.2088, lng: 106.8456 }; // Jakarta
                map = new google.maps.Map(document.getElementById("map"), {
                    center: lokasiDefault,
                    zoom: 8,
                });
                document.getElementById('status').innerText += " Peta menampilkan lokasi default.";
            }
        );
    } else {
        // Pesan jika browser tidak mendukung geolokasi
        document.getElementById('status').innerText = "Geolokasi tidak didukung oleh browser ini.";
        // Menampilkan peta dengan lokasi default
        const lokasiDefault = { lat: -6.2088, lng: 106.8456 };
        map = new google.maps.Map(document.getElementById("map"), {
            center: lokasiDefault,
            zoom: 8,
        });
    }
}

// Menangani berbagai jenis kesalahan geolokasi
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

// Mengambil waktu saat ini dan memperbaruinya setiap detik
function setWaktuOtomatis() {
    const now = new Date();
    const opsiWaktu = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('waktu').value = now.toLocaleDateString('id-ID', opsiWaktu);
}

// Fungsi utama untuk absen
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

// Memperbarui daftar absensi
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

// Memuat skrip Google Maps API secara dinamis saat dokumen siap
function loadGoogleMapsScript() {
    const script = document.createElement('script');
    // Masukkan kunci API Google Maps Anda di sini
    script.src = "https://maps.googleapis.com/maps/api/js?key=MASUKKAN_KUNCI_API_ANDA_DI_SINI&callback=initMap";
    script.async = true;
    document.head.appendChild(script);
}

// Panggil fungsi inisialisasi saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    setWaktuOtomatis();
    updateAbsenList();
    loadGoogleMapsScript();
    setInterval(setWaktuOtomatis, 1000);
});
