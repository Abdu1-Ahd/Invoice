import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Customer, CustomerPayload } from '@/domain/customer';

export class CustomerRepository {
  /**
   * Fetch all active customers.
   */
  static async findAll(): Promise<Customer[]> {
    const db = await getDB();
    const all = await db.getAll('customers');
    return all.filter((c: Customer) => c.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Fetch a single customer by ID.
   */
  static async findById(id: string): Promise<Customer | undefined> {
    const db = await getDB();
    const customer = await db.get('customers', id);
    if (customer && customer.deletedAt === null) {
      return customer;
    }
    return undefined;
  }

  /**
   * Create a new customer.
   */
  static async create(payload: CustomerPayload): Promise<Customer> {
    const db = await getDB();
    const now = Date.now();
    const newCustomer: Customer = {
      ...payload,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const tx = db.transaction(['customers', 'syncQueue'], 'readwrite');
    await tx.objectStore('customers').add(newCustomer);
    
    // Add to sync queue
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'customer',
      entityId: newCustomer.id,
      operation: 'CREATE',
      payload: newCustomer,
      status: 'PENDING',
      createdAt: now,
    });

    await tx.done;
    return newCustomer;
  }

  /**
   * Update an existing customer.
   */
  static async update(id: string, payload: Partial<CustomerPayload>): Promise<Customer> {
    const db = await getDB();
    const existing = await db.get('customers', id);
    if (!existing || existing.deletedAt !== null) {
      throw new Error('Customer not found');
    }

    const now = Date.now();
    const updatedCustomer: Customer = {
      ...existing,
      ...payload,
      updatedAt: now,
    };

    const tx = db.transaction(['customers', 'syncQueue'], 'readwrite');
    await tx.objectStore('customers').put(updatedCustomer);

    // Add to sync queue
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'customer',
      entityId: updatedCustomer.id,
      operation: 'UPDATE',
      payload: updatedCustomer,
      status: 'PENDING',
      createdAt: now,
    });

    await tx.done;
    return updatedCustomer;
  }

  /**
   * Soft delete a customer.
   */
  static async delete(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('customers', id);
    if (!existing || existing.deletedAt !== null) return;

    const now = Date.now();
    const updatedCustomer: Customer = {
      ...existing,
      deletedAt: now,
      updatedAt: now,
    };

    const tx = db.transaction(['customers', 'syncQueue'], 'readwrite');
    await tx.objectStore('customers').put(updatedCustomer);

    // Add to sync queue
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'customer',
      entityId: updatedCustomer.id,
      operation: 'DELETE',
      payload: { deletedAt: now },
      status: 'PENDING',
      createdAt: now,
    });

    await tx.done;
  }
}
