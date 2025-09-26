'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone, Tag } from 'lucide-react';
import { ContratanteActions } from '@/components/ContratanteActions';
import { type Contratante } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ContratanteForm } from './ContratanteForm';
import { useToast } from '@/hooks/use-toast';
import { createContratanteAction, deleteContratanteAction } from '@/lib/actions';
import { Badge } from './ui/badge';


export function ContratantesClientPage({ initialContratantes, createAction, deleteAction }: { 
    initialContratantes: Contratante[],
    createAction: (data: any) => Promise<any>,
    deleteAction: (id: string) => Promise<any>
}) {
  const [contratantes, setContratantes] = useState(initialContratantes);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = (newContratante: Contratante) => {
    setContratantes(prev => [...prev, newContratante].sort((a,b) => a.name.localeCompare(b.name)));
    setIsSheetOpen(false);
  }

  const handleDelete = async (id: string) => {
    toast({ title: 'Excluindo contratante...' });
    const result = await deleteAction(id);

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
            <ContratanteForm onSave={handleSave} action={createAction}/>
          </SheetContent>
        </Sheet>
      </div>

       {contratantes.length > 0 ? (
          <div className="space-y-4">
            {contratantes.map(contratante => (
              <Card key={contratante.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>{contratante.name}</CardTitle>
                      </div>
                      {contratante.category && (
                        <Badge variant="secondary" className="mt-2 ml-7">
                          <Tag className="mr-1 h-3 w-3" />
                          {contratante.category}
                        </Badge>
                      )}
                    </div>
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
