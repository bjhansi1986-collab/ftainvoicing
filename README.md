# FTA Invoice Pro

A comprehensive **Next.js invoice generation system** designed specifically for UAE companies. Generate professional invoices with multicurrency support, VAT compliance, PDF export, and complete payment tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## ✨ Features

### Core Features
- 📄 **Professional Invoice Generation** - Create, edit, and manage invoices with ease
- 👥 **Client Master** - Store unlimited client information with contact details
- 📦 **Item Master** - Create and manage inventory items and services
- 💾 **PDF Export** - Generate professional PDF invoices with custom branding
- 💳 **Payment Tracking** - Record and track payments with multiple payment methods
- ⚙️ **Customizable Settings** - Configure invoice templates, numbering, and default values

### Advanced Features
- 💱 **Multicurrency Support**
  - USD and AED support
  - Real-time exchange rate conversion
  - Automatic currency formatting

- ✅ **UAE VAT Compliance**
  - 5% standard VAT rate
  - Automatic VAT calculations
  - VAT exemption support
  - Compliance text on invoices

- 📊 **Dashboard Analytics**
  - Total invoice count and revenue
  - Payment tracking and status
  - Overdue invoice alerts
  - Key business metrics

- 🔒 **Robust Data Management**
  - PostgreSQL database
  - Prisma ORM for safe operations
  - Decimal.js for precise calculations
  - Proper validation and error handling

## 🚀 Quick Start

## 🌐 Deployment

- Hostinger subpath deployment guide: [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd c:\Users\jhans\FTAInvoicePro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and settings
   ```

4. **Setup database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage

### Creating an Invoice
1. Navigate to **Dashboard** → **Invoices**
2. Click **New Invoice** button
3. Select client and add items
4. Set invoice date and payment terms
5. Review and save
6. Export to PDF when ready

### Managing Clients
1. Go to **Clients** section
2. Click **Add Client** to create new
3. Enter client details including tax ID
4. Save and use in invoices

### Managing Items
1. Go to **Items** section
2. Click **Add Item** to create
3. Set pricing, SKU, and tax rate
4. Items will be available when creating invoices

### Tracking Payments
1. Visit **Payments** section
2. Record payments with date and method
3. View payment history and statistics
4. Automatically updates invoice status

### Configuring Settings
1. Go to **Settings**
2. Customize invoice prefix and numbering
3. Set default currency and VAT rate
4. Configure payment terms and templates
5. Add custom notes and footer text

## 🏗️ Project Structure

```
fta-invoice-pro/
├── app/
│   ├── api/                    # API routes
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── clients/
│   │   ├── items/
│   │   ├── payments/
│   │   └── settings/
│   ├── dashboard/              # Dashboard pages
│   │   ├── invoices/
│   │   ├── clients/
│   │   ├── items/
│   │   ├── payments/
│   │   └── settings/
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home/landing page
├── components/                # Reusable components
├── lib/                       # Utility functions
│   ├── currency.ts           # Currency conversion
│   ├── vat.ts                # VAT calculations
│   ├── formatter.ts          # Number formatting
│   └── pdf-generator.ts      # PDF generation
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── .env.example              # Environment template
├── .env.local               # Local environment (git ignored)
├── .gitignore               # Git ignore rules
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── README.md                # This file
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## 🗄️ Database Schema

### Key Models
- **Company** - Store company information and settings
- **Client** - Customer database with contact information
- **Item** - Product/service catalog
- **Invoice** - Invoice master records
- **InvoiceLine** - Individual line items with calculations
- **Payment** - Payment records and history
- **InvoiceSettings** - Customizable company settings
- **PaymentTerm** - Payment term templates

See `prisma/schema.prisma` for complete schema definition.

## 🔌 API Documentation

### Dashboard Endpoints
```
GET    /api/dashboard/stats        # Get dashboard statistics
```

### Invoice Endpoints
```
GET    /api/invoices               # List all invoices
POST   /api/invoices               # Create new invoice
GET    /api/invoices/[id]          # Get invoice details
PUT    /api/invoices/[id]          # Update invoice
DELETE /api/invoices/[id]          # Delete invoice
```

### Client Endpoints
```
GET    /api/clients                # List all clients
POST   /api/clients                # Create new client
GET    /api/clients/[id]           # Get client details
PUT    /api/clients/[id]           # Update client
DELETE /api/clients/[id]           # Delete client
```

### Item Endpoints
```
GET    /api/items                  # List all items
POST   /api/items                  # Create new item
GET    /api/items/[id]             # Get item details
PUT    /api/items/[id]             # Update item
DELETE /api/items/[id]             # Delete item
```

### Payment Endpoints
```
GET    /api/payments               # List all payments
POST   /api/payments               # Record new payment
```

### Settings Endpoints
```
GET    /api/settings               # Get current settings
PUT    /api/settings               # Update settings
```

## 🛠️ Utilities

### Currency Conversion
```typescript
import { CurrencyConverter } from '@/lib/currency';

// Convert amount
const usdAmount = CurrencyConverter.convert(1000, 'AED', 'USD');

// Get exchange rate
const rate = CurrencyConverter.getRate('AED', 'USD');

// Format currency
const formatted = CurrencyConverter.format(1000, 'AED');
```

### VAT Calculations
```typescript
import { VATCalculator } from '@/lib/vat';

// Calculate VAT
const tax = VATCalculator.calculateVAT(1000, 5);

// Calculate total with VAT
const total = VATCalculator.calculateTotal(1000, 5);

// Extract VAT from total
const { subtotal, vat } = VATCalculator.extractVAT(1050, 5);
```

### Number Formatting
```typescript
import { NumberFormatter } from '@/lib/formatter';

// Format currency
const formatted = NumberFormatter.formatCurrency(1000, 'AED', 2);

// Format with commas
const withCommas = NumberFormatter.formatWithCommas(1000000, 2);

// Format date
const dateStr = NumberFormatter.formatDate(new Date());

// Generate invoice number
const invNum = NumberFormatter.generateInvoiceNumber('INV', 1);
```

### PDF Generation
```typescript
import { PDFGenerator } from '@/lib/pdf-generator';

// Generate invoice PDF
const pdfBuffer = await PDFGenerator.generateInvoicePDF(invoiceData);

// Save or send PDF
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
res.send(pdfBuffer);
```

## 🎨 Styling

The project uses **Tailwind CSS** for styling with a custom color scheme:
- **Primary**: `#1f2937` (Dark gray)
- **Secondary**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Success**: `#10b981` (Green)
- **Info**: `#3b82f6` (Blue)

Custom Tailwind classes are defined in `app/globals.css` for common components.

## 📝 Environment Variables

Create `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fta_invoice_pro"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Environment
NODE_ENV="development"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

## 📦 Dependencies

### Core
- `next`: 14.0.0
- `react`: 18.2.0
- `react-dom`: 18.2.0
- `typescript`: 5.0.0

### Database
- `@prisma/client`: 5.0.0
- `prisma`: 5.0.0

### Styling
- `tailwindcss`: 3.3.0
- `postcss`: 8.4.0
- `autoprefixer`: 10.4.0

### Forms & Validation
- `react-hook-form`: 7.48.0
- `zod`: 3.22.0

### Utilities
- `decimal.js`: 10.4.3
- `date-fns`: 2.30.0
- `pdfkit`: 0.14.0
- `axios`: 1.6.0
- `uuid`: 9.0.1
- `zustand`: 4.4.0

## 🔄 Development Workflow

### Common Commands
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@ftainvoicepro.ae or open an issue on GitHub.

## 🗺️ Roadmap

### Phase 2
- [ ] User authentication and authorization
- [ ] Multi-company support
- [ ] Advanced invoice templates
- [ ] Email invoice delivery
- [ ] Automated payment reminders
- [ ] Receipt generation

### Phase 3
- [ ] Integration with payment gateways
- [ ] Accounting software integration
- [ ] SMS payment reminders
- [ ] Mobile app
- [ ] Advanced analytics and reporting
- [ ] Bulk invoice operations

### Phase 4
- [ ] API for third-party integrations
- [ ] Webhook support
- [ ] Invoice subscriptions
- [ ] Multi-language support
- [ ] Advanced tax compliance
- [ ] White-label solution

## 👨‍💼 Author

**FTA Invoice Pro Team**
- Website: https://ftainvoicepro.ae
- Email: info@ftainvoicepro.ae

---

**Made with ❤️ for UAE Businesses**
