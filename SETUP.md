# FTA Invoice Pro - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher - [Download](https://nodejs.org/)
- **npm** 9.x or higher (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL** 12 or higher - [Download](https://www.postgresql.org/download/)

## Installation Steps

### 1. Install Dependencies

**Windows (Using setup.bat):**
```bash
setup.bat
```

**macOS/Linux (Using setup.sh):**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual Installation:**
```bash
npm install
npm run prisma:generate
```

### 2. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and configure:
   ```env
   # PostgreSQL Database URL
   # Format: postgresql://username:password@localhost:5432/database_name
   DATABASE_URL="postgresql://postgres:password@localhost:5432/fta_invoice_pro"

   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"

   # Environment
   NODE_ENV="development"

   # Authentication (Optional, for future use)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

### 3. Set Up Database

#### Create PostgreSQL Database:

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name it `fta_invoice_pro`
4. Click "Save"

**Using Command Line:**
```bash
psql -U postgres
CREATE DATABASE fta_invoice_pro;
\q
```

#### Run Database Migrations:
```bash
npm run prisma:migrate
```

This will:
- Create all database tables
- Set up indexes and relationships
- Seed any initial data (if configured)

### 4. Verify Prisma Setup

Generate the Prisma Client:
```bash
npm run prisma:generate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Troubleshooting

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   pg_isready
   
   # macOS
   brew services list
   ```
2. Check your `DATABASE_URL` in `.env.local`
3. Ensure PostgreSQL is running on port 5432

### Migration Failed

**Error:** `Error: Migration failed. Roll back this migration with prisma migrate resolve`

**Solution:**
1. Reset the database (⚠️ Warning: This deletes all data):
   ```bash
   npm run prisma:migrate reset
   ```
2. Or manually fix the issue and run migrations again:
   ```bash
   npm run prisma:migrate
   ```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
1. Kill the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :3000
   kill -9 <PID>
   ```
2. Or use a different port:
   ```bash
   npm run dev -- -p 3001
   ```

### npm install Fails

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Reset database (⚠️ Deletes all data)
npm run prisma:migrate reset
```

## Project Structure

After setup, your project structure will be:

```
fta-invoice-pro/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   ├── currency.ts       # Currency utilities
│   ├── vat.ts            # VAT calculations
│   ├── formatter.ts      # Number formatting
│   └── pdf-generator.ts  # PDF generation
├── prisma/
│   └── schema.prisma     # Database schema
├── node_modules/         # Dependencies
├── .env.local           # Environment variables
├── package.json         # Project metadata
├── next.config.js       # Next.js config
└── README.md            # Documentation
```

## First Use

1. **Open the Application**
   - Navigate to http://localhost:3000
   - You'll see the landing page with features overview

2. **Access the Dashboard**
   - Click "Get Started" or "Enter Dashboard"
   - You'll see the dashboard with mock data

3. **Create Your First Invoice**
   - Go to Dashboard → Invoices
   - Click "New Invoice"
   - Select a client from the list
   - Add items and set the invoice date
   - Click Save

4. **Manage Clients**
   - Go to Dashboard → Clients
   - Click "Add Client"
   - Enter client details
   - Save to use in invoices

5. **Configure Settings**
   - Go to Dashboard → Settings
   - Customize invoice prefix, VAT rate, and other options
   - Save your preferences

## Database Schema

The application uses the following main tables:

- **Invoice** - Stores invoice headers
- **InvoiceLine** - Stores line items for invoices
- **Client** - Stores client information
- **Item** - Stores product/service catalog
- **Payment** - Stores payment records
- **Company** - Stores company information
- **InvoiceSettings** - Stores company preferences

See `prisma/schema.prisma` for the complete schema.

## API Endpoints

Once running, the API is available at `http://localhost:3000/api/`:

- `GET /dashboard/stats` - Dashboard statistics
- `GET /invoices` - List invoices
- `GET /clients` - List clients
- `GET /items` - List items
- `GET /payments` - List payments
- `GET /settings` - Get settings

See `README.md` for full API documentation.

## Next Steps

1. **Customize Settings** - Configure your company details and preferences
2. **Add Clients** - Import or manually add your client list
3. **Create Items** - Set up your product/service catalog
4. **Generate Invoices** - Start creating professional invoices
5. **Track Payments** - Record and monitor incoming payments

## Support

For issues or questions:
1. Check the README.md for feature documentation
2. Review the source code comments
3. Check the database schema in `prisma/schema.prisma`
4. Review API routes in `app/api/`

## Security Notes

- **Never commit `.env.local`** - It contains sensitive information
- **Use strong database passwords** in production
- **Change `NEXTAUTH_SECRET`** before deploying
- **Validate user input** on both client and server
- **Use HTTPS** in production
- **Set up authentication** before going live

## Production Deployment

For production deployment:
1. Build the project: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run prisma:migrate deploy`
4. Start production server: `npm start`
5. Set up reverse proxy (nginx/Apache)
6. Configure SSL/TLS certificates
7. Set up backups for PostgreSQL database

---

**Ready to start?** Run `setup.bat` (Windows) or `./setup.sh` (macOS/Linux) to begin!
