// --- BAGIAN KONFIGURASI KEAMANAN (TIDAK AMAN DI FRONTEND) ---
// Perhatian: Token ini SANGAT SENSITIF!
const GITHUB_TOKEN = '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'; 
const REPO_OWNER = 'chafiesfiss';
const REPO_NAME = 'absen-data';
const DISPATCH_ENDPOINT = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;

// --- BAGIAN VARIABEL GLOBAL ---
let map;
let currentPosition = null; // Untuk menyimpan lokasi Latitude dan Longitude
let marker;

// Pastikan semua kode dijalankan setelah elemen HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const mapElement = document.getElementById('map');
    const absenBtn = document.getElementById('absen-btn');
    const nameInput = document.getElementById('name');
    const statusSelect = document.getElementById('status');
    
    // Nonaktifkan tombol absen sampai lokasi terdeteksi
    absenBtn.disabled = true;

    // 1. FUNGSI UNTUK MENAMPILKAN JAM REALTIME
    function updateClock() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        clockElement.textContent = now.toLocaleDateString('id-ID', options);
    }
    updateClock(); 
    setInterval(updateClock, 1000); 

    // 2. FUNGSI UNTUK MENAMPILKAN PETA & LOKASI
    function initMapAndLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation tidak didukung oleh browser Anda.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Simpan lokasi saat ini
                currentPosition = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                // Inisialisasi Peta Leaflet
                map = L.map(mapElement).setView([currentPosition.lat, currentPosition.lon], 16);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // Tambahkan Marker
                marker = L.marker([currentPosition.lat, currentPosition.lon]).addTo(map)
                    .bindPopup('Lokasi Absen Anda')
                    .openPopup();
                
                // Aktifkan tombol karena lokasi sudah ditemukan
                absenBtn.disabled = false;
                absenBtn.textContent = 'Absen Sekarang';
            },
            (error) => {
                console.error("Gagal mendapatkan lokasi: ", error);
                alert("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.");
                absenBtn.textContent = 'Gagal Mendapatkan Lokasi';
            }
        );
    }

    // 3. FUNGSI UNTUK MENGIRIM DATA ABSEN KE GITHUB ACTIONS
    async function kirimDataAbsen(dataAbsen) {
        absenBtn.disabled = true;
        absenBtn.textContent = 'Mengirim...';

        try {
            const response = await fetch(DISPATCH_ENDPOINT, {
                method: 'POST',
                headers: {
                    // Menggunakan token untuk otentikasi
                    'Authorization': `token ${GITHUB_TOKEN}`, 
                    'Accept': 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    event_type: 'absen_request', // Harus sesuai dengan pemicu di workflow .yml
                    client_payload: {
                        data: dataAbsen,
                        name: dataAbsen.nama 
                    }
                })
            });

            if (response.ok) {
                alert('✅ Absen berhasil dikirim ke server (GitHub Actions akan memproses)');
                console.log('Absen berhasil dikirim ke GitHub Actions.');
            } else {
                const error = await response.json();
                alert(`❌ Gagal mengirim absen. Periksa konsol untuk detail kesalahan. (${response.status})`);
                console.error('Gagal mengirim absen:', error);
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi.');
            console.error('Terjadi kesalahan koneksi:', error);
        } finally {
            absenBtn.disabled = false;
            absenBtn.textContent = 'Absen Sekarang';
        }
    }

    // 4. LOGIKA PADA SAAT TOMBOL ABSEN DIKLIK
    absenBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (!name) {
            alert("Nama karyawan harus diisi.");
            return;
        }

        if (!currentPosition) {
            alert("Lokasi belum terdeteksi. Silakan tunggu atau refresh halaman.");
            return;
        }

        const absenData = {
            nama: name,
            status: statusSelect.value,
            waktu: new Date().toISOString(),
            lokasi: {
                latitude: currentPosition.lat.toFixed(6), // Batasi desimal untuk kejelasan
                longitude: currentPosition.lon.toFixed(6)
            }
        };

        // Kirim data absen ke GitHub Actions
        kirimDataAbsen(absenData);

        // Bersihkan input
        nameInput.value = '';
    });

    // Mulai inisialisasi peta dan lokasi
    initMapAndLocation();
});
