let map;
let marker;

// Fungsi yang dipanggil oleh Google Maps API setelah dimuat
function initMap() {
    // Memeriksa apakah browser mendukung Geolocation API
    if (navigator.geolocation) {
        // Mengambil lokasi pengguna saat ini
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lokasiSaatIni = { lat: latitude, lng: longitude };

                // Mengisi input latitude dan longitude
                document.getElementById('latitude').value = latitude.toFixed(6);
                document.getElementById('longitude').value = longitude.toFixed(6);

                // Membuat dan menampilkan peta
                map = new google.maps.Map(document.getElementById("map"), {
                    center: lokasiSaatIni,
                    zoom: 15, // Zoom level yang lebih detail
                });

                // Menambahkan marker di lokasi saat ini
                marker = new google.maps.Marker({
                    position: lokasiSaatIni,
                    map: map,
                });

                document.getElementById('status').innerText = "Lokasi berhasil diambil.";
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

// Memuat skrip Google Maps API secara dinamis
function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap";
    script.async = true;
    document.head.appendChild(script);
}

// Memuat skrip saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', loadGoogleMapsScript);