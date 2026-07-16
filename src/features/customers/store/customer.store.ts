import { create } from 'zustand';
import { Customer, CustomerPayload } from '@/domain/customer';
import { CustomerRepository } from '@/core/storage/customer.repository';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCustomers: () => Promise<void>;
  createCustomer: (payload: CustomerPayload) => Promise<Customer>;
  updateCustomer: (id: string, payload: Partial<CustomerPayload>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  loadCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const customers = await CustomerRepository.findAll();
      set({ customers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createCustomer: async (payload: CustomerPayload) => {
    try {
      const newCustomer = await CustomerRepository.create(payload);
      set((state) => ({
        customers: [newCustomer, ...state.customers],
      }));
      return newCustomer;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCustomer: async (id: string, payload: Partial<CustomerPayload>) => {
    try {
      const updatedCustomer = await CustomerRepository.update(id, payload);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updatedCustomer : c)),
      }));
      return updatedCustomer;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      await CustomerRepository.delete(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
