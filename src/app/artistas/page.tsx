import { getArtistas } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Mail, Phone, Music } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default async function ArtistasPage() {
  const artistas = await getArtistas();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Artistas" />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/artistas/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Artista
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {artistas.map(artista => (
            <Card key={artista.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  {artista.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                 {artista.serviceType && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Music className="h-4 w-4" />
                    <span>{artista.serviceType}</span>
                  </div>
                )}
                {artista.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{artista.email}</span>
                  </div>
                )}
                {artista.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{artista.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {artistas.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                <Mic className="mx-auto h-12 w-12" />
                <p className="mt-4">Nenhum artista cadastrado.</p>
            </div>
        )}
      </main>
    </div>
  );
}
