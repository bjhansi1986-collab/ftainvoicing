import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensurePrimaryCompany, seedGlobalClientsIfEmpty } from '@/lib/tenant';

export async function GET() {
  try {
    const company = await ensurePrimaryCompany();
    await seedGlobalClientsIfEmpty(company.id);

    const clients = await prisma.client.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name || !data.email || !data.phone || !data.address || !data.city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const company = await ensurePrimaryCompany();
    const client = await prisma.client.create({
      data: {
        companyId: company.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country || 'UAE',
        taxId: data.taxId || null,
        tradeId: data.tradeId || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
