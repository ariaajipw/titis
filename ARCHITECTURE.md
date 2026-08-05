# ARCHITECTURE.md — Arsitektur Teknis
# TITIS · Inbox Stream · v1.0

> Dokumen ini mendefinisikan BAGAIMANA sistem dibangun.  
> Baca sebelum menulis kode apapun. Update setiap ada keputusan teknis baru.

---

## 1. Gambaran Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│  USER                                                           │
│  Browser / PWA                                                  │
│                                                                 │
│  Vite + React 18 + TypeScript + Tailwind v4 + Zustand          │
│  @supabase/supabase-js (auth only di FE)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (REST API)
                            │ Authorization: Bearer <supabase_jwt>
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND                                                        │
│  FastAPI (Python 3.11) · Railway                               │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ routes/     │  │ services/    │  │ services/          │    │
│  │ items.py    │  │ gemini.py    │  │ supabase.py        │    │
│  │ health.py   │  │ (STT + OCR)  │  │ (DB operations)    │    │
│  └─────────────┘  └──────┬───────┘  └────────┬───────────┘    │
└──────────────────────────┼───────────────────┼─────────────────┘
                           │                   │
                           ▼                   ▼
              ┌────────────────────┐  ┌────────────────────┐
              │  Gemini Flash API  │  │  Supabase          │
              │  (Google AI)       │  │  PostgreSQL + Auth  │
              │  STT + OCR + YT    │  │  + Storage         │
              └────────────────────┘  └────────────────────┘
```

### Prinsip Arsitektur

1. **API key di BE, bukan FE** — Gemini key tidak pernah menyentuh browser
2. **Auth via Supabase JWT** — BE memverifikasi token setiap request
3. **Supabase RLS aktif** — database-level protection, bukan hanya aplikasi
4. **Local-first progressif** — mulai Supabase, Dexie.js di V5, IPFS di V7
5. **Satu sumber kebenaran per layer** — tidak ada state duplikat

---

## 2. Stack Lengkap

| Layer | Teknologi | Versi | Catatan |
|---|---|---|---|
| Frontend | Vite + React + TypeScript | React 18, TS strict | CSS-first, bukan framework-heavy |
| Styling | Tailwind CSS v4 | v4 (CSS-first config) | `@theme` di CSS, bukan `tailwind.config.js` |
| State | Zustand | latest | Cukup untuk solo dev |
| Auth Client | @supabase/supabase-js | v2 | Hanya auth + session di FE |
| Backend | FastAPI (Python) | Python 3.11+ | Async, type-safe, Pydantic |
| AI | Gemini Flash | gemini-2.5-flash | STT + OCR + YouTube |
| Database | Supabase (PostgreSQL) | - | RLS wajib aktif |
| Offline (V5) | Dexie.js + Workbox | - | IndexedDB wrapper |
| Web3 (V6) | ethers.js | v6 | Wallet connect + sign |
| Storage (V7) | Pinata (IPFS) | - | Via API, bukan SDK berat |
| Deploy FE | Vercel | - | Auto-deploy dari GitHub |
| Deploy BE | Railway | - | Docker container |
| Repo | GitHub | - | Monorepo satu folder |

---

## 3. Struktur Folder

```
titis/                              ← root monorepo
│
├── .ecc/
│   └── context.md                  ← selalu buka di setiap sesi AI
│
├── docs/
│   ├── decisions.md                ← keputusan teknis + alasan
│   └── mistakes.md                 ← bug yang pernah terjadi + solusi
│
├── PRD.md                          ← apa yang dibangun
├── ARCHITECTURE.md                 ← ini file ini
├── AGENTS.md                       ← aturan AI agent
├── TASK.md                         ← checklist sprint aktif
├── .env.example                    ← template env vars (di-commit)
├── .gitignore
│
├── web/                            ← Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 ← Button, Input, Badge, Spinner
│   │   │   ├── auth/               ← AuthPage, WalletConnect (V6)
│   │   │   └── inbox/             ← InboxList, InboxItem, CaptureBar,
│   │   │                          │  VoiceCapture, ImageCapture, YoutubeCapture
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          ← user session state
│   │   │   └── usePollItem.ts      ← polling status (V4)
│   │   ├── services/
│   │   │   ├── api.ts              ← semua fetch ke BE — satu file
│   │   │   ├── supabaseClient.ts   ← singleton Supabase
│   │   │   ├── db.ts               ← Dexie.js IndexedDB (V5)
│   │   │   ├── wallet.ts           ← ethers.js (V6)
│   │   │   └── crypto.ts           ← Web Crypto API (V6)
│   │   ├── store/
│   │   │   └── useInboxStore.ts    ← Zustand store
│   │   ├── types/
│   │   │   └── index.ts            ← semua TypeScript types
│   │   ├── utils/
│   │   │   └── export.ts           ← export ke .md/.txt/.pdf/.docx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── api/                            ← Backend
    ├── app/
    │   ├── routes/
    │   │   ├── health.py           ← GET /health
    │   │   └── items.py            ← semua /items endpoints
    │   ├── services/
    │   │   ├── gemini.py           ← transcribe_audio, ocr_image, transcribe_youtube
    │   │   ├── supabase.py         ← get_supabase() singleton
    │   │   ├── ipfs.py             ← upload ke Pinata (V7)
    │   │   └── wallet_auth.py      ← verify wallet signature (V7)
    │   ├── models/
    │   │   └── schemas.py          ← Pydantic request/response models
    │   ├── core/
    │   │   ├── config.py           ← Settings via pydantic-settings
    │   │   └── errors.py           ← custom HTTPException classes
    │   └── main.py                 ← FastAPI app + CORS + router mount
    ├── tests/
    │   ├── test_health.py
    │   └── test_items.py
    ├── requirements.txt
    ├── Dockerfile
    └── .env                        ← JANGAN di-commit
```

---

## 4. Database Schema (Supabase)

### Tabel `inbox_items` — V1

```sql
CREATE TABLE inbox_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('text', 'voice', 'image', 'youtube')),
  content     TEXT NOT NULL,
  source_url  TEXT,
  status      TEXT NOT NULL DEFAULT 'done'
              CHECK (status IN ('pending', 'processing', 'done', 'error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_items"
  ON inbox_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_inbox_items_user_created
  ON inbox_items (user_id, created_at DESC);
```

### Migrasi V4 (YouTube async)

```sql
ALTER TABLE inbox_items ADD COLUMN job_id TEXT;
```

### Migrasi V7 (IPFS + Web3)

```sql
ALTER TABLE inbox_items
  ADD COLUMN ipfs_cid TEXT,
  ADD COLUMN wallet_address TEXT,
  ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE;
```

### Evolusi Menuju Web3 (Peta Migrasi)

```
V1-V4: Supabase PostgreSQL — sumber kebenaran tunggal
         │
         ▼
V5:    Supabase + Dexie.js (lokal) — data ada di dua tempat, sync saat online
         │
         ▼
V7:    Supabase (metadata + pointer)
       + IPFS via Pinata (data terenkripsi)
       
       Supabase row: { id, user_id, ipfs_cid, wallet_address, ... }
       Data asli   : terenkripsi di IPFS, hanya bisa dibuka dengan private key
```

Supabase tidak dihapus di V7 — ia menjadi **metadata layer** yang menyimpan CID IPFS.  
Ini adalah arsitektur hybrid yang realistis dan bisa dimigrasikan secara bertahap.

---

## 5. API Contract

```
Base URL lokal  : http://localhost:8000
Base URL prod   : https://titis-api.up.railway.app

Header wajib (semua endpoint kecuali /health):
  Authorization: Bearer <supabase_jwt_token>

Content-Type default: application/json
Multipart: dipakai hanya di /items/voice dan /items/image
```

### V1 Endpoints

```
GET  /health
→ 200: { "status": "ok", "version": "1.0.0" }

POST /items
← { "type": "text", "content": "isi" }
→ 201: InboxItem

GET  /items
→ 200: InboxItem[]  (urut created_at DESC)

DELETE /items/{id}
→ 204: (no body)
```

### V2 Endpoints

```
POST /items/voice
← multipart/form-data, field: "audio" (file .webm)
→ 201: InboxItem  (content = hasil transkripsi)
```

### V3 Endpoints

```
POST /items/image
← multipart/form-data, field: "image" (file jpg/png/webp)
→ 201: InboxItem  (content = hasil OCR Markdown)
```

### V4 Endpoints

```
POST /items/youtube
← { "source_url": "https://youtube.com/watch?v=..." }
→ 202: { "id": "uuid", "status": "processing" }

GET /items/{id}
→ 200: InboxItem  (polling sampai status = "done")
```

---

## 6. Alur Data per Fitur

### 6.1 Text Input (V1)

```
User ketik → CaptureBar → api.createItem() → POST /items
→ Supabase INSERT → InboxStore.addItem() → re-render InboxList
```

### 6.2 Voice Note (V2)

```
User tekan 🎙 → MediaRecorder.start()
User tekan ⏹ → Blob webm terkumpul
→ FormData → POST /items/voice (multipart)
→ FastAPI: audio_bytes → gemini.transcribe_audio()
→ Gemini Flash: audio → teks Markdown
→ Supabase INSERT → response 201
→ InboxStore.fetchItems() → update UI
```

### 6.3 OCR Image (V3)

```
User pilih file gambar → ImageCapture → preview thumbnail
→ POST /items/image (multipart)
→ FastAPI: validate mime_type → gemini.ocr_image()
→ Gemini Flash Vision: gambar → teks + tabel Markdown
→ Supabase INSERT → response 201
→ UI update
```

### 6.4 YouTube URL (V4) — Async

```
User paste URL → YoutubeCapture → POST /items/youtube
→ FastAPI: insert item status="processing" → response 202
→ BackgroundTasks: gemini.transcribe_youtube(url)
→ Gemini: fetch + transcribe YouTube audio
→ Supabase UPDATE: content + status="done"

Frontend: polling GET /items/{id} setiap 3 detik
→ Deteksi status="done" → stop polling → refresh item
```

### 6.5 IPFS Backup (V7)

```
User klik "Simpan ke IPFS" → crypto.encrypt(content, wallet_key)
→ POST /items/{id}/backup (body: { encrypted_content, wallet_signature })
→ FastAPI: wallet_auth.verify_signature()
→ ipfs.upload_to_pinata(encrypted_content)
→ Pinata return CID
→ Supabase UPDATE: ipfs_cid, wallet_address, is_encrypted=true
→ UI tampilkan CID + link ke IPFS gateway
```

---

## 7. Environment Variables

### Frontend (`web/.env.local`) — tidak di-commit

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # anon key — aman di FE
VITE_API_URL=http://localhost:8000      # ganti ke Railway URL saat production
```

### Backend (`api/.env`) — tidak di-commit

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # service role — JANGAN di FE
GEMINI_API_KEY=AIza...
FRONTEND_URL=http://localhost:5173     # ganti ke Vercel URL saat production
PINATA_JWT=                            # kosong sampai V7
```

### `.env.example` — di-commit, tanpa nilai asli

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
FRONTEND_URL=
PINATA_JWT=
```

---

## 8. Security Model

| Ancaman | Mitigasi |
|---|---|
| API key Gemini bocor ke publik | Key hanya ada di `api/.env` dan Railway env vars |
| User akses data orang lain | Supabase RLS: `auth.uid() = user_id` di semua query |
| Token JWT expired tidak ditangani | `supabase.auth.getSession()` auto-refresh token |
| File upload berbahaya | Validasi `content_type` di BE, bukan hanya ekstensi |
| CORS terbuka | `allow_origins` hanya berisi URL Vercel + localhost |
| Secret hardcoded | `pydantic-settings` + `.env` — wajib, tidak ada pengecualian |

---

## 9. Deployment Architecture

```
GitHub (main branch)
    │
    ├── Push ke main
    │       │
    │       ├──► Vercel deteksi → build web/ → deploy CDN global
    │       │    (auto, tidak perlu config manual setelah setup pertama)
    │       │
    │       └──► Railway deteksi → build Docker image → deploy container
    │            (menggunakan api/Dockerfile)
    │
    └── Preview branch
            └──► Vercel preview URL per PR (gratis)
```

### CORS: Lokal vs Production

| | Lokal | Production |
|---|---|---|
| FE → BE | Vite proxy `/api` → `localhost:8000` | `VITE_API_URL` = URL Railway |
| CORS di FastAPI | Tidak perlu (proxy handle) | `allow_origins` berisi URL Vercel |
| Env var | `.env.local` tidak di-commit | Set di Vercel + Railway dashboard |

---

## 10. Keputusan Teknis yang Sudah Final

Catat di sini agar tidak didebat ulang di tengah sprint.

| Keputusan | Alasan |
|---|---|
| FastAPI bukan Hono | Python untuk ekosistem AI/ML yang lebih kaya |
| Vite bukan Next.js | React murni tanpa "magic" SSR — lebih baik untuk belajar |
| Supabase bukan Firebase | PostgreSQL + RLS + migrasi mudah ke offchain |
| Gemini Flash untuk semua AI | Satu API untuk audio + vision + YouTube URL native |
| BackgroundTasks bukan asyncio.create_task | Lebih aman di FastAPI production |
| getSession() bukan localStorage langsung | Token refresh otomatis oleh Supabase SDK |
| Monorepo satu GitHub repo | Lebih simpel untuk solo dev |
| Pinata bukan Arweave (V7) | Lebih mudah untuk pemula, ekosistem besar |

---

_TITIS ARCHITECTURE.md v1.0 · Agustus 2026_
