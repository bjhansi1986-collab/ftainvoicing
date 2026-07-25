import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NumberFormatter } from './formatter';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId?: string;
    trrn?: string;
    logo?: string;
    signature?: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  showAed?: boolean;
  aedEquivalent?: number;
  notes?: string;
  footerText?: string;
  bankDetails?: string;
  paymentTerms?: string;
}

type DecodedImage = {
  bytes: Uint8Array;
  isPng: boolean;
};

function decodeDataUrl(dataUrl?: string): DecodedImage | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return null;
  }

  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    return null;
  }

  const meta = parts[0] || '';
  const base64 = parts[1] || '';
  const isPng = meta.includes('image/png');

  try {
    const bytes = Uint8Array.from(Buffer.from(base64, 'base64'));
    return { bytes, isPng };
  } catch {
    return null;
  }
}

export class PDFGenerator {
  static async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);

    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const width = page.getWidth();
    const height = page.getHeight();

    const drawText = (
      text: string,
      x: number,
      y: number,
      size = 10,
      useBold = false,
      color = rgb(0.15, 0.15, 0.15)
    ) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: useBold ? bold : regular,
        color,
      });
    };
    const left = 20;
    const right = width - 20;
    const contentWidth = right - left;
    const muted = rgb(0.3, 0.3, 0.3);
    const purple = rgb(0.36, 0.2, 0.73);
    const lightPurple = rgb(0.93, 0.92, 0.98);
    const white = rgb(1, 1, 1);
    const border = rgb(0.86, 0.86, 0.92);

    const wrapText = (
      text: string,
      maxWidth: number,
      size: number,
      useBold = false,
      maxLines = 5
    ) => {
      const font = useBold ? bold : regular;
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = '';

      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
          continue;
        }
        if (current) {
          lines.push(current);
        }
        current = word;
        if (lines.length >= maxLines - 1) {
          break;
        }
      }
      if (current && lines.length < maxLines) {
        lines.push(current);
      }
      return lines;
    };

    const drawCard = (x: number, y: number, w: number, h: number, color = lightPurple) => {
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color,
        borderColor: border,
        borderWidth: 0.7,
      });
    };


    const truncateText = (text: string, maxWidth: number, size: number, useBold = false) => {
      const font = useBold ? bold : regular;
      if (font.widthOfTextAtSize(text, size) <= maxWidth) {
        return text;
      }
      const ellipsis = '...';
      let trimmed = text;
      while (trimmed.length > 0) {
        trimmed = trimmed.slice(0, -1);
        const candidate = `${trimmed}${ellipsis}`;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          return candidate;
        }
      }
      return ellipsis;
    };
    const drawRightAligned = (
      text: string,
      xRight: number,
      y: number,
      size = 10,
      useBold = false,
      color = rgb(0.15, 0.15, 0.15)
    ) => {
      const font = useBold ? bold : regular;
      const textWidth = font.widthOfTextAtSize(text, size);
      drawText(text, xRight - textWidth, y, size, useBold, color);
    };

    const drawLeftInCell = (
      text: string,
      cellLeft: number,
      cellRight: number,
      yPos: number,
      size = 9.5,
      useBold = false,
      color = rgb(0.15, 0.15, 0.15)
    ) => {
      const safe = truncateText(text, cellRight - cellLeft - 8, size, useBold);
      drawText(safe, cellLeft + 4, yPos, size, useBold, color);
    };

    const drawRightInCell = (
      text: string,
      cellLeft: number,
      cellRight: number,
      yPos: number,
      size = 9.5,
      useBold = false,
      color = rgb(0.15, 0.15, 0.15)
    ) => {
      const safe = truncateText(text, cellRight - cellLeft - 8, size, useBold);
      const font = useBold ? bold : regular;
      const textWidth = font.widthOfTextAtSize(safe, size);
      drawText(safe, cellRight - textWidth - 4, yPos, size, useBold, color);
    };

    const parseBankDetails = (bankDetails?: string) => {
      const base = {
        accountName: invoiceData.company.name,
        accountNumber: '-',
        iban: '-',
        bank: '-',
      };
      if (!bankDetails) {
        return base;
      }

      const normalized = bankDetails
        .replace(/\r/g, '\n')
        .replace(/,/g, '\n')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const line of normalized) {
        const [rawKey, ...rest] = line.split(':');
        if (!rawKey || rest.length === 0) {
          continue;
        }
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':').trim();
        if (key.includes('account name')) base.accountName = value;
        if (key.includes('account number')) base.accountNumber = value;
        if (key === 'iban' || key.includes('iban')) base.iban = value;
        if (key === 'bank' || key.includes('bank')) base.bank = value;
      }

      return base;
    };

    let y = height - 40;
    drawText('Invoice', left, y, 24, false, purple);

    // Fixed logo box at top-right to match requested placement.
    const logoBoxW = 230;
    const logoBoxH = 104;
    const logoBoxX = right - logoBoxW;
    const logoBoxY = height - 122;

    const logoImage = decodeDataUrl(invoiceData.company.logo);
    if (logoImage) {
      const image = logoImage.isPng
        ? await pdf.embedPng(logoImage.bytes)
        : await pdf.embedJpg(logoImage.bytes);
      const maxWidth = logoBoxW - 16;
      const maxHeight = logoBoxH - 16;
      const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
      const logoW = image.width * ratio;
      const logoH = image.height * ratio;
      page.drawImage(image, {
        x: logoBoxX + (logoBoxW - logoW) / 2,
        y: logoBoxY + (logoBoxH - logoH) / 2,
        width: logoW,
        height: logoH,
      });
    }

    y -= 28;
    drawText('Invoice No', left, y, 10, true, muted);
    drawText(invoiceData.invoiceNumber, left + 78, y, 10, true);
    y -= 28;
    drawText('Invoice Date', left, y, 10, true, muted);
    drawText(invoiceData.invoiceDate, left + 78, y, 10, true);
    y -= 28;
    drawText('Due Date', left, y, 10, true, muted);
    drawText(invoiceData.dueDate, left + 78, y, 10, true);

    const cardsTop = y - 24;
    const gap = 8;
    const cardW = (contentWidth - gap) / 2;
    const cardH = 138;

    drawCard(left, cardsTop - cardH, cardW, cardH);
    drawCard(left + cardW + gap, cardsTop - cardH, cardW, cardH);

    drawText('Billed By', left + 12, cardsTop - 28, 12, false, purple);
    drawText('Billed To', left + cardW + gap + 12, cardsTop - 28, 12, false, purple);

    let byY = cardsTop - 48;
    drawText(invoiceData.company.name, left + 12, byY, 10.5, true);
    byY -= 18;
    const byLines = [
      invoiceData.company.address,
      `${invoiceData.company.city}`,
      `${invoiceData.company.country}`,
      `VAT/ TRN: ${invoiceData.company.trrn || '-'}`,
    ];
    for (const line of byLines) {
      for (const wrapped of wrapText(line, cardW - 24, 9.6, false, 2)) {
        drawText(wrapped, left + 12, byY, 9.6);
        byY -= 14;
      }
    }

    let toY = cardsTop - 48;
    drawText(invoiceData.client.name, left + cardW + gap + 12, toY, 10.5, true);
    toY -= 18;
    const clientCountry = (invoiceData.client.country || '').trim().toLowerCase();
    const isUaeInvoice = clientCountry === 'uae' || clientCountry === 'united arab emirates';
    const toLines = [
      invoiceData.client.address,
      `${invoiceData.client.city}`,
      `${invoiceData.client.country}`,
      ...(isUaeInvoice ? [`VAT/ TRN: ${invoiceData.client.taxId || '-'}`] : []),
    ];
    for (const line of toLines) {
      for (const wrapped of wrapText(line, cardW - 24, 9.6, false, 2)) {
        drawText(wrapped, left + cardW + gap + 12, toY, 9.6);
        toY -= 14;
      }
    }

    y = cardsTop - cardH - 18;

    const tableTop = y;
    const tableHeaderH = 38;
    const rowH = 30;
    const maxRows = Math.min(invoiceData.items.length, 12);

    // Fixed table widths prevent amount/tax/total overlap on large values.
    const colWidths = [194, 56, 50, 55, 70, 58, 72];
    const colStarts = [left];
    for (let i = 0; i < colWidths.length; i++) {
      colStarts.push(colStarts[i] + colWidths[i]);
    }

    page.drawRectangle({
      x: left,
      y: tableTop - tableHeaderH,
      width: contentWidth,
      height: tableHeaderH,
      color: purple,
    });

    for (let i = 1; i < colStarts.length - 1; i++) {
      page.drawLine({
        start: { x: colStarts[i], y: tableTop - tableHeaderH },
        end: { x: colStarts[i], y: tableTop },
        thickness: 0.7,
        color: rgb(0.48, 0.34, 0.8),
      });
    }

    drawRightInCell('Item', colStarts[0], colStarts[1], tableTop - 24, 10.2, true, white);
    drawRightInCell('TAX', colStarts[1], colStarts[2], tableTop - 17, 8.8, true, white);
    drawRightInCell('Rate', colStarts[1], colStarts[2], tableTop - 28, 8.8, true, white);
    drawRightInCell('Quantity', colStarts[2], colStarts[3], tableTop - 24, 10.2, true, white);
    drawRightInCell('Rate', colStarts[3], colStarts[4], tableTop - 24, 10.2, true, white);
    drawRightInCell('Amount', colStarts[4], colStarts[5], tableTop - 24, 10.2, true, white);
    drawRightInCell('TAX', colStarts[5], colStarts[6], tableTop - 24, 10.2, true, white);
    drawRightInCell('Total', colStarts[6], colStarts[7], tableTop - 24, 10.2, true, white);

    let rowY = tableTop - tableHeaderH;
    for (let i = 0; i < maxRows; i++) {
      const item = invoiceData.items[i];
      const shaded = i % 2 === 0;
      page.drawRectangle({
        x: left,
        y: rowY - rowH,
        width: contentWidth,
        height: rowH,
        color: shaded ? lightPurple : rgb(1, 1, 1),
        borderColor: border,
        borderWidth: 0.4,
      });

      for (let c = 1; c < colStarts.length - 1; c++) {
        page.drawLine({
          start: { x: colStarts[c], y: rowY - rowH },
          end: { x: colStarts[c], y: rowY },
          thickness: 0.4,
          color: border,
        });
      }

      drawLeftInCell(`${i + 1}. ${item.description}`, colStarts[0], colStarts[1], rowY - 19, 9.7);
      drawRightInCell(`${NumberFormatter.formatDecimal(item.taxRate, 0)}%`, colStarts[1], colStarts[2], rowY - 19, 9.7);
      drawRightInCell(NumberFormatter.formatDecimal(item.quantity, 2), colStarts[2], colStarts[3], rowY - 19, 9.7);
      drawRightInCell(`$${NumberFormatter.formatWithCommas(item.unitPrice, 2)}`, colStarts[3], colStarts[4], rowY - 19, 9.7);
      drawRightInCell(`$${NumberFormatter.formatWithCommas(item.unitPrice * item.quantity, 2)}`, colStarts[4], colStarts[5], rowY - 19, 9.7);
      drawRightInCell(`$${NumberFormatter.formatWithCommas(item.taxAmount, 2)}`, colStarts[5], colStarts[6], rowY - 19, 9.7);
      drawRightInCell(`$${NumberFormatter.formatWithCommas(item.lineTotal, 2)}`, colStarts[6], colStarts[7], rowY - 19, 9.7);

      rowY -= rowH;
    }

    y = rowY - 18;

    const summaryGap = 6;
    const bankW = contentWidth * 0.62;
    const totalsW = contentWidth - bankW - summaryGap;
    const summaryTop = y;
    const summaryH = 146;

    drawCard(left, summaryTop - summaryH, bankW, summaryH);
    drawText('Bank Details', left + 12, summaryTop - 20, 12, false, purple);

    const bank = parseBankDetails(invoiceData.bankDetails);
    const bankRows: Array<[string, string]> = [
      ['Account Name', bank.accountName],
      ['Account Number', bank.accountNumber],
      ['IBAN', bank.iban],
      ['Bank', bank.bank],
    ];

    const bankLabelX = left + 12;
    const bankValueX = left + 132;
    const bankValueMaxWidth = bankW - (bankValueX - left) - 12;

    let bankY = summaryTop - 40;
    for (const [label, value] of bankRows) {
      drawText(label, bankLabelX, bankY, 10.5, true);
      drawText(truncateText(value, bankValueMaxWidth, 10.5), bankValueX, bankY, 10.5);
      bankY -= 22;
    }

    const totalsX = left + bankW + summaryGap;
    const totalsRight = totalsX + totalsW;
    let totalsY = summaryTop - 20;
    drawText('Amount', totalsX + 6, totalsY, 11);
    drawRightAligned(`$${NumberFormatter.formatWithCommas(invoiceData.subtotal, 2)}`, totalsRight - 10, totalsY, 11, true);
    totalsY -= 34;
    drawText('TAX', totalsX + 6, totalsY, 11);
    drawRightAligned(`$${NumberFormatter.formatWithCommas(invoiceData.taxAmount, 2)}`, totalsRight - 10, totalsY, 11, true);

    totalsY -= 26;
    page.drawLine({
      start: { x: totalsX, y: totalsY },
      end: { x: totalsRight - 2, y: totalsY },
      thickness: 1,
      color: rgb(0.2, 0.2, 0.2),
    });

    totalsY -= 22;
    drawText(`Total (${invoiceData.currency})`, totalsX + 6, totalsY, 14, true);
    drawRightAligned(
      `$${NumberFormatter.formatWithCommas(invoiceData.totalAmount, 2)}`,
      totalsRight - 10,
      totalsY,
      14,
      true
    );

    if (invoiceData.showAed && typeof invoiceData.aedEquivalent === 'number') {
      totalsY -= 24;
      drawText('Total (AED)', totalsX + 6, totalsY, 11, true, purple);
      drawRightAligned(
        `AED ${NumberFormatter.formatWithCommas(invoiceData.aedEquivalent, 2)}`,
        totalsRight - 10,
        totalsY,
        11,
        true,
        purple
      );
    }

    page.drawLine({
      start: { x: totalsX, y: totalsY - 10 },
      end: { x: totalsRight - 2, y: totalsY - 10 },
      thickness: 1,
      color: rgb(0.2, 0.2, 0.2),
    });

    const signatureImage = decodeDataUrl(invoiceData.company.signature);
    const signatureBottom = 118;
    const signatureX = right - 170;
    if (signatureImage) {
      const sig = signatureImage.isPng
        ? await pdf.embedPng(signatureImage.bytes)
        : await pdf.embedJpg(signatureImage.bytes);
      const maxWidth = 140;
      const maxHeight = 64;
      const ratio = Math.min(maxWidth / sig.width, maxHeight / sig.height);
      const sigW = sig.width * ratio;
      const sigH = sig.height * ratio;
      page.drawImage(sig, {
        x: signatureX,
        y: signatureBottom,
        width: sigW,
        height: sigH,
      });
    }
    drawText('Authorised Signatory', signatureX, signatureBottom - 16, 10);

    if (invoiceData.notes) {
      drawText(`Note: ${invoiceData.notes.slice(0, 120)}`, left, 66, 8.5, false, muted);
    }

    drawText(invoiceData.footerText || 'Thank you for your business!', left, 44, 8.5, false, muted);

    const bytes = await pdf.save();
    return Buffer.from(bytes);
  }
}

export default PDFGenerator;
