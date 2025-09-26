import { getContratantes } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { ContratantesClientPage } from '@/components/ContratantesClientPage';

export const dynamic = 'force-dynamic';

export default async function ContratantesPage() {
  const contratantes = await getContratantes();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Contratantes" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <ContratantesClientPage initialContratantes={contratantes} />
      </main>
    </div>
  );
}
