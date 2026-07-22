import React, { useState, useRef, useEffect } from 'react';
import { POPULAR_CURRENCIES, CurrencyOption } from '@/core/utils/currency';
import { cn } from '@/shared/utils/cn';
import { Check, ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value = '',
  onChange,
  error,
  placeholder = 'PKR',
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = POPULAR_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearch(newVal);
    onChange(newVal.toUpperCase());
    setIsOpen(true);
  };

  const handleSelectOption = (currency: CurrencyOption) => {
    setSearch(currency.code);
    onChange(currency.code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          id={id}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-8 uppercase font-medium',
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-2.5 text-text-muted hover:text-text-primary"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface shadow-lg focus:outline-none text-sm">
          {filteredCurrencies.length === 0 ? (
            <div className="px-3 py-2 text-text-muted text-xs">
              Custom currency: <span className="font-bold text-text-primary">{search.toUpperCase()}</span>
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = value.toUpperCase() === c.code;
              return (
                <div
                  key={c.code}
                  onClick={() => handleSelectOption(c)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted transition-colors',
                    isSelected && 'bg-accent/10 font-bold text-accent'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{c.code}</span>
                    <span className="text-text-muted text-xs font-semibold">({c.symbol})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};
