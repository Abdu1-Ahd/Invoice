import React, { useEffect, useMemo } from 'react';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { Typography } from '@/shared/components/Typography';
import { DollarSign, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export const ReportsPage: React.FC = () => {
  const { invoices, loadInvoices } = useInvoiceStore();
  const { customers, loadCustomers } = useCustomerStore();

  useEffect(() => {
    loadInvoices();
    loadCustomers();
  }, [loadInvoices, loadCustomers]);

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let outstanding = 0;
    let overdue = 0;
    let draft = 0;

    invoices.forEach(inv => {
      if (inv.status === 'Paid') totalRevenue += inv.totalAmount;
      if (inv.status === 'Sent') outstanding += inv.totalAmount;
      if (inv.status === 'Overdue') overdue += inv.totalAmount;
      if (inv.status === 'Draft') draft += inv.totalAmount;
    });

    return { totalRevenue, outstanding, overdue, draft };
  }, [invoices]);

  const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-sm flex items-center gap-4">
      <div className={cn("p-4 rounded-full", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <Typography variant="caption" className="text-muted-foreground uppercase font-bold tracking-wider">{title}</Typography>
        <Typography variant="h2" className="mt-1">${value.toFixed(2)}</Typography>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <Typography variant="h1">Reports & Overview</Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={metrics.totalRevenue} 
          icon={DollarSign} 
          colorClass="bg-success/20 text-success-foreground" 
        />
        <MetricCard 
          title="Outstanding" 
          value={metrics.outstanding} 
          icon={Clock} 
          colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <MetricCard 
          title="Overdue" 
          value={metrics.overdue} 
          icon={AlertCircle} 
          colorClass="bg-danger/20 text-danger-foreground" 
        />
        <MetricCard 
          title="In Drafts" 
          value={metrics.draft} 
          icon={CheckCircle} 
          colorClass="bg-muted text-muted-foreground" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-sm">
          <Typography variant="h3" className="mb-6">Recent Activity</Typography>
          <div className="space-y-4">
            {invoices.slice(0, 5).map(inv => {
              const customer = customers.find(c => c.id === inv.customerId);
              return (
                <div key={inv.id} className="flex justify-between items-center border-b border-border-subtle pb-4 last:border-0 last:pb-0">
                  <div>
                    <Typography variant="body" className="font-medium">{inv.invoiceNumber}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">{customer?.name || 'Unknown'}</Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-bold">${inv.totalAmount.toFixed(2)}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">{inv.status}</Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col items-center justify-center min-h-[300px]">
           <Typography variant="body" className="text-muted-foreground">More visual charts coming soon.</Typography>
        </div>
      </div>
    </div>
  );
};
