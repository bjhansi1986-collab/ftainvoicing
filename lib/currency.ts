import Decimal from 'decimal.js';

// Exchange rates (in production, fetch from an API)
const EXCHANGE_RATES: { [key: string]: number } = {
  AED: 1.0,
  USD: 0.27, // 1 AED = 0.27 USD
  EUR: 0.25,
  GBP: 0.21,
};

export class CurrencyConverter {
  /**
   * Convert amount from one currency to another
   */
  static convert(
    amount: number | string,
    fromCurrency: string,
    toCurrency: string
  ): Decimal {
    if (fromCurrency === toCurrency) {
      return new Decimal(amount);
    }

    const amountInAED = new Decimal(amount).dividedBy(
      EXCHANGE_RATES[fromCurrency] || 1
    );
    const convertedAmount = amountInAED.times(EXCHANGE_RATES[toCurrency] || 1);

    return convertedAmount;
  }

  /**
   * Get exchange rate between two currencies
   */
  static getRate(fromCurrency: string, toCurrency: string): Decimal {
    if (fromCurrency === toCurrency) {
      return new Decimal(1);
    }

    const rate =
      (EXCHANGE_RATES[toCurrency] || 1) / (EXCHANGE_RATES[fromCurrency] || 1);
    return new Decimal(rate);
  }

  /**
   * Format currency for display
   */
  static format(
    amount: number | string | Decimal,
    currency: string,
    decimals = 2
  ): string {
    const decimal = new Decimal(amount);
    const formatted = decimal.toFixed(decimals);
    const currencySymbols: { [key: string]: string } = {
      AED: 'د.إ',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${formatted}`;
  }
}

export default CurrencyConverter;
