import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type InvoiceInputLine = {
  itemId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  taxAmount?: number;
  lineTotal?: number;
};

type InvoiceUpdatePayload = {
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
  items: InvoiceInputLine[];
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        client: true,
        lines: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, deletedId: params.id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = (await request.json()) as InvoiceUpdatePayload;

    if (!data.clientId || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'Client and at least one item are required' }, { status: 400 });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.companyId !== existingInvoice.companyId) {
      return NextResponse.json({ error: 'Client does not belong to invoice company' }, { status: 400 });
    }

    const paidAmount = Number(existingInvoice.paidAmount);
    const nextTotalAmount = Number(data.totalAmount ?? 0);
    if (nextTotalAmount < paidAmount - 0.000001) {
      return NextResponse.json(
        { error: 'Invoice total cannot be less than already paid amount' },
        { status: 400 }
      );
    }

    const paymentStatus =
      paidAmount <= 0
        ? 'unpaid'
        : paidAmount >= nextTotalAmount - 0.000001
          ? 'paid'
          : 'partially_paid';

    const status =
      paymentStatus === 'paid'
        ? 'paid'
        : data.status && data.status !== 'paid'
          ? data.status
          : existingInvoice.status === 'paid'
            ? 'sent'
            : existingInvoice.status;

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceLine.deleteMany({ where: { invoiceId: params.id } });

      return tx.invoice.update({
        where: { id: params.id },
        data: {
          clientId: client.id,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          currency: data.currency || 'AED',
          subtotal: Number(data.subtotal ?? 0),
          taxAmount: Number(data.taxAmount ?? 0),
          totalAmount: nextTotalAmount,
          exchangeRate: Number(data.exchangeRate ?? 1),
          notes: data.notes || null,
          status,
          paymentStatus,
          paidAt: paymentStatus === 'paid' ? existingInvoice.paidAt || new Date() : null,
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

    return NextResponse.json(updatedInvoice);
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
