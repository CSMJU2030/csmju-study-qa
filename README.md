# csmju-study-qa

ถาม-ตอบวิชาการ CS แม่โจ้ — กระดานถาม-ตอบและผู้ช่วยวิชาการ AI ของสาขาวิทยาการคอมพิวเตอร์ ระบบย่อยของโครงการ CSMJU2030

มาตรฐานกลางอยู่ใน `standards/` (submodule ของ CSMJU2030/csmju2030-standards) · รายงานการปรับให้ตรงมาตรฐานอยู่ที่ `REPORT.md`

| ส่วน | ที่อยู่ | พอร์ตในเครื่อง |
|---|---|---|
| หน้าเว็บ (Next.js) — ประตูเดียวของระบบ | `frontend/` | 3235 |
| backend (NestJS + Prisma + PostgreSQL) | `backend/` | 4235 |

## เริ่มทำงาน

```bash
git submodule update --init standards/
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
pnpm db:migrate
pnpm dev
```

เปิด http://localhost:3235 (ต้องเป็น `localhost` ตามที่ลงทะเบียน callback)

- ยังไม่ได้รับอนุมัติใน Core Hub: `pnpm dev:local` ใช้ Core Hub จำลองในเครื่อง (บัญชีทดสอบ ไม่มีรหัสผ่าน)
- ดูหน้าเว็บอย่างเดียว ไม่ต้องมี backend: `pnpm --filter frontend dev:demo`
- ขึ้นระบบออนไลน์ (Vercel + Render + Neon): `DEPLOY.md`

ก่อนเปิด PR อ่าน `standards/docs/github-workflow.md` ข้อ 1 · branch ชื่อ `feature/csmju-study-qa/<เรื่องที่ทำ>`
