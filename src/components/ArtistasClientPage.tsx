'use client';
import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Mail, Phone, Music, Loader2 } from 'lucide-react';
import { ArtistaActions } from '@/components/ArtistaActions';
import { type Artista } from '@/lib/types';
import { Sheet, SheetContent } from './ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { createArtistaAction, updateArtistaAction } from '@/lib/actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';
import { SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});

type ArtistaFormValues = z.infer<typeof artistaFormSchema>;

function ArtistaForm({
  onSave,
  onCancel,
  initialData
}: {
  onSave: () => void;
  onCancel: () => void;
  initialData?: Artista;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<ArtistaFormValues>({
    resolver: zodResolver(artistaFormSchema),
    defaultValues: initialData || { name: '', email: '', phone: '', serviceType: '' },
  });
  
  useEffect(() => {
    form.reset(initialData || { name: '', email: '', phone: '', serviceType: '' });
  }, [initialData, form]);

  const onSubmit = (data: ArtistaFormValues) => {
    startTransition(async () => {
      const action = isEditing && initialData
        ? updateArtistaAction(initialData.id, data)
        : createArtistaAction(data);

      const result = await action;

      if (result.success) {
        toast({ title: `Artista ${isEditing ? 'atualizado' : 'criado'} com sucesso!` });
        onSave();
      } else {
        toast({
          variant: 'destructive',
          title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} o artista.`,
          description: result.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="grid h-full grid-rows-[auto,1fr,auto]">
        <SheetHeader>
          <SheetTitle className="font-headline">{isEditing ? 'Editar Artista' : 'Novo Artista'}</SheetTitle>
        </SheetHeader>
        <ScrollArea>
            <div className="space-y-4 px-6 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do artista ou banda" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="serviceType" render={({ field }) => (
                <FormItem><FormLabel>Tipo de Serviço</FormLabel><FormControl><Input placeholder="Ex: Banda, DJ, Músico" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contato@email.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(99) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
        </ScrollArea>
        <SheetFooter>
           <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
           <Button type="submit" disabled={isPending} variant="default">
            {isPending ? <Loader2 className="animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Artista')}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}


export function ArtistasClientPage({ 
    initialArtistas,
 }: { 
    initialArtistas: Artista[];
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingArtista, setEditingArtista] = useState<Artista | undefined>(undefined);
  const router = useRouter();

  const handleSaveSuccess = () => {
    setIsSheetOpen(false);
    setEditingArtista(undefined);
    router.refresh();
  };

  const handleEdit = (artista: Artista) => {
    setEditingArtista(artista);
    setIsSheetOpen(true);
  }

  const handleAddNew = () => {
    setEditingArtista(undefined);
    setIsSheetOpen(true);
  }

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
        setEditingArtista(undefined);
    }
    setIsSheetOpen(open);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleAddNew} variant="default">
            <Plus className="mr-2 h-4 w-4" /> Novo Artista
        </Button>
      </div>

       {initialArtistas.length > 0 ? (
        <div className="space-y-4 mt-4">
          {initialArtistas.map(artista => (
            <Card key={artista.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    {artista.name}
                  </CardTitle>
                  <ArtistaActions 
                    artistaId={artista.id}
                    onEdit={() => handleEdit(artista)} 
                  />
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
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Mic className="mx-auto h-12 w-12" />
          <p className="mt-4">Nenhum artista cadastrado.</p>
           <Button onClick={handleAddNew} className="mt-4" variant="default">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Artista
          </Button>
        </div>
      )}
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
          <SheetContent>
              <ArtistaForm 
                  onSave={handleSaveSuccess} 
                  onCancel={() => handleCloseSheet(false)} 
                  initialData={editingArtista}
              />
          </SheetContent>
        </Sheet>
    </>
  );
}
