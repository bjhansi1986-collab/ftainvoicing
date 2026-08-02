import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNextInvoiceNumber } from '@/lib/tenant';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sourceInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!sourceInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const settings = await prisma.invoiceSettings.findUnique({
      where: { companyId: sourceInvoice.companyId },
    });
    const paymentTermsDays = settings?.paymentTermsDays ?? 30;

    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);

    const clonedInvoice = await prisma.$transaction(async (tx) => {
      // Uses the invoice settings prefix/numbering format so cloned invoices
      // follow the same sequencing as newly created invoices.
      const { invoiceNumber } = await generateNextInvoiceNumber(tx, sourceInvoice.companyId);

      return tx.invoice.create({
        data: {
          companyId: sourceInvoice.companyId,
          clientId: sourceInvoice.clientId,
          invoiceNumber,
          invoiceDate,
          dueDate,
          currency: sourceInvoice.currency,
          subtotal: Number(sourceInvoice.subtotal),
          taxAmount: Number(sourceInvoice.taxAmount),
          totalAmount: Number(sourceInvoice.totalAmount),
          exchangeRate: Number(sourceInvoice.exchangeRate),
          notes: sourceInvoice.notes,
          status: 'draft',
          paymentStatus: 'unpaid',
          paidAmount: 0,
          lines: {
            create: sourceInvoice.lines.map((line) => ({
              itemId: line.itemId,
              description: line.description,
              quantity: Number(line.quantity),
              unitPrice: Number(line.unitPrice),
              taxRate: Number(line.taxRate),
              taxAmount: Number(line.taxAmount),
              lineTotal: Number(line.lineTotal),
            })),
          },
        },
        include: {
          client: { select: { name: true } },
          lines: true,
        },
      });
    });

    return NextResponse.json(clonedInvoice, { status: 201 });
  } catch (err) {
    console.error('Invoice clone error:', err);
    return NextResponse.json({ error: 'Failed to clone invoice' }, { status: 500 });
  }
}
