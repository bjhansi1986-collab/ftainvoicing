import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type PaymentPayload = {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
};

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            currency: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json(
      payments.map((payment) => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        invoiceNumber: payment.invoice.invoiceNumber,
        clientName: payment.invoice.client.name,
        amount: payment.amount,
        currency: payment.invoice.currency,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes,
        status: 'completed',
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as PaymentPayload;

    if (!data.invoiceId || !data.amount || data.amount <= 0 || !data.paymentDate || !data.paymentMethod) {
      return NextResponse.json(
        { error: 'Invoice, amount, payment date, and method are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId },
      });

      if (!invoice) {
        return { error: 'Invoice not found', status: 404 as const };
      }

      const remaining = Number(invoice.totalAmount) - Number(invoice.paidAmount);
      if (data.amount > remaining + 0.000001) {
        return {
          error: `Payment exceeds outstanding balance. Remaining: ${remaining.toFixed(2)}`,
          status: 400 as const,
        };
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: Number(data.amount),
          paymentDate: new Date(data.paymentDate),
          paymentMethod: data.paymentMethod,
          reference: data.reference || null,
          notes: data.notes || null,
        },
      });

      const newPaidAmount = Number(invoice.paidAmount) + Number(data.amount);
      const isFullyPaid = newPaidAmount >= Number(invoice.totalAmount) - 0.000001;

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: isFullyPaid ? 'paid' : 'partially_paid',
          status: isFullyPaid ? 'paid' : invoice.status,
          paidAt: isFullyPaid ? new Date(data.paymentDate) : invoice.paidAt,
        },
        select: {
          id: true,
          invoiceNumber: true,
          paidAmount: true,
          totalAmount: true,
          paymentStatus: true,
          status: true,
        },
      });

      return { payment, updatedInvoice };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
