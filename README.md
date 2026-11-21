# Discover Nice

Web wisata **Nice, C&ocirc;te d'Azur, Prancis**: jelajahi tempat, lihat jam bukanya, lalu susun dan bagikan rencana perjalananmu.

Final Project Study Club Front End Basic, KSM Veterantech UPNVJ.
Dibuat oleh **Naura Belva Qonita**.

## Halaman

| Halaman | File | Isi |
|---|---|---|
| Home | `index.html` | Hero, fakta singkat, tentang Nice, tempat populer, itinerary terpopuler |
| Explore | `explore.html` | Galeri foto bergaya masonry, pencarian, filter kategori, tampilan peta (Leaflet) dengan pin per kategori, detail tempat (jam buka, status buka/tutup sekarang, harga, tips), tombol tambah ke draft itinerary |
| Itinerary | `itinerary.html` | Jelajahi itinerary pengunjung, buat dan bagikan, suka, komentar, simpan, salin dan ubah |
| Contact | `contact.html` | Form kontak dengan validasi Bootstrap |

Fitur di semua halaman: navbar responsif (hamburger di HP), mode malam yang tersimpan, semantic HTML (`header`, `nav`, `main`, `footer`), dan tautan lewati ke konten.

## Teknologi

- HTML5 semantik, CSS3 (kustom + Bootstrap 5.3), JavaScript vanilla (tanpa build)
- **Bootstrap 5** (CDN): grid, navbar, modal, tab, validasi form, toast
- **Bootstrap Icons** dan **Leaflet + OpenStreetMap** untuk peta
- **DOM scripting**: render galeri dan kartu, filter dan pencarian, modal detail, builder itinerary, daftar komentar
- **localStorage**: menyimpan mode malam, draft itinerary, itinerary dan komentar buatan pengunjung, serta pesan kontak. Data tersimpan di browser masing-masing pengunjung.

## Struktur

```
index.html  explore.html  itinerary.html  contact.html
css/style.css
js/
  config.js      <- konfigurasi opsional
  data.js        <- data tempat + fungsi jam buka (satu sumber untuk semua halaman)
  store.js       <- penyimpanan data di browser (localStorage)
  main.js        <- mode malam, toast, komponen kartu bersama
  home.js  explore.js  itinerary.js  contact.js
images/
```

## Menjalankan

Tidak perlu `npm install`. Cukup jalankan lewat server lokal supaya peta bisa tampil (server peta menolak halaman yang dibuka langsung dari folder lewat `file://`).

**Dengan VS Code:** pasang ekstensi **Live Server**, klik kanan `index.html`, pilih **Open with Live Server**.

**Dengan terminal** (dari folder proyek):

```bash
npx serve -l 5500
```

lalu buka `http://localhost:5500`.

Versi online (GitHub Pages): tulis tautannya di sini setelah diaktifkan.

## Cara kerja data

- Daftar tempat, kategori, jam buka, dan harga ada di `js/data.js`. Menambah tempat cukup menambah satu objek di sana, dan semua halaman ikut memakainya.
- Status buka/tutup dihitung dari jam di Nice (zona waktu Europe/Paris), termasuk jam musiman untuk beberapa tempat. Tempat yang jam bukanya belum terverifikasi ditandai **Cek jam**.
- Itinerary dan komentar yang dibuat pengunjung tersimpan di browser masing-masing, dan ada tiga itinerary contoh supaya halaman tidak kosong.
- Teks dari pengguna selalu ditampilkan dengan `textContent`, bukan `innerHTML`, supaya aman dari XSS.

## Sumber informasi

Jam buka dan harga dikumpulkan dari situs pariwisata resmi Nice C&ocirc;te d'Azur dan beberapa panduan perjalanan pada Oktober-November 2026, dan **bisa berubah**; cek lagi sebelum berkunjung. Posisi pin di peta berupa perkiraan. Peta menggunakan data &copy; kontributor OpenStreetMap, dengan Esri sebagai cadangan.

Daftar tempat wisata mengacu pada daftar destinasi Nice di Wanderlog, dipilih yang terkenal dan banyak fotonya.

## Sumber foto

Semua foto disimpan di folder `images/`. Tempat yang fotonya belum ada akan menampilkan foto cadangan (foto hero). Disarankan lebar foto maksimal sekitar 1400 px agar halaman cepat dimuat.

## Pembuat

Naura Belva Qonita, S1 Sistem Informasi 2024.