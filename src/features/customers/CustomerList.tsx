import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Customer } from '@/domain/customer';
import { Typography } from '@/shared/components/Typography';

interface CustomerListProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelect }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated height of each row
    overscan: 5,
  });

  if (customers.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] w-full overflow-auto rounded-xl border border-border-subtle bg-surface shadow-sm"
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const customer = customers[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full cursor-pointer border-b border-border-subtle p-4 hover:bg-muted transition-colors"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onSelect(customer)}
            >
              <div className="flex flex-col">
                <Typography variant="body" className="font-medium text-foreground">
                  {customer.name}
                </Typography>
                {customer.email && (
                  <Typography variant="caption" className="text-muted-foreground">
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
