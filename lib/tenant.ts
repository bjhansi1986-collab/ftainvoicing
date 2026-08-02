import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from './prisma';

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

/**
 * Generates the next invoice number for a company using the invoice settings
 * format (prefix + zero-padded numbering), and atomically increments the
 * numbering counter. Must be called with the same client/transaction used to
 * persist the invoice so the sequence stays consistent across create/clone.
 */
export async function generateNextInvoiceNumber(
  tx: PrismaClientOrTx,
  companyId: string
) {
  const settings = await tx.invoiceSettings.upsert({
    where: { companyId },
    update: {},
    create: {
      companyId,
      invoicePrefix: 'INV',
      invoiceNumbering: 1000,
      defaultCurrency: 'AED',
      defaultVatRate: 5,
      enableVat: true,
      paymentTermsDays: 30,
      invoiceTemplate: 'standard',
      customNotes: '',
      footerText: 'Thank you for your business!',
    },
  });

  const invoiceNumber = `${settings.invoicePrefix}-${String(settings.invoiceNumbering).padStart(6, '0')}`;

  await tx.invoiceSettings.update({
    where: { companyId },
    data: { invoiceNumbering: { increment: 1 } },
  });

  return { invoiceNumber, settings };
}

export async function ensurePrimaryCompany() {
  let company = await prisma.company.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Default Company',
        email: 'admin@example.com',
        phone: '+1 555 0100',
        address: '1 Main Street',
        city: 'New York',
        country: 'USA',
        uaeId: 'DEFAULT-REG-001',
        taxId: 'DEFAULT-TAX-001',
        trrn: 'DEFAULT-TRRN-001',
        vatRate: 5,
      },
    });
  }

  return company;
}

export async function ensureDefaultSettings(companyId: string) {
  return prisma.invoiceSettings.upsert({
    where: { companyId },
    update: {},
    create: {
      companyId,
      invoicePrefix: 'INV',
      invoiceNumbering: 1000,
      defaultCurrency: 'AED',
      defaultVatRate: 5,
      enableVat: true,
      paymentTermsDays: 30,
      invoiceTemplate: 'standard',
      customNotes: '',
      footerText: 'Thank you for your business!',
    },
  });
}

export async function seedGlobalClientsIfEmpty(companyId: string) {
  const templates = [
    {
      name: 'Acme Corporation',
      email: 'billing@acme.us',
      phone: '+1 212 555 0101',
      address: '350 5th Ave',
      city: 'New York',
      country: 'USA',
      taxId: 'US-TAX-1001',
      tradeId: 'US-REG-1001',
    },
    {
      name: 'Maple Tech Inc.',
      email: 'accounts@mapletech.ca',
      phone: '+1 416 555 0102',
      address: '100 King St W',
      city: 'Toronto',
      country: 'Canada',
      taxId: 'CA-GST-2002',
      tradeId: 'CA-REG-2002',
    },
    {
      name: 'EuroTrade GmbH',
      email: 'finance@eurotrade.de',
      phone: '+49 30 555 0103',
      address: 'Friedrichstrasse 10',
      city: 'Berlin',
      country: 'Germany',
      taxId: 'DE-VAT-3003',
      tradeId: 'DE-REG-3003',
    },
    {
      name: 'Gulf Services LLC',
      email: 'accounts@gulfservices.ae',
      phone: '+971 4 555 0104',
      address: 'Sheikh Zayed Road',
      city: 'Dubai',
      country: 'UAE',
      taxId: 'AE-TRN-4004',
      tradeId: 'AE-REG-4004',
    },
  ];

  for (const template of templates) {
    await prisma.client.upsert({
      where: {
        companyId_email: {
          companyId,
          email: template.email,
        },
      },
      update: {
        name: template.name,
        phone: template.phone,
        address: template.address,
        city: template.city,
        country: template.country,
        taxId: template.taxId,
        tradeId: template.tradeId,
      },
      create: {
        companyId,
        ...template,
      },
    });
  }
}
