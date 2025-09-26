'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Mail, Phone, Music } from 'lucide-react';
import { ArtistaActions } from '@/components/ArtistaActions';
import { Artista } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ArtistaForm } from './ArtistaForm';

export function ArtistasClientPage({ initialArtistas }: { initialArtistas: Artista[] }) {
  const [artistas, setArtistas] = useState(initialArtistas);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSave = (newArtista?: Artista) => {
    if (newArtista) {
        setArtistas(prev => [...prev, newArtista])
    }
    setIsSheetOpen(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Artista
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0">
             <ArtistaForm onSave={handleSave} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {artistas.map(artista => (
          <Card key={artista.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      {artista.name}
                  </CardTitle>
                  <ArtistaActions artistaId={artista.id} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm pt-0">
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
    </>
  );
}
