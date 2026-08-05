import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { Customer, CustomerPayload } from '@/domain/customer';
import { triggerInstantSync } from '@/features/sync/utils/syncTrigger';

export class CustomerRepository {
  /**
   * Fetch all active customers.
   */
  static async findAll(): Promise<Customer[]> {
    const all = await db.customers.toArray();
    return all.filter((c: Customer) => c.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Fetch a single customer by ID.
   */
  static async findById(id: string): Promise<Customer | undefined> {
    const customer = await db.customers.get(id);
    if (customer && customer.deletedAt === null) {
      return customer;
    }
    return undefined;
  }

  /**
   * Create a new customer.
   */
  static async create(payload: CustomerPayload): Promise<Customer> {
    const now = Date.now();
    const newCustomer: Customer = {
      ...payload,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.transaction('rw', [db.customers, db.syncQueue], async () => {
      await db.customers.put(newCustomer);
      
      // Add to sync queue
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'customer',
        entityId: newCustomer.id,
        operation: 'CREATE',
        payload: newCustomer,
        status: 'PENDING',
        createdAt: now,
      });
    });

    triggerInstantSync();
    return newCustomer;
  }

  /**
   * Update an existing customer.
   */
  static async update(id: string, payload: Partial<CustomerPayload>): Promise<Customer> {
    const existing = await db.customers.get(id);
    if (!existing || existing.deletedAt !== null) {
      throw new Error('Customer not found');
    }

    const now = Date.now();
    const updatedCustomer: Customer = {
      ...existing,
      ...payload,
      updatedAt: now,
    };

    await db.transaction('rw', [db.customers, db.syncQueue], async () => {
      await db.customers.put(updatedCustomer);

      // Add to sync queue
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'customer',
        entityId: updatedCustomer.id,
        operation: 'UPDATE',
        payload: updatedCustomer,
        status: 'PENDING',
        createdAt: now,
      });
    });

    triggerInstantSync();
    return updatedCustomer;
  }

  /**
   * Soft delete a customer.
   */
  static async delete(id: string): Promise<void> {
    const existing = await db.customers.get(id);
    if (!existing || existing.deletedAt !== null) return;

    const now = Date.now();
    const updatedCustomer: Customer = {
      ...existing,
      deletedAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', [db.customers, db.syncQueue], async () => {
      await db.customers.put(updatedCustomer);

      // Add to sync queue
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'customer',
        entityId: updatedCustomer.id,
        operation: 'DELETE',
        payload: { deletedAt: now, updatedAt: now },
        status: 'PENDING',
        createdAt: now,
      });
    });

    triggerInstantSync();
  }
}
