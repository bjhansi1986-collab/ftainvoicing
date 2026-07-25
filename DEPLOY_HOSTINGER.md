# Deploying on Hostinger at /ftainvoicepro

This project is now prepared for deployment at:
- https://azurotech.in/ftainvoicepro

## 1) Hosting Type Requirement

You need a Hostinger environment that supports Node.js process hosting:
- VPS or cloud hosting with Node.js access is recommended.
- Shared hosting without a persistent Node process will not run this app.

## 2) Server Folder Layout

Use a structure like:

- /home/USERNAME/apps/ftainvoicepro
- /home/USERNAME/apps/ftainvoicepro/data
- /home/USERNAME/apps/ftainvoicepro/backups

## 3) Upload Files

Upload this repository (or deploy package) to:
- /home/USERNAME/apps/ftainvoicepro

Then install dependencies:

```bash
cd /home/USERNAME/apps/ftainvoicepro
npm ci
```

## 4) Configure Production Environment

Copy env template and edit values:

```bash
cp .env.production.example .env
nano .env
```

Required production values:

- NEXT_PUBLIC_BASE_PATH=/ftainvoicepro
- DATABASE_URL="file:/home/USERNAME/apps/ftainvoicepro/data/prod.db"
- NEXTAUTH_URL="https://azurotech.in/ftainvoicepro"
- NEXTAUTH_SECRET="<long-random-secret>"

## 5) Move Existing DB (includes logo/signature images)

Logo/signature data is stored in SQLite fields, so copying DB carries those images.

If your current DB is in prisma/dev.db:

```bash
mkdir -p /home/USERNAME/apps/ftainvoicepro/data
cp /home/USERNAME/apps/ftainvoicepro/prisma/dev.db /home/USERNAME/apps/ftainvoicepro/data/prod.db
```

## 6) Build and Start

```bash
npm run build
npm run start:hostinger
```

This runs Prisma migrations and starts Next.js.

## 7) Keep App Running with PM2

Install PM2 globally once:

```bash
npm install -g pm2
```

Edit cwd in ecosystem.config.cjs, then run:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 8) Nginx Reverse Proxy for Subpath

Use an Nginx config similar to:

```nginx
server {
    listen 80;
    server_name azurotech.in www.azurotech.in;

    location /ftainvoicepro/ {
        proxy_pass http://127.0.0.1:3000/ftainvoicepro/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 9) SSL

Enable SSL for azurotech.in using Hostinger panel or certbot.

## 10) Backups

Create DB backups regularly:

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh /home/USERNAME/apps/ftainvoicepro/data/prod.db /home/USERNAME/apps/ftainvoicepro/backups
```

Restore backup if needed:

```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh /home/USERNAME/apps/ftainvoicepro/backups/prod-YYYYMMDD-HHMMSS.db /home/USERNAME/apps/ftainvoicepro/data/prod.db
```

## 11) Windows Packaging Helper

From your local project root, generate a zip package:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-deploy.ps1
```

It creates hostinger-deploy.zip.

## 12) Post-Deploy Smoke Check

Verify:
- https://azurotech.in/ftainvoicepro/login
- Dashboard load after login
- Create/edit client/item/invoice
- Download PDF
- Company logo and signature appear in PDF
