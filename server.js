const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // Tambahkan cors

require('dotenv').config();

const app = express();
const port = 3000;

// Middleware untuk parsing JSON dan mengizinkan CORS dari frontend Anda
app.use(express.json());
app.use(cors());

// Konfigurasi GitHub API
const githubApiUrl = 'https://api.github.com';
const repoOwner = process.env.GITHUB_REPO_OWNER;
const repoName = process.env.GITHUB_REPO_NAME;
const filePath = process.env.GITHUB_FILE_PATH;
const githubToken = process.env.GITHUB_TOKEN;

// Helper untuk membuat otentikasi
const githubAxios = axios.create({
    baseURL: githubApiUrl,
    headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
    }
});

/**
 * Endpoint untuk mengambil data absensi
 */
app.get('/absen', async (req, res) => {
    try {
        const fileContentResponse = await githubAxios.get(`/repos/${repoOwner}/${repoName}/contents/${filePath}`);
        
        // Data base64 harus di-decode
        const fileContent = Buffer.from(fileContentResponse.data.content, 'base64').toString('utf8');
        const absenData = JSON.parse(fileContent);

        res.json(absenData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Failed to fetch data from GitHub.' });
    }
});

/**
 * Endpoint untuk menambahkan data absensi baru
 */
app.post('/absen', async (req, res) => {
    try {
        const newEntry = req.body;
        
        // Ambil data absensi saat ini dan SHA
        const fileResponse = await githubAxios.get(`/repos/${repoOwner}/${repoName}/contents/${filePath}`);
        const currentContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
        const currentData = JSON.parse(currentContent);
        const currentSha = fileResponse.data.sha;

        // Tambahkan entri baru ke array
        currentData.unshift(newEntry);
        const updatedContent = JSON.stringify(currentData, null, 2);

        // Siapkan data untuk update file
        const updateData = {
            message: `Absen karyawan: ${newEntry.name}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: currentSha
        };

        // Kirim permintaan PUT untuk memperbarui file
        await githubAxios.put(`/repos/${repoOwner}/${repoName}/contents/${filePath}`, updateData);

        res.status(200).json({ message: 'Absensi berhasil disimpan!' });
    } catch (error) {
        console.error('Error saving data:', error);
        if (error.response && error.response.status === 409) {
            // Konflik (file di-update oleh orang lain), coba lagi.
            res.status(409).json({ message: 'Data conflict, please try again.' });
        } else {
            res.status(500).json({ message: 'Failed to save data to GitHub.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
