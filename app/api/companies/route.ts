import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(companies);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.phone || !data.address || !data.city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const company = await prisma.company.create({
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
        bankDetails: data.bankDetails || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
