# Deploying on Render

This codebase is now prepared to deploy on Render.

## 1) Why previous deploy failed

Render build runs lint/type checks through Next.js build, and this repository had:

- Error: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

This is fixed in dashboard stats component.

## 2) Render Blueprint (recommended)

This repo includes a Render blueprint:

- render.yaml

Steps:

1. Push latest code to GitHub.
2. In Render, click New + -> Blueprint.
3. Select this repository.
4. Render reads render.yaml and creates:
- Web service
- Persistent disk mounted at /var/data

## 3) Required environment variables

Use .env.production.example as reference.

Important:

- NODE_ENV=production
- NEXT_PUBLIC_BASE_PATH=
- DATABASE_URL=file:/var/data/prod.db
- NEXTAUTH_URL=https://<your-service>.onrender.com
- NEXTAUTH_SECRET=<random-long-secret>

If you attach a custom domain, update NEXTAUTH_URL to that URL.

## 4) Database and image persistence

This app uses SQLite via Prisma.

- DB file should live on Render persistent disk: /var/data/prod.db
- Company logo and signature are stored in DB columns, so DB persistence also preserves images.

## 5) First-time DB initialization / migration

Start command already runs:

- prisma migrate deploy
- next start

So schema is applied automatically on startup.

If migrating existing local data:

1. Download your local DB (prisma/dev.db).
2. Upload it into Render disk path as /var/data/prod.db (using shell/SSH access if available).
3. Restart service.

## 6) Build and start commands (manual setup alternative)

If not using Blueprint:

- Build Command: npm ci && npm run build
- Start Command: npm run start:render

Add a persistent disk mounted at /var/data.

## 7) Post-deploy checks

Verify:

- /login opens
- Dashboard loads after login
- Create/edit client/item/invoice works
- PDF download works
- Logo/signature appear in PDF
