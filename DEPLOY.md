# ขึ้น server ของรายวิชา — csmju-study-qa

ตาม `standards/docs/deployment.md` (standards 1.8.4) · DevOps เป็นคนขึ้นระบบ ทีมเตรียม image และ env ให้

```text
ผู้ใช้ ─► https://csmju-study-qa.jowave.com      Cloudflare → Apache → 127.0.0.1:<พอร์ตใน csmju-map.txt>
            │
            ▼
          web  (Next.js · :3000 · frontend/Dockerfile)   ประตูเดียวของระบบ
            │  /api/* · /auth/login · /auth/callback · /auth/logout  → http://api:4000 (ฝังตอน build)
            ▼
          api  (NestJS · :4000 · backend/Dockerfile)      migrate ตอนสตาร์ต แล้วเปิด server
            │
            ├─► PostgreSQL ตัวกลาง                        database + role ของระบบนี้
            ├─► https://csmju2030.jowave.com            Core Hub (SSO · JWKS)
            └─► Gemini API                               ผู้ช่วย AI
```

## 1. image

push เข้า `main` แล้ว workflow `images.yml` (DevOps วางไว้) build ให้เอง — ดูผลที่ **Actions → Images**

| image | จาก |
|---|---|
| `ghcr.io/csmju2030/csmju-study-qa-api:main` | `backend/Dockerfile` |
| `ghcr.io/csmju2030/csmju-study-qa-web:main` | `frontend/Dockerfile` |

## 2. env บน server

**api** — รายการเต็มอยู่ใน `backend/.env.example`

| env | ค่า |
|---|---|
| `NODE_ENV` · `PORT` · `TZ` | `production` · `4000` · `Asia/Bangkok` |
| `DATABASE_URL` · `DATABASE_POOL_MAX` | ของ DevOps · `5` |
| `CORE_HUB_URL` · `CORE_HUB_WEB_URL` | `https://csmju2030.jowave.com` |
| `CORE_HUB_JWKS_URL` | `https://csmju2030.jowave.com/api/v1/.well-known/jwks.json` |
| `CORE_HUB_ISSUER` · `CORE_HUB_AUDIENCE` | `core-hub` · `csmju2030` |
| `SUBSYSTEM_ID` · `SUBSYSTEM_NAME` | `csmju-study-qa` · `ถาม-ตอบวิชาการ CS แม่โจ้` |
| `TRUST_PROXY` | `uniquelocal` — คำขอมาถึง api ผ่าน web ใน network ของ compose ที่อยู่ของผู้ใช้จึงมาจาก `X-Forwarded-For` |
| `GEMINI_API_KEY` | **ค่าลับ** — PL ส่งให้ทางข้อความส่วนตัว · ว่าง = ปิดผู้ช่วย AI |
| `GEMINI_MODELS` | `gemini-3.5-flash,gemini-flash-lite-latest` |

**web** — `CORE_HUB_WEB_URL` · `SUBSYSTEM_ID` · `TZ` ตามมาตรฐาน **และเพิ่ม** `GEMINI_API_KEY` · `GEMINI_MODELS`
(แชตของผู้ช่วยและตัวช่วยร่างคำถามเรียก Gemini จากฝั่ง web — `frontend/src/app/assistant/*`)

## 3. ทดสอบในเครื่องก่อนขอขึ้น (deployment.md ข้อ 6)

```bash
docker compose up -d --build     # db + api + web แบบเดียวกับ server
docker compose ps                # ทั้งสามต้อง healthy
docker compose logs api          # migration ผ่าน และ subsystem.started
docker stats --no-stream         # web + api ไม่เกิน ~400 MB
docker compose down
```

เปิด `http://localhost:3235` ด้วย Chrome แล้ว login ผ่าน Core Hub · ใส่ `GEMINI_API_KEY` ในไฟล์ `.env` ที่รากของ repo (ไม่ขึ้น git) ถ้าจะทดสอบผู้ช่วย AI

## 4. ทะเบียน Core Hub

| ช่วง | Callback URL | Base URL |
|---|---|---|
| ก่อนเปิดใช้ (ทดสอบในเครื่อง) | `http://localhost:3235/auth/callback` | `http://localhost:3235` |
| เปิดใช้บน server | `https://csmju-study-qa.jowave.com/auth/callback` | `https://csmju-study-qa.jowave.com` |

วันเปิดใช้ server ปิดโหมดก่อนเปิดใช้ — PL ขอ admin เปลี่ยน callback เป็นค่าของ server ก่อนวันนั้น

## 5. ข้อมูลเดิม (ถ้าต้องย้าย)

ตารางถูกสร้างเองตอน api สตาร์ต · ถ้าจะย้ายกระทู้เดิมไป server ให้ dump เฉพาะข้อมูลแล้วส่งให้ DevOps นำเข้าหลัง api สร้างตารางเสร็จ

```bash
pg_dump --data-only --no-owner --exclude-table=_prisma_migrations "<DATABASE_URL ของฐานเดิม>" > data.sql
```

ไฟล์นี้มีข้อมูลผู้ใช้ — ส่งทางที่ปลอดภัยและลบทิ้งหลังใช้
