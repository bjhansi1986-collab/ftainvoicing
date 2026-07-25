import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensurePrimaryCompany } from '@/lib/tenant';

type CompanyPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  uaeId?: string;
  taxId?: string;
  trrn?: string;
  vatRate?: number;
  logo?: string;
  signature?: string;
  bankDetails?: string;
};

const companyPayloadToData = (data: CompanyPayload) => ({
  name: data.name,
  email: data.email,
  phone: data.phone,
  address: data.address,
  city: data.city,
  country: data.country || 'UAE',
  uaeId: data.uaeId || null,
  taxId: data.taxId || null,
  trrn: data.trrn || null,
  vatRate: Number(data.vatRate ?? 5),
  logo: data.logo || null,
  signature: data.signature || null,
  bankDetails: data.bankDetails || null,
});

export async function GET() {
  try {
    const company = await ensurePrimaryCompany();
    return NextResponse.json(company);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as CompanyPayload;

    if (!data.name || !data.email || !data.phone || !data.address || !data.city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await prisma.company.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    const company = existing
      ? await prisma.company.update({
          where: { id: existing.id },
          data: companyPayloadToData(data),
        })
      : await prisma.company.create({
          data: companyPayloadToData(data),
        });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save company details' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = (await request.json()) as CompanyPayload;
    const existing = await ensurePrimaryCompany();

    const company = await prisma.company.update({
      where: { id: existing.id },
      data: companyPayloadToData(data),
    });

    return NextResponse.json(company);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update company details' },
      { status: 500 }
    );
  }
}

