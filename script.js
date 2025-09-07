document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const absenButton = document.getElementById('absen-button');
    const employeeNameInput = document.getElementById('employee-name');
    const statusMessage = document.getElementById('status-message');
    const absenList = document.getElementById('absen-list');
    const mapElement = document.getElementById('map');

    let map, marker;
    const officeLocation = [-6.2088, 106.8456]; // Contoh lokasi kantor: Jakarta

    // 1. Fungsi untuk menampilkan waktu dan tanggal
    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        dateElement.textContent = now.toLocaleDateString('id-ID', optionsDate);
        timeElement.textContent = now.toLocaleTimeString('id-ID', optionsTime);
    }

    // Perbarui waktu setiap detik
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Jalankan pertama kali agar langsung muncul

    // 2. Inisialisasi peta
    function initMap(lat, lon) {
        map = L.map(mapElement).setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup('Lokasi Anda')
            .openPopup();
    }

    // 3. Mendapatkan lokasi pengguna
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                initMap(lat, lon);
            }, error => {
                console.error("Error mendapatkan lokasi: ", error);
                statusMessage.textContent = "Gagal mendapatkan lokasi. Memuat lokasi kantor.";
                statusMessage.style.color = '#dc3545';
                initMap(officeLocation[0], officeLocation[1]);
            });
        } else {
            statusMessage.textContent = "Geolocation tidak didukung oleh browser ini. Memuat lokasi kantor.";
            statusMessage.style.color = '#dc3545';
            initMap(officeLocation[0], officeLocation[1]);
        }
    }

    // Jalankan fungsi untuk mendapatkan lokasi saat halaman dimuat
    getUserLocation();

    // 4. Fungsi untuk tombol absen
    absenButton.addEventListener('click', () => {
        const employeeName = employeeNameInput.value.trim();

        if (employeeName === "") {
            statusMessage.textContent = "Nama karyawan tidak boleh kosong!";
            statusMessage.style.color = '#dc3545';
            return;
        }

        const now = new Date();
        const absenTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // Buat item daftar baru
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${employeeName}</span>
            <span class="absen-time">Pukul ${absenTime}</span>
        `;
        absenList.prepend(listItem);

        // Reset input dan tampilkan pesan sukses
        employeeNameInput.value = "";
        statusMessage.textContent = `Absen berhasil, ${employeeName}!`;
        statusMessage.style.color = '#28a745';
    });
});
