document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const absenButton = document.getElementById('absen-button');
    const employeeNameInput = document.getElementById('employee-name');
    const statusMessage = document.getElementById('status-message');
    const absenList = document.getElementById('absen-list'); // Pastikan element ini ada jika digunakan
    const mapElement = document.getElementById('map');

    let map, marker;
    const officeLocation = [-6.2088, 106.8456]; // Lokasi kantor Jakarta

    // Fungsi untuk menampilkan waktu dan tanggal
    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

        dateElement.textContent = now.toLocaleDateString('id-ID', optionsDate);
        timeElement.textContent = now.toLocaleTimeString('id-ID', optionsTime);
    }

    // Perbarui waktu setiap detik
    setInterval(updateDateTime, 1000);
    updateDateTime(); // jalankan segera saat halaman load

    // Fungsi inisialisasi peta
    function initMap(lat, lon) {
        if (!map) {
            map = L.map(mapElement).setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        } else {
            map.setView([lat, lon], 13);
        }

        if (marker) {
            marker.setLatLng([lat, lon]);
        } else {
            marker = L.marker([lat, lon]).addTo(map);
        }
        marker.bindPopup('Lokasi Anda').openPopup();
    }

    // Mendapatkan lokasi pengguna
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    initMap(lat, lon);
                },
                (error) => {
                    console.error("Error mendapatkan lokasi: ", error);
                    statusMessage.textContent = "Gagal mendapatkan lokasi. Memuat lokasi kantor.";
                    statusMessage.style.color = '#dc3545';
                    initMap(officeLocation[0], officeLocation[1]);
                }
            );
        } else {
            statusMessage.textContent = "Geolocation tidak didukung oleh browser ini. Memuat lokasi kantor.";
            statusMessage.style.color = '#dc3545';
            initMap(officeLocation[0], officeLocation[1]);
        }
    }

    // Panggil fungsi lokasi saat halaman selesai load
    getUserLocation();

    // Tombol absen
    absenButton.addEventListener('click', async () => {
        const employeeName = employeeNameInput.value.trim();

        if (employeeName === "") {
            statusMessage.textContent = "Nama karyawan tidak boleh kosong!";
            statusMessage.style.color = '#dc3545';
            return;
        }

        const lat = marker ? marker.getLatLng().lat : null;
        const lon = marker ? marker.getLatLng().lng : null;

        const absenData = {
            name: employeeName,
            time: new Date().toISOString(),
            location: { latitude: lat, longitude: lon }
        };

        // Sesuaikan info repo dan token
        const githubUsername = 'chafiesfiss'; // Ganti sesuai username
        const repoName = 'absen-data'; // Ganti sesuai nama repo
        const githubPAT = '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'; // Ganti token

        const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/actions/workflows/save_data.yml/dispatches`;

        try {
            const response = await fetch(apiUrl, {
                method: '
