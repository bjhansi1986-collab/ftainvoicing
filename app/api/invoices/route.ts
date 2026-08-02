import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNextInvoiceNumber } from '@/lib/tenant';

type InvoiceInputLine = {
  itemId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  taxAmount?: number;
  lineTotal?: number;
};

type InvoiceInputPayload = {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  exchangeRate?: number;
  notes?: string;
  status?: string;
  paymentStatus?: string;
  items: InvoiceInputLine[];
};

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as InvoiceInputPayload;

    if (!data.clientId || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'Client and at least one item are required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const { invoiceNumber } = await generateNextInvoiceNumber(tx, client.companyId);

      return tx.invoice.create({
        data: {
          companyId: client.companyId,
          clientId: client.id,
          invoiceNumber,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          currency: data.currency || 'AED',
          subtotal: Number(data.subtotal ?? 0),
          taxAmount: Number(data.taxAmount ?? 0),
          totalAmount: Number(data.totalAmount ?? 0),
          exchangeRate: Number(data.exchangeRate ?? 1),
          notes: data.notes || null,
          status: data.status || 'draft',
          paymentStatus: data.paymentStatus || 'unpaid',
          lines: {
            create: data.items.map((item) => ({
              itemId: item.itemId || null,
              description: item.description || 'Invoice item',
              quantity: Number(item.quantity ?? 1),
              unitPrice: Number(item.unitPrice ?? 0),
              taxRate: Number(item.taxRate ?? 5),
              taxAmount: Number(item.taxAmount ?? 0),
              lineTotal: Number(item.lineTotal ?? 0),
            })),
          },
        },
        include: {
          client: { select: { name: true } },
          lines: true,
        },
      });
    });

    return NextResponse.json(createdInvoice, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
