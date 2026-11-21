# Discover Nice 🇫🇷

> A modern travel guide and interactive itinerary planner for Nice, French Riviera.

Proyek Akhir **Study Club Front End Basic — KSM Veterantech UPNVJ**  
Dibuat oleh: **Naura Belva Qonita** (S1 Sistem Informasi 2024)

---

## 📖 Ringkasan Halaman & Fitur

| Halaman | File | Fitur Utama |
| :--- | :--- | :--- |
| 🏠 **Home** | `index.html` | Hero sinematik dengan Call-to-Action, ringkasan fakta kota Nice, galeri *photo-tiles* tempat populer, dan rekomendasi itinerary terpopuler dari komunitas. |
| 🧭 **Explore** | `explore.html` | Galeri foto dinamis (*Pinterest masonry*), filter pencarian teks & kategori, peta interaktif **Leaflet.js** dengan pin custom, modal detail tempat (jam buka real-time Nice, tiket masuk, tips), dan tautan langsung ke Google Maps. |
| 🗓️ **Itinerary** | `itinerary.html` | Tab **Browse** (eksplorasi, likes, komentar), Tab **Create** (builder fleksibel *Day-by-Day* atau *Curated List* dengan auto-kalkulasi biaya tiket), fitur **Copy & Edit**, dan Tab **Saved** (penyimpanan favorit lokal). |
| ✉️ **Contact** | `contact.html` | Form kirim pesan pengunjung dengan *live character counter* (1000 karakter), validasi interaktif Bootstrap 5, dan feedback notifikasi toast. |

### 🌟 Fitur Global
- 🌓 **Dark / Light Mode**: Tema gelap dan terang yang tersimpan persisten di `localStorage`.
- 📱 **Fully Responsive**: Tampilan adaptif untuk smartphone, tablet, maupun desktop.
- 🛡️ **Anti-XSS Security**: Seluruh input teks pengguna dirender secara aman menggunakan `textContent`.
- ♿ **Aksesibilitas (A11y)**: Struktur semantic HTML5, atribut ARIA, dan tautan *Skip to content*.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Markup & Styling** | HTML5, CSS3, Bootstrap 5.3 | Semantic tags, responsive grid system, styling kustom bernuansa *French Riviera*. |
| **Scripting** | Vanilla JavaScript (ES6+) | Pure JavaScript tanpa framework/bundler, DOM manipulation, dan modular state. |
| **Peta Interaktif** | Leaflet.js & OpenStreetMap | Peta interaktif dengan custom pin per kategori dan fallback Esri tiles. |
| **Penyimpanan Data** | Web Storage API (`localStorage`) | Penyimpanan lokal untuk mode malam, draft, likes, komentar, dan saved itineraries. |
| **Ikonografi** | Bootstrap Icons | Ikon visual konsisten di seluruh halaman aplikasi. |

---

## 🚀 Cara Menjalankan

Tidak memerlukan `npm install` atau proses build.

1. Buka folder proyek di **VS Code**.
2. Jalankan menggunakan ekstensi **Live Server**:
   - Klik kanan pada `index.html` → pilih **Open with Live Server**.
3. Atau jalankan via terminal:
   ```bash
   npx serve -l 5500
   ```
4. Buka browser pada alamat `http://localhost:5500`.
