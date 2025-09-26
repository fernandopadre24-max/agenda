'use server';

import { ArtistaForm } from '@/components/ArtistaForm';
import { getArtistaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { type Artista } from '@/lib/types';
import { updateArtistaAction } from '@/lib/actions';

export default async function EditArtistaPage({ params }: { params: { id: string } }) {
  const artista = await getArtistaById(params.id);

  if (!artista) {
    notFound();
  }

  const action = updateArtistaAction.bind(null, artista.id);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Editar Artista" showBackButton={true}/>
      <main className="flex-1 p-4 md:p-6">
        <ArtistaForm artista={artista as Artista} action={action} />
      </main>
    </div>
  );
}
