import { getArtistas } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { ArtistasClientPage } from '@/components/ArtistasClientPage';

export const dynamic = 'force-dynamic';

export default async function ArtistasPage() {
  const artistas = await getArtistas();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Artistas" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <ArtistasClientPage initialArtistas={artistas} />
      </main>
    </div>
  );
}
