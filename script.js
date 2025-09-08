// =================================================================
// --- BAGIAN KONFIGURASI (SANGAT SENSITIF & TIDAK AMAN DI FRONTEND) ---
// =================================================================
// PENTING: Jangan gunakan token ini di aplikasi publik.
// Solusi ini HANYA untuk demo atau pembelajaran.
const GITHUB_TOKEN = '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'; 
const REPO_OWNER = 'chafiesfiss';
const REPO_NAME = 'absen-data';
const DISPATCH_ENDPOINT = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;

// =================================================================
// --- VARIABEL GLOBAL & PEMILIH ELEMEN ---
// =================================================================
const clockElement = document.getElementById('clock');
const mapElement = document.getElementById('map');
const absenBtn = document.getElementById('absen-btn');
const nameInput = document.getElementById('name');
const statusSelect = document.getElementById('status');

let map;
let currentPosition = null;

// =================================================================
// --- FUNGSI-FUNGSI UTAMA ---
// =================================================================

/**
 * Memperbarui tampilan jam setiap detik.
 */
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

/**
 * Menginisialisasi peta dan mendapatkan lokasi pengguna.
 */
function initMapAndLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation tidak didukung oleh browser Anda.");
        absenBtn.disabled = true;
        absenBtn.textContent = 'Geolocation Tidak Didukung';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentPosition = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            if (mapElement) {
                map = L.map(mapElement).setView([currentPosition.lat, currentPosition.lon], 16);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([currentPosition.lat, currentPosition.lon]).addTo(map)
                    .bindPopup('Lokasi Absen Anda')
                    .openPopup();
                
                absenBtn.disabled = false;
                absenBtn.textContent = 'Absen Sekarang';
            }
        },
        (error) => {
            console.error("Gagal mendapatkan lokasi:", error);
            alert("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.");
            absenBtn.textContent = 'Gagal Mendapatkan Lokasi';
        }
    );
}

/**
 * Mengirim data absen dalam format JSON ke GitHub Actions.
 * @param {object} dataAbsen - Objek data absen.
 */
async function kirimDataAbsen(dataAbsen) {
    absenBtn.disabled = true;
    absenBtn.textContent = 'Mengirim...';

    try {
        const response = await fetch(DISPATCH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                event_type: 'absen_request',
                client_payload: {
                    data: dataAbsen,
                    name: dataAbsen.nama 
                }
            })
        });

        if (response.ok) {
            alert('✅ Absen berhasil dikirim. GitHub Actions akan memproses data Anda.');
            nameInput.value = ''; // Mengosongkan input nama
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

// =================================================================
// --- EVENT LISTENER & INISIALISASI ---
// =================================================================

// Menjalankan semua kode setelah DOM (struktur HTML) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Mulai jam
    updateClock(); 
    setInterval(updateClock, 1000); 

    // Mulai peta dan minta izin lokasi
    initMapAndLocation();

    // Menambahkan event listener pada tombol absen
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
                latitude: currentPosition.lat.toFixed(6),
                longitude: currentPosition.lon.toFixed(6)
            }
        };

        // Memanggil fungsi untuk mengirim data
        kirimDataAbsen(absenData);
    });
});

