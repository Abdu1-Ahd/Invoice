import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Invoice } from '@/domain/invoice';
import { Typography } from '@/shared/components/Typography';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { formatCurrency } from '@/core/utils/currency';
import { StatusBadge } from '@/shared/components/StatusBadge';

interface InvoiceListProps {
  invoices: Invoice[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onSelect, isLoading }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { customers } = useCustomerStore();
  const { settings, loadSettings } = useSettingsStore();
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (invoices.length < visibleCount) {
      setVisibleCount(Math.max(20, invoices.length));
    }
  }, [invoices.length]);

  const displayedInvoices = invoices.slice(0, visibleCount);
  const hasMore = displayedInvoices.length < invoices.length;

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Unknown Customer';
  };

  const rowVirtualizer = useVirtualizer({
    count: displayedInvoices.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (index === displayedInvoices.length ? 50 : 80),
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    if (lastItem.index >= displayedInvoices.length - 1 && hasMore) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(invoices.length, prev + 20));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [lastItem?.index, displayedInvoices.length, hasMore, invoices.length]);

  if (invoices.length === 0) {
    if (isLoading) {
      return (
        <div className="max-h-full w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-sm p-2 space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="border-b border-border-subtle p-4 sm:p-5 last:border-0 hover:bg-muted/60 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <Typography variant="body" className="font-semibold text-foreground flex flex-wrap items-center gap-2">
                  <span className="truncate">INV-0000</span>
                  <StatusBadge status="Draft" />
                </Typography>
                <Typography variant="caption" className="text-muted-foreground text-xs">
                  Loading Customer • Due 01/01/2026
                </Typography>
              </div>
              <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
                <Typography variant="body" className="font-bold text-foreground">
                  $0,000.00
                </Typography>
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
          const isLoaderRow = virtualRow.index === displayedInvoices.length;
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
                <span>Loading more invoices...</span>
              </div>
            );
          }

          const invoice = displayedInvoices[virtualRow.index];
          if (!invoice) return null;

          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full cursor-pointer border-b border-border-subtle p-4 sm:p-5 hover:bg-muted/60 hover:scale-[1.005] hover:z-10 hover:shadow-sm transition-all duration-200 ease-out flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 group"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onSelect(invoice.id)}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <Typography variant="body" className="font-semibold text-foreground flex flex-wrap items-center gap-2">
                  <span className="truncate">{invoice.invoiceNumber}</span>
                  <StatusBadge status={invoice.status} />
                </Typography>
                <Typography variant="caption" className="text-muted-foreground text-xs">
                  {getCustomerName(invoice.customerId)} • Due {new Date(invoice.dueDate).toLocaleDateString()}
                </Typography>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <Typography variant="body" className="font-bold text-foreground text-base sm:text-lg">
                  {formatCurrency(invoice.totalAmount, invoice.currency || settings?.currency || 'PKR')}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
