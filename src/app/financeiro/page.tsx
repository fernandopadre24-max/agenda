'use server';

import { getTransactions, getEvents } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { FinanceiroClientPage } from '@/components/FinanceiroClientPage';
import { Transaction } from '@/lib/types';

export default async function FinanceiroPage() {
  const manualTransactions = await getTransactions();
  const events = await getEvents();

  const eventTransactions: Transaction[] = events.flatMap(event => {
    const transactions: Transaction[] = [];
    if (event.receber) {
      transactions.push({
        id: `evt-${event.id}-r`,
        description: `Evento: ${event.artista} - ${event.contratante}`,
        value: event.receber.valor,
        type: 'receber',
        status: event.receber.status === 'recebido' ? 'concluido' : 'pendente',
        date: event.date,
      });
    }
    if (event.pagar) {
      transactions.push({
        id: `evt-${event.id}-p`,
        description: `Evento: ${event.artista} - ${event.contratante}`,
        value: event.pagar.valor,
        type: 'pagar',
        status: event.pagar.status === 'pago' ? 'concluido' : 'pendente',
        date: event.date,
      });
    }
    return transactions;
  });

  const allTransactions = [...manualTransactions, ...eventTransactions];

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Resumo Financeiro" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FinanceiroClientPage initialTransactions={allTransactions} />
      </main>
    </div>
  );
}
