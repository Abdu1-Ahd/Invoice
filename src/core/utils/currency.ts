/**
 * Centralized utility for formatting currency across the application.
 * Never hardcode currency symbols.
 * 
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., 'PKR', 'USD', 'EUR')
 * @returns The formatted string (e.g., 'PKR 1,500.00' or '$1,500.00')
 */
export const formatCurrency = (amount: number, currencyCode: string = 'PKR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
