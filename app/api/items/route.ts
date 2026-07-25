import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensurePrimaryCompany } from '@/lib/tenant';

export async function GET() {
  try {
    const company = await ensurePrimaryCompany();
    const items = await prisma.item.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name || data.unitPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const company = await ensurePrimaryCompany();
    const item = await prisma.item.create({
      data: {
        companyId: company.id,
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        unitPrice: Number(data.unitPrice),
        currency: data.currency || 'AED',
        taxRate: Number(data.taxRate ?? 5),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
