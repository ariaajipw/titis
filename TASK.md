# TASK.md — Roadmap & Status Pengerjaan
# TITIS · Inbox Stream

> File ini adalah **satu-satunya task tracker**.  
> Update ini setiap selesai satu task. Jangan catat progress di tempat lain.

---

## ⚡ Versi Aktif: V1

**Aturan Tidak Boleh Dilanggar:**
```
Versi N+1 TIDAK BOLEH dimulai sebelum versi N live di domain publik.
Bukan "hampir jalan lokal." Bukan "tinggal satu bug lagi." Harus live.
```

---

## Roadmap Singkat

| Versi | Fitur | Status |
|---|---|---|
| **V1** | Text input + Auth + Deploy | 🔄 Sedang dikerjakan |
| V2 | Voice Note + Gemini STT | ⏳ Menunggu V1 live |
| V3 | OCR Image | ⏳ Menunggu V2 live |
| V4 | YouTube URL (async) | ⏳ Menunggu V3 live |
| V5 | PWA + Offline (Dexie.js) | ⏳ Menunggu V4 live |
| V6 | Wallet Connect + Enkripsi | ⏳ Menunggu V5 live |
| V7 | IPFS Backup (Pinata) | ⏳ Menunggu V6 live |

---

## V1 — Text Input + Auth + Deploy

**Tujuan belajar:** React dasar, TypeScript dasar, FastAPI dasar, Supabase Auth, deploy pertama  
**Definisi done:** Bisa register, login, simpan teks, hapus item — di domain publik live

### Setup Awal (Sekali)

- [ ] `mkdir -p ~/Projects/titis && cd ~/Projects/titis && git init`
- [ ] Buat `.gitignore` (node_modules, dist, .env, .venv, __pycache__)
- [ ] `mkdir -p docs .ecc`
- [ ] `touch TASK.md PRD.md ARCHITECTURE.md AGENTS.md .env.example`
- [ ] `touch docs/decisions.md docs/mistakes.md`
- [ ] Push ke GitHub (repo baru, public atau private)

### Backend V1

- [ ] `mkdir -p api/app/{routes,services,models,core} api/tests`
- [ ] Setup Python venv: `cd api && python -m venv .venv && source .venv/bin/activate`
- [ ] `pip install fastapi uvicorn[standard] supabase pydantic-settings python-dotenv python-multipart`
- [ ] `pip freeze > requirements.txt`
- [ ] Buat `api/.env` (dari `.env.example`)
- [ ] Tulis `api/app/core/config.py` — Settings via pydantic-settings
- [ ] Tulis `api/app/core/errors.py` — TitisError, UnauthorizedError, NotFoundError
- [ ] Tulis `api/app/models/schemas.py` — CreateItemRequest, InboxItem, HealthResponse
- [ ] Tulis `api/app/services/supabase.py` — get_supabase() singleton
- [ ] Tulis `api/app/routes/health.py` — GET /health
- [ ] Tulis `api/app/routes/items.py` — GET + POST + DELETE /items dengan auth
- [ ] Tulis `api/app/main.py` — FastAPI app + CORS + mount routers
- [ ] Buat tabel `inbox_items` di Supabase SQL Editor
- [ ] Enable RLS + buat policy `user_owns_items`
- [ ] Buat index `idx_inbox_items_user_created`
- [ ] Test: `uvicorn app.main:app --reload` → buka `localhost:8000/docs`
- [ ] Test: GET /health → `{"status": "ok"}`
- [ ] Test: POST /items lewat Swagger UI → item tersimpan di Supabase
- [ ] Test: GET /items → list muncul
- [ ] Test: DELETE /items/{id} → item terhapus
- [ ] Tulis `api/tests/test_health.py` dan `api/tests/test_items.py`
- [ ] `pytest tests/ -v` → 0 fail

### Frontend V1

- [ ] `npm create vite@latest web -- --template react-ts && cd web && npm install`
- [ ] `npm install zustand @supabase/supabase-js`
- [ ] `npm install -D tailwindcss @tailwindcss/vite`
- [ ] Setup `web/vite.config.ts` — plugin react + tailwind + proxy `/api`
- [ ] Setup `web/src/index.css` — `@import tailwindcss` + `@theme` design tokens
- [ ] Update `web/index.html` — Google Fonts (DM Sans + DM Mono)
- [ ] Buat `web/.env.local` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
- [ ] Tulis `web/src/types/index.ts` — ItemType, ItemStatus, InboxItem, CreateItemPayload
- [ ] Tulis `web/src/services/supabaseClient.ts` — singleton createClient
- [ ] Tulis `web/src/services/api.ts` — createItem, listItems, deleteItem + getAuthHeader
- [ ] Tulis `web/src/hooks/useAuth.ts` — user state + onAuthStateChange + signOut
- [ ] Tulis `web/src/store/useInboxStore.ts` — Zustand: items, fetchItems, addItem, removeItem
- [ ] Tulis `web/src/components/auth/AuthPage.tsx` — login + register form
- [ ] Tulis `web/src/components/inbox/CaptureBar.tsx` — input teks + tombol simpan
- [ ] Tulis `web/src/components/inbox/InboxItem.tsx` — card item + tombol hapus
- [ ] Tulis `web/src/components/inbox/InboxList.tsx` — render daftar + loading state
- [ ] Tulis `web/src/App.tsx` — routing berdasarkan auth state (loading → auth → inbox)
- [ ] Test lokal: form input → kirim → muncul di list
- [ ] Test lokal: hapus item dari UI
- [ ] Test lokal: refresh halaman → tetap login
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V1

- [ ] Tulis `api/Dockerfile` — python:3.11-slim + uvicorn
- [ ] `railway login && cd api && railway init --name titis-api`
- [ ] `railway variables set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GEMINI_API_KEY="" FRONTEND_URL=https://titis.vercel.app`
- [ ] `railway up` → catat URL Railway
- [ ] Test Railway: `curl https://titis-api.up.railway.app/health` → `{"status":"ok"}`
- [ ] `vercel login && cd web && vercel`
- [ ] Set env vars di Vercel: VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- [ ] `vercel --prod` → catat URL Vercel
- [ ] Update Supabase Auth: Site URL + Redirect URLs ke domain Vercel
- [ ] Test end-to-end di domain live: register → login → simpan → hapus

**✅ V1 DONE jika:** Bisa register, login, ketik teks, muncul di inbox, hapus item — di domain publik.

### Konsep Wajib Dipahami Setelah V1 (Jawab Tanpa Buka Kode)

1. Apa itu SPA? Kenapa React tidak reload halaman saat navigasi?
2. Apa bedanya `useState` dan state di Zustand?
3. Apa itu JWT? Kenapa backend butuh token dari frontend?
4. Apa itu RLS di Supabase dan kenapa penting?
5. Apa beda `SUPABASE_SERVICE_ROLE_KEY` (di BE) dan `SUPABASE_ANON_KEY` (di FE)?
6. Kenapa Vite proxy `/api` ke `localhost:8000` tapi production pakai env var?

---

## V2 — Voice Note + Gemini STT

> **Mulai setelah V1 live di domain publik.**

**Tujuan belajar:** MediaRecorder API, FormData, Gemini API pertama kali, async request  
**Definisi done:** Rekam 30 detik → transkripsi muncul di inbox dalam < 10 detik — di domain live

### Backend V2

- [ ] Daftar Google AI Studio: `https://aistudio.google.com` → dapat API key gratis
- [ ] `pip install google-generativeai && pip freeze > requirements.txt`
- [ ] Update `api/.env`: `GEMINI_API_KEY=AIza...`
- [ ] Update Railway env vars: `GEMINI_API_KEY=...`
- [ ] Tulis `api/app/services/gemini.py`:
  - [ ] `configure genai` dari settings
  - [ ] `transcribe_audio(audio_bytes, mime_type)` → str Markdown
- [ ] Tambah endpoint `POST /items/voice` ke `api/app/routes/items.py`:
  - [ ] Validasi ukuran file (max 25MB → 413 error)
  - [ ] Panggil `transcribe_audio()`
  - [ ] Insert ke Supabase dengan type="voice"
- [ ] Test: Swagger UI → upload file audio → transkripsi muncul di response

### Frontend V2

- [ ] Tulis `web/src/components/inbox/VoiceCapture.tsx`:
  - [ ] State: idle | recording | uploading
  - [ ] `startRecording()` → `MediaRecorder.start()`
  - [ ] `stopRecording()` → kumpulkan Blob → kirim FormData ke `/items/voice`
  - [ ] Ambil token via `supabase.auth.getSession()`
  - [ ] Setelah upload berhasil → `fetchItems()`
- [ ] Tambahkan `<VoiceCapture />` ke `CaptureBar.tsx`
- [ ] Test: rekam 10 detik → stop → transkripsi muncul di inbox
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V2

- [ ] `git push` → auto-deploy Railway + Vercel
- [ ] Test end-to-end di domain live: rekam → transkripsi muncul

**✅ V2 DONE jika:** Rekam suara di domain live → transkripsi Markdown muncul di inbox.

### Konsep Wajib Dipahami Setelah V2

1. Apa itu `MediaRecorder` API? Kenapa butuh izin mic dari browser?
2. Apa beda `multipart/form-data` dengan `application/json`?
3. Kenapa Gemini Flash dipakai untuk STT, bukan Whisper?
4. Kenapa `async def` penting di FastAPI saat panggil Gemini?

---

## V3 — OCR Image

> **Mulai setelah V2 live di domain publik.**

**Tujuan belajar:** Image handling, Gemini multimodal, file type validation  
**Definisi done:** Upload foto → OCR akurat > 90% → muncul di inbox — di domain live

### Backend V3

- [ ] Tambah `ocr_image(image_bytes, mime_type)` ke `api/app/services/gemini.py`
- [ ] Tambah endpoint `POST /items/image` ke `api/app/routes/items.py`:
  - [ ] Validasi `content_type` (hanya image/jpeg, image/png, image/webp)
  - [ ] Validasi ukuran file (max 10MB)
  - [ ] Panggil `ocr_image()`
  - [ ] Insert ke Supabase dengan type="image"
- [ ] Test: Swagger UI → upload foto teks → hasil OCR muncul

### Frontend V3

- [ ] Tulis `web/src/components/inbox/ImageCapture.tsx`:
  - [ ] Input file hidden + tombol trigger
  - [ ] Preview thumbnail gambar sebelum upload
  - [ ] Kirim FormData ke `/items/image`
  - [ ] Loading state selama proses
- [ ] Tambahkan `<ImageCapture />` ke `CaptureBar.tsx`
- [ ] Test: upload foto struk/whiteboard → OCR muncul di inbox
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V3

- [ ] `git push` → auto-deploy
- [ ] Test end-to-end di domain live

**✅ V3 DONE jika:** Upload foto teks di domain live → OCR Markdown muncul di inbox.

### Konsep Wajib Dipahami Setelah V3

1. Apa itu "multimodal" dalam konteks AI?
2. Kenapa validasi `content_type` di BE, bukan hanya ekstensi nama file?

---

## V4 — YouTube URL (Async Pipeline)

> **Mulai setelah V3 live di domain publik.**

**Tujuan belajar:** Async background job, polling pattern, database status tracking  
**Definisi done:** Paste URL YouTube → transkripsi selesai dalam < 2 menit — di domain live

### Backend V4

- [ ] Migrasi Supabase: `ALTER TABLE inbox_items ADD COLUMN job_id TEXT`
- [ ] Tambah `transcribe_youtube(url)` ke `api/app/services/gemini.py`
- [ ] Tambah endpoint `POST /items/youtube` (BackgroundTasks, return 202) ke `routes/items.py`
- [ ] Tambah endpoint `GET /items/{id}` untuk polling status ke `routes/items.py`
- [ ] Background task: proses YouTube → UPDATE status + content di Supabase
- [ ] Test: POST URL → 202 response → GET polling → status "done" dalam < 2 menit

### Frontend V4

- [ ] Tulis `web/src/hooks/usePollItem.ts` — polling GET /items/{id} setiap 3 detik
- [ ] Tulis `web/src/components/inbox/YoutubeCapture.tsx` — input URL + submit
- [ ] Update `InboxItem.tsx` — tampilkan status "sedang diproses..." untuk status "processing"
- [ ] Tambahkan `<YoutubeCapture />` ke `CaptureBar.tsx`
- [ ] Test: paste URL → item muncul dengan loading → selesai
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V4

- [ ] `git push` → auto-deploy
- [ ] Test end-to-end di domain live

**✅ V4 DONE jika:** Paste URL YouTube di domain live → transkripsi muncul setelah proses.

### Konsep Wajib Dipahami Setelah V4

1. Apa itu background task? Kenapa tidak bisa return response langsung?
2. Apa itu polling? Kapan lebih baik pakai WebSocket?
3. Kenapa FastAPI `BackgroundTasks` lebih aman dari `asyncio.create_task`?

---

## V5 — PWA + Offline

> **Mulai setelah V4 live di domain publik.**

**Tujuan belajar:** Service Worker, IndexedDB via Dexie.js, offline-first pattern  
**Definisi done:** Inbox terbuka saat airplane mode → item offline tersync saat online — di domain live

### Setup

- [ ] `npm install vite-plugin-pwa dexie uuid @types/uuid`
- [ ] Update `vite.config.ts` — tambah VitePWA plugin + manifest
- [ ] Buat `web/public/manifest.json` — name, icons, theme_color
- [ ] Tulis `web/src/services/db.ts` — Dexie schema dengan kolom `sync_status`
- [ ] Update `useInboxStore.ts` — simpan ke Dexie + sync ke BE saat online
- [ ] Tambah event listener `online/offline` untuk trigger sync
- [ ] Test: matikan internet → inbox masih terbuka dan terbaca
- [ ] Test: buat item offline → nyalakan internet → item tersync ke Supabase
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V5

- [ ] `git push` → auto-deploy
- [ ] Test: install PWA ke homescreen → test offline

**✅ V5 DONE jika:** TITIS bisa diinstall dan dibuka saat offline.

---

## V6 — Wallet Connect + Enkripsi

> **Mulai setelah V5 live di domain publik.**

**Tujuan belajar:** ethers.js, MetaMask, Web Crypto API, konsep kepemilikan kriptografis  
**Definisi done:** Connect MetaMask → sign message → address tersimpan — di domain live

### Setup

- [ ] `npm install ethers`
- [ ] Tulis `web/src/services/wallet.ts`:
  - [ ] `connectWallet()` → return address
  - [ ] `signMessage(message)` → return signature
- [ ] Tulis `web/src/services/crypto.ts`:
  - [ ] `encryptContent(text, key)` → encrypted string
  - [ ] `decryptContent(encrypted, key)` → plain text
  - [ ] Gunakan Web Crypto API native browser
- [ ] Tulis `web/src/components/auth/WalletConnect.tsx` — tombol connect + display address
- [ ] Integrasi ke `AuthPage.tsx` — tambah opsi "Login dengan Wallet"
- [ ] Tambah toggle "Vault Mode" di InboxItem — enkripsi sebelum simpan
- [ ] Test: connect MetaMask → dapat address 0x...
- [ ] Test: sign message → dapat signature
- [ ] Test: enkripsi item → tersimpan sebagai ciphertext di Supabase
- [ ] `npx tsc --noEmit` → 0 error

**✅ V6 DONE jika:** Bisa connect MetaMask, sign message, dan simpan item terenkripsi.

### Konsep Wajib Dipahami Setelah V6

1. Apa beda `hash`, `encrypt`, dan `sign`?
2. Kenapa wallet address bisa dijadikan identity tanpa server?
3. Apa itu private key dan kenapa TIDAK BOLEH dikirim ke mana pun?

---

## V7 — IPFS Backup (Pinata)

> **Mulai setelah V6 live di domain publik.**

**Tujuan belajar:** IPFS, Pinata API, content addressing, decentralized storage  
**Definisi done:** Satu item berhasil di-backup ke IPFS dan bisa di-retrieve via CID — di domain live

### Backend V7

- [ ] Daftar Pinata: `https://app.pinata.cloud` → dapat JWT (1GB free)
- [ ] Migrasi Supabase: `ALTER TABLE inbox_items ADD COLUMN ipfs_cid TEXT, ADD COLUMN wallet_address TEXT, ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE`
- [ ] `pip install eth-account && pip freeze > requirements.txt`
- [ ] Tulis `api/app/services/ipfs.py` — `upload_to_pinata(content)` → return CID
- [ ] Tulis `api/app/services/wallet_auth.py` — `verify_signature(message, signature, address)` → bool
- [ ] Tambah endpoint `POST /items/{id}/backup`:
  - [ ] Verifikasi wallet signature
  - [ ] Upload encrypted content ke Pinata
  - [ ] UPDATE Supabase: `ipfs_cid`, `wallet_address`, `is_encrypted=true`
- [ ] Update Railway env vars: `PINATA_JWT=...`
- [ ] Test: call endpoint → CID tersimpan di Supabase

### Frontend V7

- [ ] Tambah tombol "Simpan ke IPFS" di `InboxItem.tsx`
- [ ] Alur: enkripsi → sign → POST /items/{id}/backup
- [ ] Tampilkan CID + link ke `https://gateway.pinata.cloud/ipfs/{CID}`
- [ ] Test: enkripsi item → upload IPFS → CID muncul di UI → link bisa dibuka
- [ ] `npx tsc --noEmit` → 0 error

### Deploy V7

- [ ] `git push` → auto-deploy
- [ ] Test end-to-end di domain live

**✅ V7 DONE jika:** Item terenkripsi berhasil disimpan ke IPFS dan diakses via CID.

### Konsep Wajib Dipahami Setelah V7

1. Apa itu content addressing? Kenapa CID berbeda dari URL biasa?
2. Kenapa data di IPFS tidak bisa dihapus?
3. Apa beda IPFS (Pinata) dan Arweave? Kapan pakai masing-masing?
4. Jelaskan seluruh alur V7 tanpa membuka kode.

---

## Done

- [x] TITIS Master Build Guide v3 dibuat
- [x] Stack final dikunci: FastAPI + Vite/React + Supabase + Gemini
- [x] Paradigma Inbox Stream dipilih (bukan Kanban)
- [x] Roadmap V1–V7 didesain dengan jalur Web3 bertahap
- [x] PRD.md, ARCHITECTURE.md, AGENTS.md, TASK.md dibuat

---

_Update file ini setiap selesai satu task. Versi aktif selalu di bagian paling atas._  
_TITIS TASK.md v1.0 · Agustus 2026_
