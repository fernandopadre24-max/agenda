'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone } from 'lucide-react';
import { ContratanteActions } from '@/components/ContratanteActions';
import { type Contratante } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ContratanteForm } from './ContratanteForm';
import { useToast } from '@/hooks/use-toast';
import { deleteContratanteAction } from '@/lib/actions';


export function ContratantesClientPage({ initialContratantes }: { initialContratantes: Contratante[] }) {
  const [contratantes, setContratantes] = useState(initialContratantes);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = (newContratante: Contratante) => {
    setContratantes(prev => [...prev, newContratante].sort((a,b) => a.name.localeCompare(b.name)));
    setIsSheetOpen(false);
  }

  const handleDelete = async (id: string) => {
    toast({ title: 'Excluindo contratante...' });
    const result = await deleteContratanteAction(id);

    if (result.success) {
        toast({ title: 'Contratante excluído com sucesso.' });
        setContratantes(prev => prev.filter(c => c.id !== id));
    } else {
        toast({ variant: 'destructive', title: 'Erro ao excluir contratante.', description: result.message })
    }
  }

  return (
    <>
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

       {contratantes.length > 0 ? (
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
    </>
  );
}
