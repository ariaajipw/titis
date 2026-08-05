# PRD.md — Product Requirement Document
# TITIS · Inbox Stream · v1.0

> Dokumen ini mendefinisikan APA yang dibangun dan UNTUK SIAPA.  
> Update dokumen ini setiap kali ada keputusan produk yang berubah.

---

## 1. Visi Produk

**TITIS** adalah PWA personal untuk menangkap pengetahuan mentah dari berbagai sumber
(suara, gambar, YouTube, teks) dan mengubahnya menjadi catatan Markdown terstruktur
yang tersimpan secara aman dan bisa diakses kapan saja.

**Satu kalimat:** *Rekam apa pun yang ada di kepalamu — TITIS yang mengubahnya menjadi teks.*

### Filosofi Inti

```
Capture dulu. Organisir nanti.
```

Tidak ada folder, tidak ada Kanban, tidak ada drag-and-drop.  
Semua input masuk ke satu Inbox Stream berurutan waktu.  
Pencarian dan tag AI menggantikan struktur manual.

### Target User

Saat ini: **diri sendiri** (solo developer sebagai user pertama).  
Masa depan: knowledge worker yang sadar privasi data.

---

## 2. Paradigma UI: Inbox Stream

Inbox Stream bukan task manager. Ini lebih dekat ke:

- Jurnal pribadi yang bisa diisi dengan suara
- Obsidian yang bisa menerima foto dan audio
- Transcription engine yang outputnya tersimpan otomatis

```
┌─────────────────────────────────────────────────────────┐
│  TITIS                                    [Logout]       │
├─────────────────────────────────────────────────────────┤
│  [🎙 Rekam] [📷 Gambar] [🔗 YouTube] [✏️ Teks]          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Ketik sesuatu dan tekan Enter...                 │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Suara · 14:32 · hari ini                    [hapus]     │
│  "Pembahasan budget Q3, target revenue naik 20%..."      │
│  [.md] [.txt] [.pdf]                                     │
├─────────────────────────────────────────────────────────┤
│  Gambar · 11:20 · hari ini                   [hapus]     │
│  "Arsitektur sistem baru — Node A → Node B..."           │
│  [.md] [.txt] [.pdf]                                     │
├─────────────────────────────────────────────────────────┤
│  YouTube · 09:05 · hari ini                  [hapus]     │
│  [sedang diproses...]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Fitur per Versi

### V1 — Text Input + Auth + Deploy *(Fondasi)*

**User Story:** Sebagai user, aku bisa login dan menyimpan catatan teks pendek ke inbox.

| Fitur | Detail |
|---|---|
| Auth | Register email + password via Supabase Auth |
| Auth | Login / Logout |
| Capture | Input teks → simpan ke Supabase → muncul di inbox |
| Inbox | Tampilkan daftar item berurutan waktu (terbaru di atas) |
| Delete | Hapus item dari inbox |
| Deploy | Live di Vercel + Railway |

**Bukan fitur V1:** Edit item, search, tag, export.

---

### V2 — Voice Note + Gemini STT *(Core Feature)*

**User Story:** Sebagai user, aku bisa merekam suara dari mic dan mendapatkan transkrip otomatis.

| Fitur | Detail |
|---|---|
| Rekam mic | MediaRecorder API di browser |
| Upload audio | Kirim ke FastAPI → Gemini Flash → teks Markdown |
| Format output | Teks dengan timestamp setiap 30 detik, deteksi speaker |
| Batas file | Maksimal 25MB per rekaman |

**Sumber audio V2:** Mic langsung (rekam real-time).

---

### V3 — OCR Image *(Multimodal)*

**User Story:** Sebagai user, aku bisa upload foto/screenshot dan mendapatkan teks terstruktur.

| Fitur | Detail |
|---|---|
| Upload gambar | Dari storage lokal device |
| OCR + format | Gemini Flash Vision → teks Markdown |
| Format output | Tabel dipertahankan, heading terdeteksi |
| Batas file | Maksimal 10MB, format: JPG/PNG/WEBP |

---

### V4 — YouTube URL *(Async Pipeline)*

**User Story:** Sebagai user, aku bisa paste URL YouTube dan mendapatkan transkripsi video.

| Fitur | Detail |
|---|---|
| Input URL | Field khusus YouTube di CaptureBar |
| Async job | Backend proses background, FE polling status |
| Status display | Item muncul dengan status "sedang diproses..." |
| Format output | Transkripsi Markdown dengan timestamp |

**Penting:** Gemini mendukung YouTube URL native — tidak butuh yt-dlp.

---

### V5 — PWA + Offline *(Resilience)*

**User Story:** Sebagai user, aku bisa buka dan baca inbox saat tidak ada internet.

| Fitur | Detail |
|---|---|
| Service Worker | Cache aset statik via Workbox |
| Offline read | Inbox terbaca dari Dexie.js (IndexedDB) |
| Offline write | Item tersimpan lokal, sync saat online kembali |
| PWA install | Bisa di-install ke homescreen |

---

### V6 — Wallet Connect + Enkripsi *(Web3 Entry)*

**User Story:** Sebagai user, aku bisa login pakai MetaMask sebagai identitas alternatif.

| Fitur | Detail |
|---|---|
| Connect wallet | ethers.js + MetaMask |
| Sign message | Wallet sebagai bukti kepemilikan identity |
| Enkripsi lokal | Item dienkripsi di browser sebelum dikirim |
| Vault mode | Toggle: "simpan terenkripsi" vs "simpan biasa" |

---

### V7 — IPFS Backup *(Decentralized Storage)*

**User Story:** Sebagai user, aku bisa backup catatan terenkripsi ke IPFS untuk kepemilikan permanen.

| Fitur | Detail |
|---|---|
| Upload IPFS | Via Pinata API (1GB free) |
| Simpan CID | Hash IPFS tersimpan di Supabase sebagai pointer |
| Verify ownership | Backend verify wallet signature sebelum upload |
| Retrieve | Bisa ambil catatan dari IPFS dengan CID |

---

## 4. Fitur Export (Semua Versi Mulai V1)

Setiap item di inbox bisa di-export ke format berikut.  
Export dikerjakan **di frontend** — tidak butuh backend.

| Format | Library | Tingkat Kesulitan |
|---|---|---|
| `.md` | Native (string) | Mudah |
| `.txt` | Native (string) | Mudah |
| `.json` | `JSON.stringify` | Mudah |
| `.pdf` | `jsPDF` | Sedang |
| `.docx` | `docx.js` | Sedang |
| `.srt` | Custom (jika ada timestamp) | Sedang |
| `.csv` | Native (jika ada tabel) | Mudah |

**Default yang wajib ada mulai V1:** `.md` dan `.txt`.

---

## 5. Non-Fitur (Sengaja Tidak Dibuat)

Ini keputusan produk, bukan keterbatasan teknis:

- ❌ Kanban / task board — paradigma berbeda, bukan target TITIS
- ❌ Kolaborasi real-time — overkill untuk personal tool
- ❌ Folder / hierarki manual — bertentangan dengan filosofi Inbox Stream
- ❌ Rich text editor (WYSIWYG) — Markdown cukup
- ❌ Push notification — tunda sampai ada kebutuhan nyata
- ❌ Social sharing — bukan jejaring sosial

---

## 6. Metrik Sukses per Versi

| Versi | Definisi "Done" |
|---|---|
| V1 | Bisa register, login, simpan teks, hapus — di domain publik |
| V2 | Rekam 30 detik → transkripsi muncul di inbox dalam < 10 detik |
| V3 | Upload foto teks → OCR hasil akurat > 90% karakter |
| V4 | Paste URL YouTube → transkripsi selesai dalam < 2 menit |
| V5 | Buka inbox saat airplane mode — data tetap terbaca |
| V6 | Connect MetaMask → sign message → address tersimpan |
| V7 | Satu item berhasil di-backup ke IPFS dan bisa di-retrieve via CID |

---

## 7. Keputusan Produk yang Sudah Final

> Catat di sini setiap keputusan besar agar tidak perlu didebat ulang.

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-08 | Tidak pakai Kanban | Inbox Stream lebih cocok untuk capture-first + Web3 |
| 2026-08 | Gemini Flash untuk STT & OCR | Satu API untuk audio + image + YouTube URL |
| 2026-08 | FastAPI bukan Hono | Python untuk jalur belajar AI/ML + Web3.py |
| 2026-08 | Vite + React bukan Next.js | React murni untuk belajar fondasi tanpa "magic" |
| 2026-08 | Supabase bukan Firebase | PostgreSQL + RLS + migrasi ke offchain di V7 |

---

_TITIS PRD v1.0 · Terakhir diupdate: Agustus 2026_
