'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone, Tag, Briefcase, Loader2 } from 'lucide-react';
import { ContratanteActions } from '@/components/ContratanteActions';
import { type Contratante } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { createContratanteAction, deleteContratanteAction } from '@/lib/actions';
import { Badge } from './ui/badge';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';


const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    responsibleName: z.string().optional(),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.string().optional(),
});

type ContratanteFormValues = z.infer<typeof contratanteFormSchema>;


function NewContratanteForm({ onSave }: { onSave: (newContratante: Contratante) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useState(false);

  const form = useForm<ContratanteFormValues>({
    resolver: zodResolver(contratanteFormSchema),
    defaultValues: { name: '', responsibleName: '', email: '', phone: '', category: '' },
  });

  const onSubmit = async (data: ContratanteFormValues) => {
    startTransition(true);
    const result = await createContratanteAction(data);
    if (result.success && result.data) {
      toast({ title: "Contratante criado com sucesso!" });
      onSave(result.data as Contratante);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: "Erro ao criar o contratante.",
        description: result.message,
      });
    }
    startTransition(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-1 p-6">
            <Card className="border-none shadow-none p-0">
                <CardHeader className="p-0 mb-6"><CardTitle className="font-headline">Novo Contratante</CardTitle></CardHeader>
                <CardContent className="space-y-4 p-0">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nome do Contratante</FormLabel><FormControl><Input placeholder="Nome da empresa, evento ou pessoa" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="responsibleName" render={({ field }) => (
                        <FormItem><FormLabel>Nome do Responsável</FormLabel><FormControl><Input placeholder="Nome de quem te contratou" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Casamento, Corporativo" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contato@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(99) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            </Card>
        </ScrollArea>
        <div className="p-4 border-t">
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="animate-spin" /> : 'Criar Contratante'}
            </Button>
        </div>
      </form>
    </Form>
  );
}

export function ContratantesClientPage({ initialContratantes, deleteAction }: { 
    initialContratantes: Contratante[],
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
            <NewContratanteForm onSave={handleSave}/>
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
                        <Briefcase className="h-5 w-5 text-primary" />
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
                  {contratante.responsibleName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{contratante.responsibleName}</span>
                    </div>
                  )}
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
