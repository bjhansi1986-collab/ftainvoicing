import Decimal from 'decimal.js';

/**
 * UAE VAT Compliance Utility
 * Standard VAT Rate: 5%
 * Effective Date: January 1, 2018
 */
export class VATCalculator {
  // Standard UAE VAT rate
  static readonly STANDARD_RATE = new Decimal('5');

  /**
   * Calculate VAT amount on a subtotal
   */
  static calculateVAT(
    subtotal: number | string | Decimal,
    vatRate: number | string | Decimal = this.STANDARD_RATE
  ): Decimal {
    const amount = new Decimal(subtotal);
    const rate = new Decimal(vatRate).dividedBy(100);
    return amount.times(rate);
  }

  /**
   * Calculate total including VAT
   */
  static calculateTotal(
    subtotal: number | string | Decimal,
    vatRate: number | string | Decimal = this.STANDARD_RATE
  ): Decimal {
    const amount = new Decimal(subtotal);
    const vat = this.calculateVAT(amount, vatRate);
    return amount.plus(vat);
  }

  /**
   * Extract VAT from a total (reverse calculation)
   */
  static extractVAT(
    total: number | string | Decimal,
    vatRate: number | string | Decimal = this.STANDARD_RATE
  ): { subtotal: Decimal; vat: Decimal } {
    const totalAmount = new Decimal(total);
    const rate = new Decimal(vatRate);
    const multiplier = new Decimal(100).plus(rate);

    const subtotal = totalAmount.times(100).dividedBy(multiplier);
    const vat = totalAmount.minus(subtotal);

    return { subtotal, vat };
  }

  /**
   * Format VAT rate
   */
  static formatRate(rate: number | string | Decimal): string {
    return `${rate}%`;
  }

  /**
   * Check if item is VAT exempt (for future use)
   */
  static isExempt(itemType: string): boolean {
    // List of VAT exempt items/services in UAE
    const exemptItems = [
      'health_services',
      'education',
      'financial_services',
      'insurance',
      'real_estate_rental',
    ];
    return exemptItems.includes(itemType.toLowerCase());
  }

  /**
   * Get VAT compliance text for UAE invoices
   */
  static getComplianceText(): string {
    return 'VAT Registration Number: [ENTER YOUR VAT REG NUMBER]\nVAT Invoice as per UAE VAT Law';
  }
}

export default VATCalculator;
