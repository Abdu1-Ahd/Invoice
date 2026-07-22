export interface CurrencyOption {
  code: string;
  symbol: string;
}

export const POPULAR_CURRENCIES: CurrencyOption[] = [
  { code: 'PKR', symbol: 'Rs.' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'AED', symbol: 'AED' },
  { code: 'SAR', symbol: 'SAR' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CNY', symbol: '¥' },
  { code: 'CHF', symbol: 'CHF' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'BDT', symbol: '৳' },
  { code: 'NZD', symbol: 'NZ$' },
  { code: 'ZAR', symbol: 'R' },
  { code: 'TRY', symbol: '₺' },
  { code: 'QAR', symbol: 'QAR' },
  { code: 'KWD', symbol: 'KWD' },
];

export const getCurrencySymbol = (currencyCode: string = 'PKR'): string => {
  if (!currencyCode) return 'Rs.';
  const codeUpper = currencyCode.toUpperCase().trim();
  const match = POPULAR_CURRENCIES.find((c) => c.code === codeUpper);
  if (match) return match.symbol;
  return codeUpper;
};

/**
 * Format numeric amount using currency symbol.
 * Example: formatCurrency(1500, 'PKR') -> "Rs. 1,500.00"
 * Example: formatCurrency(1500, 'USD') -> "$ 1,500.00"
 */
export const formatCurrency = (amount: number, currencyCode: string = 'PKR'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${symbol} ${formatted}`;
};
