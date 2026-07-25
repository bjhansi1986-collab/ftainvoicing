import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensurePrimaryCompany } from '@/lib/tenant';

export async function GET() {
  try {
    const company = await ensurePrimaryCompany();

    const [
      totalInvoices,
      totalClients,
      totalItems,
      invoiceAmounts,
      pendingAmounts,
      overdueInvoices,
    ] = await Promise.all([
      prisma.invoice.count({ where: { companyId: company.id } }),
      prisma.client.count({ where: { companyId: company.id } }),
      prisma.item.count({ where: { companyId: company.id } }),
      prisma.invoice.aggregate({
        where: { companyId: company.id },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: { companyId: company.id, paymentStatus: { not: 'paid' } },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count({
        where: { companyId: company.id, status: 'overdue' },
      }),
    ]);

    const stats = {
      totalInvoices,
      totalClients,
      totalRevenue: Number(invoiceAmounts._sum.totalAmount ?? 0),
      pendingPayments: Number(pendingAmounts._sum.totalAmount ?? 0),
      totalItems,
      overdueInvoices,
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
