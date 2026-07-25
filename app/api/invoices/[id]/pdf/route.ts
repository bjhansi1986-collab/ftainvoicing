import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PDFGenerator } from '@/lib/pdf-generator';
import { NumberFormatter } from '@/lib/formatter';
import { CurrencyConverter } from '@/lib/currency';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const showAedParam = (url.searchParams.get('showAed') || '').toLowerCase();
    const showAed = showAedParam === '1' || showAedParam === 'true' || showAedParam === 'yes';

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        client: true,
        lines: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const settings = await prisma.invoiceSettings.findUnique({
      where: { companyId: invoice.companyId },
    });

    const aedEquivalent =
      showAed && invoice.currency !== 'AED'
        ? CurrencyConverter.convert(Number(invoice.totalAmount), invoice.currency, 'AED').toNumber()
        : undefined;

    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: NumberFormatter.formatDate(invoice.invoiceDate),
      dueDate: NumberFormatter.formatDate(invoice.dueDate),
      currency: invoice.currency,
      company: {
        name: invoice.company.name,
        email: invoice.company.email,
        phone: invoice.company.phone,
        address: invoice.company.address,
        city: invoice.company.city,
        country: invoice.company.country,
        taxId: invoice.company.taxId || undefined,
        trrn: invoice.company.trrn || undefined,
        logo: invoice.company.logo || undefined,
        signature: invoice.company.signature || undefined,
      },
      client: {
        name: invoice.client.name,
        email: invoice.client.email,
        phone: invoice.client.phone,
        address: invoice.client.address,
        city: invoice.client.city,
        country: invoice.client.country,
        taxId: invoice.client.taxId || undefined,
      },
      items: invoice.lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        taxRate: Number(line.taxRate),
        taxAmount: Number(line.taxAmount),
        lineTotal: Number(line.lineTotal),
      })),
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      totalAmount: Number(invoice.totalAmount),
      showAed,
      aedEquivalent,
      notes: invoice.notes || undefined,
      footerText: settings?.footerText || 'Thank you for your business!',
      bankDetails: invoice.company.bankDetails || undefined,
      paymentTerms: `${settings?.paymentTermsDays || 30} days`,
    };

    const pdfBuffer = await PDFGenerator.generateInvoicePDF(pdfData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

