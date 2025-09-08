// Contoh menggunakan fetch API
// Kode ini SANGAT SENSITIF karena mengandung token pribadi Anda
const GITHUB_TOKEN = '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'; // Ganti dengan token pribadi Anda
const REPO_OWNER = 'chafiesfiss';
const REPO_NAME = 'absen-data';
const endpoint = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;

async function kirimDataAbsen(dataAbsen) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                event_type: 'absen_request',
                client_payload: {
                    data: dataAbsen,
                    name: dataAbsen.nama // Untuk pesan commit
                }
            })
        });

        if (response.ok) {
            console.log('Absen berhasil dikirim ke GitHub Actions.');
        } else {
            const error = await response.json();
            console.error('Gagal mengirim absen:', error);
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

// Contoh penggunaan
const dataUntukAbsen = {
    nama: "Budi Santoso",
    status: "Hadir",
    waktu: new Date().toISOString(),
    lokasi: { latitude: -6.1754, longitude: 106.8272 }
};

kirimDataAbsen(dataUntukAbsen);
