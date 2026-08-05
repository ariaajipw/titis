# TITIS Project Context

## Apa ini
PWA untuk capture knowledge (voice/image/YouTube/text) → inbox stream → export.
Learning vehicle: React + TypeScript + FastAPI + Web3.

## Stack
FE: Vite + React 18 + TypeScript + Tailwind v4 + Zustand + @supabase/supabase-js
BE: FastAPI (Python 3.11)
AI: Gemini Flash via FastAPI (API key di BE, tidak di FE)
DB: Supabase (PostgreSQL + Auth)
Deploy: Vercel (FE) + Railway (BE)

## Struktur folder
Frontend: web/
Backend: api/

## Paradigma utama
Inbox Stream — semua input masuk ke satu list berurutan waktu.
Bukan folder. Bukan Kanban.

## Versi sekarang
V1 — Text Input + Auth + Deploy

## Aturan ketat
- Gemini API key TIDAK BOLEH di web/ folder apapun
- Auth token hanya via supabase.auth.getSession() — BUKAN localStorage
- Tidak ada tipe `any` di TypeScript
- Semua function Python wajib type hints
- Jangan install dependency baru tanpa diskusi
EOF