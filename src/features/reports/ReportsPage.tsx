import React, { useEffect, useMemo } from 'react';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { Typography } from '@/shared/components/Typography';
import { DollarSign, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/core/utils/currency';

export const ReportsPage: React.FC = () => {
  const { invoices, loadInvoices } = useInvoiceStore();
  const { customers, loadCustomers } = useCustomerStore();
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadSettings();
  }, [loadInvoices, loadCustomers, loadSettings]);

  const currencyCode = settings?.currency || 'PKR';

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let outstanding = 0;
    let overdue = 0;
    let draft = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'Paid') totalRevenue += inv.totalAmount;
      if (inv.status === 'Sent') outstanding += inv.totalAmount;
      if (inv.status === 'Overdue') overdue += inv.totalAmount;
      if (inv.status === 'Draft') draft += inv.totalAmount;
    });

    return { totalRevenue, outstanding, overdue, draft };
  }, [invoices]);

  const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-sm flex items-center gap-3.5 min-w-0 w-full overflow-hidden">
      <div className={cn('p-3 sm:p-3.5 rounded-full flex-shrink-0', colorClass)}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-xs truncate block">
          {title}
        </Typography>
        <Typography variant="h2" className="mt-0.5 text-lg sm:text-xl font-bold text-text-primary truncate block">
          {formatCurrency(value, currencyCode)}
        </Typography>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <Typography variant="h1">Reports & Overview</Typography>

      {/* Responsive Cards Grid: 1 on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          icon={DollarSign}
          colorClass="bg-success/15 text-success"
        />
        <MetricCard
          title="Outstanding"
          value={metrics.outstanding}
          icon={Clock}
          colorClass="bg-info/15 text-info"
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdue}
          icon={AlertCircle}
          colorClass="bg-danger/15 text-danger"
        />
        <MetricCard
          title="In Drafts"
          value={metrics.draft}
          icon={CheckCircle}
          colorClass="bg-muted text-text-muted"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <Typography variant="h3" className="mb-6">
            Recent Activity
          </Typography>
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">No invoices created yet.</p>
            ) : (
              invoices.slice(0, 5).map((inv) => {
                const customer = customers.find((c) => c.id === inv.customerId);
                return (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <Typography variant="body" className="font-medium text-text-primary">
                        {inv.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" className="text-text-muted">
                        {customer?.name || 'Unknown'}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="body" className="font-bold text-text-primary">
                        {formatCurrency(inv.totalAmount, inv.currency || currencyCode)}
                      </Typography>
                      <Typography variant="caption" className="text-text-muted">
                        {inv.status}
                      </Typography>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[250px]">
          <Typography variant="body" className="text-text-muted">
            More visual charts coming soon.
          </Typography>
        </div>
      </div>
    </div>
  );
};
