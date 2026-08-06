import { useEffect, useState } from 'react';

export type StatusPrototypeId = 'proto1' | 'proto2' | 'proto3' | 'proto4' | 'proto5';

export interface PrototypeInfo {
  id: StatusPrototypeId;
  name: string;
  shortLabel: string;
  description: string;
  styles: Record<string, string>;
}

export const STATUS_PROTOTYPES: Record<StatusPrototypeId, PrototypeInfo> = {
  proto1: {
    id: 'proto1',
    name: 'Prototype 1: Soft Executive Pastel',
    shortLabel: '1. Soft Pastel',
    description: 'High-contrast pastel pill fills with deep ink text color (Stripe style)',
    styles: {
      Draft: 'bg-[#F1F5F9] text-[#334155]',
      Sent: 'bg-[#E0E7FF] text-[#3730A3]',
      Paid: 'bg-[#DCFCE7] text-[#166534]',
      Overdue: 'bg-[#FEE2E2] text-[#991B1B]',
    },
  },
  proto2: {
    id: 'proto2',
    name: 'Prototype 2: Antique Warm Parchment',
    shortLabel: '2. Antique Parchment',
    description: 'Warm earth & organic tones matching the parchment design system',
    styles: {
      Draft: 'bg-[#E6DFCF] text-[#3A3428]',
      Sent: 'bg-[#D0E5E4] text-[#134E4A]',
      Paid: 'bg-[#D2E7D6] text-[#1B4D24]',
      Overdue: 'bg-[#F9D8D6] text-[#881337]',
    },
  },
  proto3: {
    id: 'proto3',
    name: 'Prototype 3: Solid Bold Pills',
    shortLabel: '3. Solid Bold',
    description: 'Vibrant solid badge fills with pure white text for high impact',
    styles: {
      Draft: 'bg-[#64748B] text-white',
      Sent: 'bg-[#2563EB] text-white',
      Paid: 'bg-[#10B981] text-white',
      Overdue: 'bg-[#EF4444] text-white',
    },
  },
  proto4: {
    id: 'proto4',
    name: 'Prototype 4: Refined Outlined',
    shortLabel: '4. Outlined',
    description: 'Subtle light tint fill with matching border and dark crisp text',
    styles: {
      Draft: 'bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1]',
      Sent: 'bg-[#EFF6FF] text-[#1E40AF] border border-[#93C5FD]',
      Paid: 'bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]',
      Overdue: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]',
    },
  },
  proto5: {
    id: 'proto5',
    name: 'Prototype 5: Executive Deep Jewel',
    shortLabel: '5. Deep Jewel',
    description: 'Dark rich jewel tones with bright high-luminance text',
    styles: {
      Draft: 'bg-[#334155] text-[#F8FAFC]',
      Sent: 'bg-[#1E3A8A] text-[#DBEAFE]',
      Paid: 'bg-[#064E3B] text-[#D1FAE5]',
      Overdue: 'bg-[#881337] text-[#FFE4E6]',
    },
  },
};

const STORAGE_KEY = 'ledgerly_status_prototype_id';
const EVENT_KEY = 'status_prototype_change';

export function getSelectedPrototypeId(): StatusPrototypeId {
  const saved = localStorage.getItem(STORAGE_KEY) as StatusPrototypeId | null;
  return saved && STATUS_PROTOTYPES[saved] ? saved : 'proto2';
}

export function setSelectedPrototypeId(id: StatusPrototypeId) {
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: id }));
}

export function useStatusPrototype() {
  const [activeId, setActiveId] = useState<StatusPrototypeId>(getSelectedPrototypeId());

  useEffect(() => {
    const handleStorage = (e: Event) => {
      const customEvent = e as CustomEvent<StatusPrototypeId>;
      if (customEvent.detail && STATUS_PROTOTYPES[customEvent.detail]) {
        setActiveId(customEvent.detail);
      } else {
        setActiveId(getSelectedPrototypeId());
      }
    };

    window.addEventListener(EVENT_KEY, handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_KEY, handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    activeId,
    prototype: STATUS_PROTOTYPES[activeId],
    setPrototype: setSelectedPrototypeId,
    allPrototypes: Object.values(STATUS_PROTOTYPES),
  };
}
