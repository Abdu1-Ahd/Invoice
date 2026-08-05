import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Customer } from '@/domain/customer';
import { Typography } from '@/shared/components/Typography';

interface CustomerListProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  isLoading?: boolean;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelect, isLoading }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (customers.length < visibleCount) {
      setVisibleCount(Math.max(20, customers.length));
    }
  }, [customers.length]);

  const displayedCustomers = customers.slice(0, visibleCount);
  const hasMore = displayedCustomers.length < customers.length;

  const rowVirtualizer = useVirtualizer({
    count: displayedCustomers.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (index === displayedCustomers.length ? 50 : 72),
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    if (lastItem.index >= displayedCustomers.length - 1 && hasMore) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(customers.length, prev + 20));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [lastItem?.index, displayedCustomers.length, hasMore, customers.length]);

  if (customers.length === 0) {
    if (isLoading) {
      return (
        <div className="max-h-full w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-sm p-2 space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="border-b border-border-subtle p-4 sm:p-5 last:border-0">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-3 w-64 bg-muted/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="max-h-full w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-sm"
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index === displayedCustomers.length;
          if (isLoaderRow) {
            return (
              <div
                key="loader"
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="absolute top-0 left-0 w-full p-3 text-center text-xs font-semibold text-text-muted animate-pulse flex items-center justify-center gap-2 border-t border-border"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <span>Loading more customers...</span>
              </div>
            );
          }

          const customer = displayedCustomers[virtualRow.index];
          if (!customer) return null;

          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full cursor-pointer border-b border-border-subtle p-4 sm:p-5 hover:bg-muted/60 transition-colors"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onSelect(customer)}
            >
              <div className="flex flex-col gap-1">
                <Typography variant="body" className="font-semibold text-foreground text-base">
                  {customer.name}
                </Typography>
                {customer.email && (
                  <Typography variant="caption" className="text-muted-foreground text-xs">
                    {customer.email}
                  </Typography>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
