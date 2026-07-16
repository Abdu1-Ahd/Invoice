import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Invoice } from '@/domain/invoice';
import { Typography } from '@/shared/components/Typography';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { cn } from '@/shared/utils/cn';

interface InvoiceListProps {
  invoices: Invoice[];
  onSelect: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onSelect }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { customers } = useCustomerStore();

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Unknown Customer';
  };

  const rowVirtualizer = useVirtualizer({
    count: invoices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, 
    overscan: 5,
  });

  if (invoices.length === 0) {
    return null;
  }

  const statusColors = {
    Draft: 'bg-muted text-muted-foreground',
    Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Paid: 'bg-success/20 text-success-foreground',
    Overdue: 'bg-danger/20 text-danger-foreground'
  };

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
          const invoice = invoices[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full cursor-pointer border-b border-border-subtle p-4 hover:bg-muted transition-colors flex justify-between items-center"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onSelect(invoice.id)}
            >
              <div className="flex flex-col">
                <Typography variant="body" className="font-medium text-foreground flex items-center gap-2">
                  {invoice.invoiceNumber}
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider", statusColors[invoice.status])}>
                    {invoice.status}
                  </span>
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  {getCustomerName(invoice.customerId)} • Due {new Date(invoice.dueDate).toLocaleDateString()}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="body" className="font-bold text-foreground">
                  ${invoice.totalAmount.toFixed(2)}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
