import type { MockPayment } from '@/__mocks__/types';
import type { Payment } from '@/types/payment';

export function convertMockPaymentToPayment(mock: MockPayment): Payment {
  return {
    id: mock.id,
    reference: `PAY-${mock.id.toUpperCase()}`,
    amount: mock.amount,
    currency: 'EUR',
    date: mock.date,
    dueDate: mock.date, // Même date pour le paiement et l'échéance dans le mock
    status: mock.status === 'completed' ? 'paid' : 
           mock.status === 'pending' ? 'pending' : 'failed',
    propertyId: mock.propertyId,
    propertyName: mock.propertyName,
    tenantId: 'current-tenant-id', // À remplacer par l'ID réel du locataire
    tenantName: 'Locataire', // À remplacer par le nom réel du locataire
    receiptUrl: mock.status === 'completed' ? '/receipts/sample.pdf' : undefined,
    createdAt: mock.date,
    updatedAt: mock.date
  };
}
