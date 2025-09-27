
'use client';
import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone, Tag, Briefcase, Loader2 } from 'lucide-react';
import { ContratanteActions } from '@/components/ContratanteActions';
import { type Contratante } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { createContratanteAction, updateContratanteAction } from '@/lib/actions';
import { Badge } from './ui/badge';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';


const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    responsibleName: z.string().optional(),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.string().optional(),
});

type ContratanteFormValues = z.infer<typeof contratanteFormSchema>;


function ContratanteForm({ 
    onSave,
    onCancel,
    initialData,
}: { 
    onSave: () => void,
    onCancel: () => void,
    initialData?: Contratante,
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<ContratanteFormValues>({
    resolver: zodResolver(contratanteFormSchema),
    defaultValues: initialData || { name: '', responsibleName: '', email: '', phone: '', category: '' },
  });

  useEffect(() => {
    form.reset(initialData || { name: '', responsibleName: '', email: '', phone: '', category: '' });
  }, [initialData, form]);

  const onSubmit = async (data: ContratanteFormValues) => {
    startTransition(async () => {
      const action = isEditing && initialData
        ? updateContratanteAction(initialData.id, data)
        : createContratanteAction(data);
      
      const result = await action;

      if (result.success && result.data) {
        toast({ title: `Contratante ${isEditing ? 'atualizado' : 'criado'} com sucesso!` });
        onSave();
      } else {
        toast({
          variant: 'destructive',
          title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} o contratante.`,
          description: result.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
         <SheetHeader className="p-6">
            <SheetTitle className="font-headline">{isEditing ? 'Editar Contratante' : 'Novo Contratante'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pr-1">
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
            </div>
        </ScrollArea>
        <div className="p-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Contratante')}
            </Button>
        </div>
      </form>
    </Form>
  );
}

export function ContratantesClientPage({ initialContratantes, deleteContratanteAction }: { 
    initialContratantes: Contratante[],
    deleteContratanteAction: (id: string) => Promise<any>
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingContratante, setEditingContratante] = useState<Contratante | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();


  const handleSaveSuccess = () => {
    setIsSheetOpen(false);
    setEditingContratante(undefined);
    router.refresh();
  }

  const handleDelete = async (id: string) => {
    startDeleteTransition(async () => {
        toast({ title: 'Excluindo contratante...' });
        const result = await deleteContratanteAction(id);

        if (result.success) {
            toast({ title: 'Contratante excluído com sucesso.' });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao excluir contratante.', description: result.message })
        }
    });
  }

  const handleEdit = (contratante: Contratante) => {
    setEditingContratante(contratante);
    setIsSheetOpen(true);
  }

  const handleAddNew = () => {
    setEditingContratante(undefined);
    setIsSheetOpen(true);
  }
  
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingContratante(undefined);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Contratante
        </Button>
      </div>

       {initialContratantes.length > 0 ? (
          <div className="space-y-4">
            {initialContratantes.map(contratante => (
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
                    <ContratanteActions 
                        onEdit={() => handleEdit(contratante)} 
                        onDelete={() => handleDelete(contratante.id)}
                        isDeleting={isDeleting}
                    />
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
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Contratante
            </Button>
          </div>
        )}
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="p-0" onOpenChange={ (open) => { if(!open) handleCloseSheet() }}>
            <ContratanteForm 
                onSave={handleSaveSuccess} 
                onCancel={handleCloseSheet}
                initialData={editingContratante}
            />
          </SheetContent>
        </Sheet>
    </>
  );
}
