'use server';

import { getTransactions } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { FinanceiroClientPage } from '@/components/FinanceiroClientPage';

export default async function FinanceiroPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Financeiro" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FinanceiroClientPage initialTransactions={transactions} />
      </main>
    </div>
  );
}
