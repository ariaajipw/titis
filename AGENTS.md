# AGENTS.md — Aturan & Panduan AI Agent
# TITIS · OpenCode + 9router

> Baca dokumen ini sebelum memulai sesi AI apapun.  
> Aturan di sini berlaku untuk OpenCode, Claude, Gemini, dan AI lain yang dipakai.

---

## 1. Filosofi Pakai AI di TITIS

```
Kamu yang memimpin. AI yang mengeksekusi.
```

AI agent bukan kontraktor yang kamu brief sekali lalu ditinggal.  
AI adalah pair programmer — kamu tetap harus mengerti setiap baris kode yang ditulis.

**Aturan mental:**
- Jika AI menulis kode yang tidak kamu mengerti → tanya AI untuk jelaskan dulu sebelum lanjut
- Jika AI menyarankan install library baru → diskusikan dulu, jangan langsung setuju
- Jika AI mengubah file di luar scope task → rollback, bukan terima

---

## 2. Setup OpenCode + 9router

### 2.1 Install OpenCode

```bash
npm install -g opencode-ai

# Verifikasi
opencode --version
```

### 2.2 Konfigurasi 9router sebagai Proxy LLM

9router adalah local proxy yang merutekan request ke berbagai provider LLM.  
Ini memungkinkan OpenCode pakai Gemini Flash (gratis) tanpa hardcode key.

```bash
# Install 9router
pip install ninerouter   # atau sesuai docs 9router terbaru

# Jalankan 9router
ninerouter start --port 4000

# Config OpenCode pakai 9router sebagai endpoint
opencode config set provider openai-compatible
opencode config set base_url http://localhost:4000/v1
opencode config set api_key dummy   # 9router handle auth ke provider asli
```

### 2.3 Config 9router (`~/.ninerouter/config.yaml`)

```yaml
routes:
  - name: gemini-flash
    provider: google
    model: gemini-2.5-flash
    api_key: ${GEMINI_API_KEY}
    priority: 1

  - name: qwen-local
    provider: ollama
    model: qwen2.5-coder:7b
    base_url: http://localhost:11434
    priority: 2        # fallback jika Gemini rate limit

default_route: gemini-flash
token_compression: true    # kompres context untuk hemat token
```

**Keuntungan 9router untuk solo dev:**
- Satu endpoint untuk semua model
- Auto-fallback ke model lokal jika cloud rate limit
- Token compression menghemat quota gratis

### 2.4 Cara Jalankan Sesi OpenCode

```bash
# Selalu dari root folder project
cd ~/Projects/titis

# Pastikan 9router sudah running
ninerouter status

# Masuk OpenCode interactive mode
opencode

# Atau langsung dengan task
opencode task "Buat endpoint POST /items/voice di api/app/routes/items.py"
```

---

## 3. Prompt Wajib di Awal Setiap Sesi

Copy-paste ini ke setiap sesi OpenCode baru:

```
Baca file-file ini sebelum melakukan apapun:
1. .ecc/context.md
2. TASK.md (lihat versi aktif dan task yang belum selesai)
3. ARCHITECTURE.md (khususnya bagian API Contract)

Versi yang sedang dikerjakan: [isi V1/V2/V3/dst]
Task yang akan dikerjakan: [copy dari TASK.md]

Aturan yang tidak boleh dilanggar:
- Tidak ada tipe `any` di TypeScript — pakai interface/type yang tepat
- Semua function Python wajib type hints (parameter + return type)
- Gemini API key TIDAK BOLEH ada di file apapun di web/
- Auth token hanya via supabase.auth.getSession() — tidak pernah localStorage langsung
- Jangan install dependency baru tanpa ada di requirements.txt / package.json
- Jangan ubah file di luar scope task yang disebutkan
- Setelah selesai: jalankan `npx tsc --noEmit` di web/ dan `pytest tests/` di api/
```

---

## 4. Aturan Kode — Frontend (TypeScript + React)

### 4.1 TypeScript

```typescript
// ❌ DILARANG — tipe `any`
const data: any = await fetchSomething()

// ✅ WAJIB — tipe eksplisit
const data: InboxItem = await fetchSomething()

// ❌ DILARANG — non-null assertion sembarangan
const user = session!.user

// ✅ WAJIB — guard dulu
if (!session?.user) throw new Error('No session')
const user = session.user
```

### 4.2 API Calls

```typescript
// ❌ DILARANG — fetch inline di component
const res = await fetch('/items', { headers: { Authorization: token } })

// ✅ WAJIB — semua fetch lewat web/src/services/api.ts
import { createItem } from '../services/api'
const item = await createItem({ type: 'text', content: 'isi' })
```

### 4.3 Auth Token

```typescript
// ❌ DILARANG — ambil token dari localStorage langsung
const token = localStorage.getItem('sb-access-token')

// ✅ WAJIB — selalu via Supabase SDK
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### 4.4 Environment Variables

```typescript
// ❌ DILARANG — hardcode apapun
const apiUrl = 'http://localhost:8000'

// ✅ WAJIB — pakai env var
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
```

### 4.5 State Update

```typescript
// ❌ DILARANG — mutasi state langsung
state.items.push(newItem)

// ✅ WAJIB — immutable update
set((state) => ({ items: [newItem, ...state.items] }))
```

### 4.6 Styling

```typescript
// ❌ DILARANG — inline style atau class Tailwind yang tidak konsisten
<div style={{ color: '#e8e8e8' }}>

// ✅ WAJIB — pakai CSS variable dari design tokens
<div className="text-[var(--color-text)]">

// Design tokens yang tersedia (dari web/src/index.css):
// --color-base, --color-surface, --color-elevated
// --color-border, --color-accent, --color-text, --color-muted
// --font-mono, --font-sans
```

---

## 5. Aturan Kode — Backend (Python + FastAPI)

### 5.1 Type Hints Wajib

```python
# ❌ DILARANG — tanpa type hints
def get_user_id(authorization):
    ...

# ✅ WAJIB — type hints lengkap
def get_user_id(authorization: str) -> str:
    ...
```

### 5.2 Error Handling

```python
# ❌ DILARANG — exception tidak ditangani
async def transcribe_audio(audio_bytes: bytes) -> str:
    response = await model.generate_content_async([...])
    return response.text

# ✅ WAJIB — try/except di semua async function
async def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    try:
        response = await model.generate_content_async([...])
        return response.text
    except Exception as e:
        raise TitisError(500, "AI_ERROR", f"Gagal transkripsi: {str(e)}")
```

### 5.3 Konfigurasi

```python
# ❌ DILARANG — hardcode key atau URL
genai.configure(api_key="AIza...")

# ✅ WAJIB — selalu dari settings
from app.core.config import settings
genai.configure(api_key=settings.gemini_api_key)
```

### 5.4 Background Task

```python
# ❌ DILARANG — asyncio.create_task di production FastAPI
asyncio.create_task(long_running_job())

# ✅ WAJIB — FastAPI BackgroundTasks
from fastapi import BackgroundTasks

@router.post("/items/youtube", status_code=202)
async def create_youtube_item(
    body: YoutubeRequest,
    background_tasks: BackgroundTasks,
    authorization: Annotated[str, Header()]
) -> dict:
    user_id = get_user_id(authorization)
    # Insert dulu dengan status pending
    item = insert_pending_item(user_id, body.source_url)
    # Lalu proses di background
    background_tasks.add_task(process_youtube, item["id"], body.source_url)
    return {"id": item["id"], "status": "processing"}
```

### 5.5 Validasi Input

```python
# ❌ DILARANG — akses langsung tanpa validasi
@router.post("/items")
async def create_item(body: dict):
    content = body["content"]  # bisa KeyError

# ✅ WAJIB — Pydantic model untuk semua input
class CreateItemRequest(BaseModel):
    type: Literal["text", "voice", "image", "youtube"] = "text"
    content: str
    source_url: Optional[str] = None

@router.post("/items", status_code=201)
async def create_item(body: CreateItemRequest) -> InboxItem:
    ...
```

### 5.6 Error Message untuk User

```python
# ❌ DILARANG — error message bahasa Inggris untuk user
raise TitisError(401, "UNAUTHORIZED", "Token is invalid or expired")

# ✅ WAJIB — Bahasa Indonesia
raise TitisError(401, "UNAUTHORIZED", "Token tidak valid atau sudah expired")
```

---

## 6. Aturan Git

```bash
# Format commit message
feat: [deskripsi singkat]    # fitur baru
fix: [deskripsi singkat]     # perbaikan bug
chore: [deskripsi singkat]   # perubahan non-kode (config, docs)
refactor: [deskripsi singkat] # refactor tanpa fitur baru

# Contoh:
git commit -m "feat: tambah endpoint POST /items/voice"
git commit -m "fix: handle 413 error saat audio > 25MB"
git commit -m "chore: update requirements.txt"
```

**Wajib sebelum setiap push:**

```bash
# Frontend
cd web && npx tsc --noEmit   # 0 error TypeScript

# Backend
cd api && pytest tests/ -v   # 0 fail
cd api && python -m mypy app/ --ignore-missing-imports
```

---

## 7. Aturan Keamanan

| Aturan | Detail |
|---|---|
| Gemini API key | TIDAK BOLEH ada di `web/` folder apapun, termasuk `.env.local` |
| Service Role Key | TIDAK BOLEH di FE — hanya di `api/.env` dan Railway |
| `.env` dan `.env.local` | Tidak boleh di-commit — ada di `.gitignore` |
| Library baru | Diskusikan dulu — jangan `npm install` atau `pip install` tanpa izin |
| Schema database | Jangan ubah tanpa update `ARCHITECTURE.md` dan `TASK.md` dulu |

---

## 8. Aturan Khusus OpenCode

Ketika memakai OpenCode, AI harus mengikuti batasan berikut:

1. **Baca dulu, tulis kemudian** — baca file terkait sebelum menulis kode baru
2. **Satu file per task** — jangan edit banyak file sekaligus kecuali diminta
3. **Tanya sebelum install** — tanya pengguna sebelum menambah dependency baru
4. **Jangan sentuh file di luar scope** — jika task bilang edit `items.py`, jangan edit `main.py`
5. **Update TASK.md di akhir** — centang task yang selesai sebelum sesi berakhir
6. **Catat bug di `docs/mistakes.md`** — jika ada bug yang diperbaiki, catat penyebab dan solusinya

---

## 9. Prompt Siap Pakai

### Debug TypeScript Error

```
Ada TypeScript error di [nama file]:
[paste error message lengkap]

Konteks: file ini adalah [jelaskan fungsinya].
Fix error-nya. Jangan ganti tipe ke `any`.
Jelaskan penyebab error sebelum menulis fix.
```

### Debug Python Error

```
Ada error di FastAPI:
[paste traceback lengkap]

Endpoint: [nama endpoint]
File: [nama file]
Fix error-nya dengan type hints yang benar.
Jangan hapus validasi Pydantic yang sudah ada.
```

### Sebelum Deploy

```
Saya mau deploy V[N].
Cek apakah ada:
1. Env var baru yang perlu ditambahkan di Vercel/Railway
2. Perubahan schema database yang perlu dijalankan di Supabase
3. Dependency baru di requirements.txt atau package.json
4. CORS setting yang perlu diupdate

Setelah deploy, beri checklist manual test yang harus dilakukan.
```

### Minta Penjelasan Kode

```
Jelaskan kode ini baris per baris:
[paste kode]

Saya pemula di [Python/TypeScript]. Gunakan analogi sederhana.
Jelaskan KENAPA kode ditulis seperti ini, bukan hanya APA yang dilakukan.
```

---

## 10. Checklist Akhir Sesi

Sebelum tutup editor, pastikan:

```
□ npx tsc --noEmit → 0 error
□ pytest tests/ → 0 fail
□ TASK.md diupdate (centang yang selesai)
□ git add . && git commit -m "feat/fix: [deskripsi]"
□ git push (trigger auto-deploy)
□ Kalau ada bug yang diperbaiki → catat di docs/mistakes.md
□ Kalau sprint selesai → verifikasi live di domain publik sebelum mulai sprint berikutnya
```

---

_TITIS AGENTS.md v1.0 · OpenCode + 9router · Agustus 2026_
