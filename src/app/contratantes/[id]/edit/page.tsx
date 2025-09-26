'use server';

import { getContratanteById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { EditContratanteForm } from './EditContratanteForm';


export default async function EditContratantePage({ params }: { params: { id: string } }) {
  const contratante = await getContratanteById(params.id);
  
  if (!contratante) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Contratante" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <EditContratanteForm contratante={contratante} />
      </main>
    </div>
  );
}
