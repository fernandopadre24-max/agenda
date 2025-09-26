'use server';

import { ContratanteForm } from '@/components/ContratanteForm';
import { getContratanteById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { type Contratante } from '@/lib/types';

export default async function EditContratantePage({ params }: { params: { id: string } }) {
  const contratante = await getContratanteById(params.id);
  
  if (!contratante) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Contratante" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <ContratanteForm contratante={contratante as Contratante} />
      </main>
    </div>
  );
}
