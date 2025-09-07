<?php
// Pastikan permintaan (request) adalah POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Ambil data yang dikirim dari aplikasi (misalnya nama karyawan)
    $employee_name = $_POST['employee_name'] ?? null;
    $absen_time = date('Y-m-d H:i:s'); // Waktu saat ini

    if ($employee_name) {
        $absen_data = [
            'name' => $employee_name,
            'time' => $absen_time,
            'location' => [
                'latitude' => $_POST['latitude'] ?? null,
                'longitude' => $_POST['longitude'] ?? null
            ]
        ];

        // Lokasi file JSON di dalam repositori
        $file_path = 'absen_log.json';

        // Baca file JSON yang sudah ada
        $current_data = [];
        if (file_exists($file_path)) {
            $current_data = json_decode(file_get_contents($file_path), true);
        }

        // Tambahkan data absen baru ke array
        $current_data[] = $absen_data;

        // Simpan kembali ke file JSON
        file_put_contents($file_path, json_encode($current_data, JSON_PRETTY_PRINT));
        
        // Berikan respons (response) sukses
        http_response_code(200);
        echo json_encode(['message' => 'Data absen berhasil disimpan.']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Nama karyawan tidak boleh kosong.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Metode permintaan tidak diizinkan.']);
}
?>