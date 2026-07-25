import Decimal from 'decimal.js';

export class NumberFormatter {
  /**
   * Format a number to a specific decimal places
   */
  static formatDecimal(
    value: number | string | Decimal,
    decimals: number = 2
  ): string {
    const decimal = new Decimal(value);
    return decimal.toFixed(decimals);
  }

  /**
   * Format number with thousands separator
   */
  static formatWithCommas(
    value: number | string | Decimal,
    decimals: number = 2
  ): string {
    const formatted = this.formatDecimal(value, decimals);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /**
   * Format currency amount
   */
  static formatCurrency(
    amount: number | string | Decimal,
    currency: string = 'AED',
    decimals: number = 2
  ): string {
    const formatted = this.formatWithCommas(amount, decimals);
    return `${currency} ${formatted}`;
  }

  /**
   * Format percentage
   */
  static formatPercentage(
    value: number | string | Decimal,
    decimals: number = 2
  ): string {
    const decimal = new Decimal(value);
    return `${decimal.toFixed(decimals)}%`;
  }

  /**
   * Parse currency string to number
   */
  static parseCurrency(value: string): Decimal {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return new Decimal(cleaned);
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date | string, locale: string = 'en-AE'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Generate invoice number with prefix
   */
  static generateInvoiceNumber(prefix: string, sequence: number): string {
    const paddedSeq = String(sequence).padStart(4, '0');
    return `${prefix}-${new Date().getFullYear()}-${paddedSeq}`;
  }
}

export default NumberFormatter;
