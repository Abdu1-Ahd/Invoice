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
  const val = amount || 0;
  const isInteger = Number.isInteger(val);

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);

  return `${symbol} ${formatted}`;
};

export interface ExchangeRates {
  [currencyCode: string]: number;
}

const RATES_CACHE_KEY = 'currencyfreaks_cached_rates_v1';
const RATES_TIMESTAMP_KEY = 'currencyfreaks_cached_timestamp_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24-Hour TTL to significantly reduce API quota usage

let activeFetchPromise: Promise<ExchangeRates | null> | null = null;

/**
 * Fetch exchange rates from CurrencyFreaks API with optimization techniques:
 * 1. 24-Hour localStorage TTL caching.
 * 2. In-flight request deduplication.
 * 3. Offline resilience (fallback to expired cache if network or API errors happen).
 * 4. Selective symbol filtering via requiredCurrencies parameter.
 */
export const fetchExchangeRates = async (requiredCurrencies?: string[]): Promise<ExchangeRates | null> => {
  try {
    const cachedRatesJson = localStorage.getItem(RATES_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
    const now = Date.now();
    let cachedRates: ExchangeRates | null = cachedRatesJson ? JSON.parse(cachedRatesJson) : null;

    // Check if cache is still valid (less than 24 hours old) and contains required currencies
    if (cachedRates && cachedTimestamp && (now - Number(cachedTimestamp) < CACHE_TTL_MS)) {
      const allRequiredPresent = !requiredCurrencies || requiredCurrencies.every(code => cachedRates && cachedRates[code]);
      if (allRequiredPresent) {
        return cachedRates;
      }
    }

    // If an API request is already in-flight, reuse it instead of triggering duplicate requests
    if (activeFetchPromise) {
      return await activeFetchPromise;
    }

    const apiKey = import.meta.env.CURRENCYFREAKS_API || import.meta.env.VITE_CURRENCYFREAKS_API;
    if (!apiKey) {
      console.warn('CurrencyFreaks API key missing from env variables. Using cached fallback.');
      return cachedRates;
    }

    // Prepare symbols filter to reduce payload size and API execution overhead
    const symbolsSet = new Set(['USD', ...(requiredCurrencies || []), ...(cachedRates ? Object.keys(cachedRates) : ['PKR', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SAR', 'AED'])]);
    const symbolsParam = Array.from(symbolsSet).filter(Boolean).join(',');

    activeFetchPromise = (async () => {
      try {
        const response = await fetch(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=${symbolsParam}`);
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();
        if (data && data.rates) {
          const parsedRates: ExchangeRates = { ...cachedRates };
          for (const [code, rateStr] of Object.entries(data.rates)) {
            parsedRates[code.toUpperCase()] = Number(rateStr);
          }
          parsedRates['USD'] = 1.0;

          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(parsedRates));
          localStorage.setItem(RATES_TIMESTAMP_KEY, now.toString());
          return parsedRates;
        }
        return cachedRates;
      } finally {
        activeFetchPromise = null;
      }
    })();

    return await activeFetchPromise;
  } catch (error) {
    console.warn('Failed to fetch exchange rates (offline or quota exceeded). Gracefully falling back to cache:', error);
    const cachedRatesJson = localStorage.getItem(RATES_CACHE_KEY);
    return cachedRatesJson ? JSON.parse(cachedRatesJson) : null;
  }
};

/**
 * Convert numeric amount from source currency to target currency using CurrencyFreaks exchange rates table (USD base).
 */
export const convertCurrencyAmount = (
  amount: number,
  fromCurrency: string = 'PKR',
  toCurrency: string = 'PKR',
  rates: ExchangeRates | null
): number => {
  if (!amount) return 0;
  const fromCode = (fromCurrency || 'PKR').toUpperCase().trim();
  const toCode = (toCurrency || 'PKR').toUpperCase().trim();

  if (fromCode === toCode || !rates) return amount;

  const fromRate = rates[fromCode] || (fromCode === 'USD' ? 1.0 : undefined);
  const toRate = rates[toCode] || (toCode === 'USD' ? 1.0 : undefined);

  if (!fromRate || !toRate) return amount;

  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};
