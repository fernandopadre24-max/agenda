'use client';

import { ContratanteForm } from '@/components/ContratanteForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewContratantePage() {
  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Contratante" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        <ContratanteForm />
      </main>
    </div>
  );
}
