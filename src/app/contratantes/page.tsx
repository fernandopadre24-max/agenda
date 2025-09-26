'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone } from 'lucide-react';
import { ContratanteActions } from '@/components/ContratanteActions';
import { Contratante } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ContratanteForm } from '@/components/ContratanteForm';
import { getContratantes } from '@/lib/data';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContratantesPage() {
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getContratantes();
      setContratantes(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = (newContratante: Contratante) => {
    setContratantes(prev => [...prev, newContratante].sort((a,b) => a.name.localeCompare(b.name)));
    setIsSheetOpen(false);
  };
  
  const handleDelete = (id: string) => {
    setContratantes(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
       <PageHeader title="Contratantes" />
       <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex justify-end">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Contratante
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0">
              <ContratanteForm onSave={handleSave} />
            </SheetContent>
          </Sheet>
        </div>
        
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : contratantes.length > 0 ? (
          <div className="space-y-4">
            {contratantes.map(contratante => (
              <Card key={contratante.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {contratante.name}
                    </CardTitle>
                    <ContratanteActions contratanteId={contratante.id} onDelete={() => handleDelete(contratante.id)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm pt-0">
                  {contratante.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{contratante.email}</span>
                    </div>
                  )}
                  {contratante.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{contratante.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="mx-auto h-12 w-12" />
            <p className="mt-4">Nenhum contratante cadastrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}