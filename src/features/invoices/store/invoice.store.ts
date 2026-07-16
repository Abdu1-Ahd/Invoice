import { create } from 'zustand';
import { Invoice, InvoiceItem, FullInvoicePayload } from '@/domain/invoice';
import { InvoiceRepository } from '@/core/storage/invoice.repository';

interface InvoiceState {
  invoices: Invoice[];
  activeInvoice: { invoice: Invoice; items: InvoiceItem[] } | null;
  isLoading: boolean;
  error: string | null;
  
  loadInvoices: () => Promise<void>;
  loadInvoice: (id: string) => Promise<void>;
  createInvoice: (payload: FullInvoicePayload) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  activeInvoice: null,
  isLoading: false,
  error: null,

  loadInvoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await InvoiceRepository.findAll();
      set({ invoices, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await InvoiceRepository.findFullById(id);
      set({ activeInvoice: data || null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createInvoice: async (payload: FullInvoicePayload) => {
    try {
      const newInvoice = await InvoiceRepository.create(payload);
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
      }));
      return newInvoice;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateInvoiceStatus: async (id: string, status: Invoice['status']) => {
    try {
      await InvoiceRepository.updateStatus(id, status);
      set((state) => ({
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status, updatedAt: Date.now() } : inv),
        activeInvoice: state.activeInvoice?.invoice.id === id 
          ? { ...state.activeInvoice, invoice: { ...state.activeInvoice.invoice, status, updatedAt: Date.now() } }
          : state.activeInvoice
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    try {
      await InvoiceRepository.delete(id);
      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id),
        activeInvoice: state.activeInvoice?.invoice.id === id ? null : state.activeInvoice,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
