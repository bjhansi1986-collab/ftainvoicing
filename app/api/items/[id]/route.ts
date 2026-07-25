import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        unitPrice: Number(data.unitPrice),
        currency: data.currency || 'AED',
        taxRate: Number(data.taxRate ?? 5),
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
