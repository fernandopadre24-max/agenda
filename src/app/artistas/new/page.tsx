'use client';

import { ArtistaForm } from '@/components/ArtistaForm';
import { PageHeader } from '@/components/PageHeader';

export default function NewArtistaPage() {
  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Novo Artista" showBackButton={true} />
      <main className="flex-1 p-4 md:p-6">
        <ArtistaForm />
      </main>
    </div>
  );
}
