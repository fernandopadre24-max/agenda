'use server';

import { PageHeader } from '@/components/PageHeader';
import { CalculatorPage } from '@/components/CalculatorPage';

export default async function Calculadora() {

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Calculadora" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <CalculatorPage />
      </main>
    </div>
  );
}
