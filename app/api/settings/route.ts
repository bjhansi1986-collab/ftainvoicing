import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDefaultSettings, ensurePrimaryCompany } from '@/lib/tenant';

export async function GET() {
  try {
    const company = await ensurePrimaryCompany();
    const settings = await ensureDefaultSettings(company.id);
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const company = await ensurePrimaryCompany();
    const settings = await prisma.invoiceSettings.upsert({
      where: { companyId: company.id },
      update: {
        invoicePrefix: data.invoicePrefix,
        invoiceNumbering: Number(data.invoiceNumbering ?? 1000),
        defaultCurrency: data.defaultCurrency || 'AED',
        defaultVatRate: Number(data.defaultVatRate ?? 5),
        enableVat: Boolean(data.enableVat),
        paymentTermsDays: Number(data.paymentTermsDays ?? 30),
        invoiceTemplate: data.invoiceTemplate || 'standard',
        customNotes: data.customNotes || '',
        footerText: data.footerText || '',
      },
      create: {
        companyId: company.id,
        invoicePrefix: data.invoicePrefix || 'INV',
        invoiceNumbering: Number(data.invoiceNumbering ?? 1000),
        defaultCurrency: data.defaultCurrency || 'AED',
        defaultVatRate: Number(data.defaultVatRate ?? 5),
        enableVat: Boolean(data.enableVat ?? true),
        paymentTermsDays: Number(data.paymentTermsDays ?? 30),
        invoiceTemplate: data.invoiceTemplate || 'standard',
        customNotes: data.customNotes || '',
        footerText: data.footerText || '',
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
