import React, { useEffect, useMemo, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { Clock, AlertCircle, CheckCircle, FileText, Users } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency, getCurrencySymbol, fetchExchangeRates, convertCurrencyAmount, ExchangeRates } from '@/core/utils/currency';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/shared/components/StatusBadge';

export const DashboardPage: React.FC = () => {
  const { invoices, loadInvoices } = useInvoiceStore();
  const { customers, loadCustomers } = useCustomerStore();
  const { settings, loadSettings } = useSettingsStore();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);



  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadSettings();
  }, [loadInvoices, loadCustomers, loadSettings]);

  const currencyCode = settings?.currency || 'PKR';

  // Optimized API execution: only fetch rates if there is at least one invoice in a different currency
  useEffect(() => {
    const foreignCurrencies = new Set<string>();
    invoices.forEach(inv => {
      if (inv.currency && inv.currency !== currencyCode) {
        foreignCurrencies.add(inv.currency);
      }
    });
    foreignCurrencies.add(currencyCode);

    if (foreignCurrencies.size > 1) {
      fetchExchangeRates(Array.from(foreignCurrencies)).then(rates => {
        if (rates) setExchangeRates(rates);
      });
    }
  }, [invoices, currencyCode]);

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let outstanding = 0;
    let overdue = 0;
    let draft = 0;

    invoices.forEach((inv) => {
      const convertedAmount = convertCurrencyAmount(inv.totalAmount, inv.currency || currencyCode, currencyCode, exchangeRates);
      if (inv.status === 'Paid') totalRevenue += convertedAmount;
      if (inv.status === 'Sent') outstanding += convertedAmount;
      if (inv.status === 'Overdue') overdue += convertedAmount;
      if (inv.status === 'Draft') draft += convertedAmount;
    });

    return { totalRevenue, outstanding, overdue, draft };
  }, [invoices, currencyCode, exchangeRates]);

  const MetricCard = ({ title, value, icon: Icon, customIcon, colorClass }: any) => (
    <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-sm flex items-center gap-3.5 min-w-0 w-full overflow-hidden">
      <div className={cn('p-3 sm:p-3.5 rounded-full flex-shrink-0 flex items-center justify-center', colorClass)}>
        {customIcon ? (
          <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-extrabold text-lg sm:text-lg tracking-tight leading-none">
            {customIcon}
          </span>
        ) : (
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-xs block">
          {title}
        </Typography>
        <Typography variant="h2" className="mt-0.5 text-lg sm:text-xl font-bold text-text-primary block">
          {formatCurrency(value, currencyCode)}
        </Typography>
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Typography variant="h1">Dashboard</Typography>
      </div>


      {/* Responsive Financial Cards Grid: 1 on mobile, 2 on tablet & desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          customIcon={getCurrencySymbol(currencyCode)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">        
        {/* Total Invoices & Total Customers Counts */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6 lg:self-start order-1 lg:order-2">
          <Link
            to="/invoices"
            className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between gap-3.5 hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all cursor-pointer group min-w-0"
          >
            <div className="space-y-1 min-w-0 w-full lg:w-auto text-center lg:text-left">
              <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-[11px] sm:text-xs group-hover:text-accent transition-colors block truncate">
                Total Invoices
              </Typography>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-black text-text-primary block truncate">
                {invoices.length}
              </Typography>
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-accent/15 text-accent group-hover:scale-105 transition-transform flex-shrink-0 self-center lg:self-auto">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </Link>

          <Link
            to="/customers"
            className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between gap-3.5 hover:shadow-md hover:border-success/40 hover:-translate-y-0.5 transition-all cursor-pointer group min-w-0"
          >
            <div className="space-y-1 min-w-0 w-full lg:w-auto text-center lg:text-left">
              <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-[11px] sm:text-xs group-hover:text-success transition-colors block truncate">
                Total Customers
              </Typography>
              <Typography variant="h2" className="text-2xl sm:text-3xl font-black text-text-primary block truncate">
                {customers.length}
              </Typography>
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-success/15 text-success group-hover:scale-105 transition-transform flex-shrink-0 self-center lg:self-auto">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </Link>
        </div>

      {/* Recent Invoices & Total Counts (Invoices & Customers) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-sm order-2 lg:order-1">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h3">Recent Invoices</Typography>
            <Link to="/invoices" className="text-xs font-semibold text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                No invoices created yet. Click "Create Invoice" above to get started.
              </p>
            ) : (
              invoices.slice(0, 5).map((inv) => {
                const customer = customers.find((c) => c.id === inv.customerId);
                return (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <Typography variant="body" className="font-medium text-text-primary truncate">
                        {inv.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" className="text-text-muted truncate block">
                        {customer?.name || 'Unknown'}
                      </Typography>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <Typography variant="body" className="font-bold text-text-primary">
                        {formatCurrency(inv.totalAmount, inv.currency || currencyCode)}
                      </Typography>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
