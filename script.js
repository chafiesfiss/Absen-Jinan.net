// ... kode JavaScript sebelumnya

absenButton.addEventListener('click', async () => {
    const employeeName = employeeNameInput.value.trim();

    if (employeeName === "") {
        statusMessage.textContent = "Nama karyawan tidak boleh kosong!";
        statusMessage.style.color = '#dc3545';
        return;
    }

    // Dapatkan data waktu dan lokasi
    const absenData = {
        employee_name: employeeName,
        // Anda juga bisa menambahkan data lokasi
        // latitude: ...
        // longitude: ...
    };

    try {
        // Kirim data ke GitHub Actions melalui API
        const response = await fetch('https://api.github.com/repos/NAMA_USER/NAMA_REPO/actions/workflows/save_data.yml/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token YOUR_GITHUB_PAT`, // Ganti dengan Personal Access Token Anda
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    data: JSON.stringify(absenData)
                }
            })
        });

        if (response.ok) {
            statusMessage.textContent = `Absen berhasil, ${employeeName}! Data dikirim ke GitHub.`;
            statusMessage.style.color = '#28a745';
        } else {
            const error = await response.json();
            statusMessage.textContent = `Gagal mengirim data. Error: ${error.message}`;
            statusMessage.style.color = '#dc3545';
        }
    } catch (error) {
        statusMessage.textContent = 'Terjadi kesalahan jaringan saat mengirim data.';
        statusMessage.style.color = '#dc3545';
        console.error('Error:', error);
    }
});
