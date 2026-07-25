import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = (await request.json()) as CompanyPayload;

    if (!data.name || !data.email || !data.phone || !data.address || !data.city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
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
      },
    });

    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.company.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, deletedId: params.id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
