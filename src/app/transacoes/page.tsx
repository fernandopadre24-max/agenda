'use server';

import { getEvents, getTransactions } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { TransacoesClientPage } from '@/components/TransacoesClientPage';

export default async function TransacoesPage() {
  const [transactions, events] = await Promise.all([
    getTransactions(),
    getEvents(),
  ]);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Transações" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <TransacoesClientPage
          initialTransactions={transactions}
          initialEvents={events}
        />
      </main>
    </div>
  );
}
