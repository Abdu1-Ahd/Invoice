import React, { useEffect, useMemo } from 'react';
import { Typography } from '@/shared/components/Typography';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { DollarSign, Clock, AlertCircle, CheckCircle, FileText, Users, Plus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/core/utils/currency';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">Dashboard</Typography>
          <Typography variant="body" className="text-text-muted mt-1">
            Welcome back! Here is a summary of your invoicing activity.
          </Typography>
        </div>
        <div className="flex gap-3">
          <Link
            to="/invoices"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Responsive Financial Cards Grid: 1 on mobile, 2 on tablet, 4 on desktop */}
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

      {/* Recent Invoices & Total Counts (Invoices & Customers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-sm">
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
                    <div className="text-right flex-shrink-0">
                      <Typography variant="body" className="font-bold text-text-primary">
                        {formatCurrency(inv.totalAmount, inv.currency || currencyCode)}
                      </Typography>
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-text-muted">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Total Invoices & Total Customers Counts */}
        <div className="space-y-4">
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-xs">
                Total Invoices
              </Typography>
              <Typography variant="h2" className="text-3xl font-black text-text-primary">
                {invoices.length}
              </Typography>
            </div>
            <div className="p-4 rounded-full bg-accent/15 text-accent">
              <FileText className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-xs">
                Total Customers
              </Typography>
              <Typography variant="h2" className="text-3xl font-black text-text-primary">
                {customers.length}
              </Typography>
            </div>
            <div className="p-4 rounded-full bg-success/15 text-success">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
