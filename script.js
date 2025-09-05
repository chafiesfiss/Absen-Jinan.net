document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const absenButton = document.getElementById('absen-button');
    const statusMessage = document.getElementById('status-message');
    const employeeNameInput = document.getElementById('employee-name');
    const absenList = document.getElementById('absen-list');
    
    let map;
    let marker;
    let employeeLocation = null;
    const absenData = [];

    // Fungsi untuk memperbarui waktu dan tanggal
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('id-ID', options);
        timeElement.textContent = now.toLocaleTimeString('id-ID');
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Inisialisasi peta
    function initMap(lat, lon) {
        if (map) {
            map.remove();
        }
        map = L.map('map').setView([lat, lon], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup('Lokasi Anda')
            .openPopup();
        
        employeeLocation = { lat, lon };
    }

    // Mendapatkan lokasi pengguna
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            statusMessage.textContent = "Geolocation tidak didukung oleh browser ini.";
            statusMessage.style.color = 'red';
            absenButton.disabled = true;
        }
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        statusMessage.textContent = "Lokasi berhasil didapatkan. Anda siap absen.";
        statusMessage.style.color = 'green';
        initMap(lat, lon);
        absenButton.disabled = false;
    }

    function showError(error) {
        let message = "Terjadi kesalahan saat mendapatkan lokasi.";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = "Anda menolak permintaan Geolocation. Silakan izinkan lokasi.";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Informasi lokasi tidak tersedia.";
                break;
            case error.TIMEOUT:
                message = "Permintaan Geolocation habis waktu.";
                break;
            case error.UNKNOWN_ERROR:
                message = "Terjadi kesalahan yang tidak diketahui.";
                break;
        }
        statusMessage.textContent = message;
        statusMessage.style.color = 'red';
        absenButton.disabled = true;
    }

    // Fungsi untuk menampilkan data absensi di daftar
    function displayAbsen(name, time, date, location) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${name}</strong>
                <br>
                <span>${time}, ${date}</span>
                <span class="location">Lat: ${location.lat.toFixed(4)}, Lon: ${location.lon.toFixed(4)}</span>
            </div>
        `;
        absenList.prepend(li); // Tambahkan di bagian atas
    }

    // Fungsi untuk mengonversi data absensi ke format teks
    function generateTextData() {
        let text = "Data Absensi Karyawan\n";
        text += "======================\n\n";
        absenData.forEach(data => {
            text += `Nama: ${data.name}\n`;
            text += `Tanggal: ${data.date}\n`;
            text += `Waktu: ${data.time}\n`;
            text += `Lokasi: Lat: ${data.location.lat}, Lon: ${data.location.lon}\n`;
            text += `----------------------\n`;
        });
        return text;
    }

    // Menangani klik tombol absen
    absenButton.addEventListener('click', () => {
        const employeeName = employeeNameInput.value.trim();
        if (!employeeName) {
            statusMessage.textContent = "Silakan masukkan nama Anda.";
            statusMessage.style.color = 'red';
            return;
        }

        if (employeeLocation) {
            const now = new Date();
            const absenEntry = {
                name: employeeName,
                time: now.toLocaleTimeString('id-ID'),
                date: now.toLocaleDateString('id-ID'),
                location: employeeLocation
            };

            absenData.push(absenEntry);
            displayAbsen(absenEntry.name, absenEntry.time, absenEntry.date, absenEntry.location);

            statusMessage.textContent = `Absensi atas nama ${employeeName} berhasil!`;
            statusMessage.style.color = 'blue';

            // Bersihkan input nama setelah absen
            employeeNameInput.value = '';
            
            // Simpan data ke dalam file teks (menggunakan Blob)
            const textToSave = generateTextData();
            const blob = new Blob([textToSave], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'data_absensi.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } else {
            statusMessage.textContent = "Silakan tunggu hingga lokasi Anda ditemukan.";
            statusMessage.style.color = 'red';
        }
    });

    getLocation();
});
