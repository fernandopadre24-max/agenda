'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Mail, Phone, Music, Loader2 } from 'lucide-react';
import { ArtistaActions } from '@/components/ArtistaActions';
import { type Artista } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { createArtistaAction, deleteArtistaAction } from '@/lib/actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});

type ArtistaFormValues = z.infer<typeof artistaFormSchema>;

function NewArtistaForm({ onSave }: { onSave: (newArtista: Artista) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useState(false);

  const form = useForm<ArtistaFormValues>({
    resolver: zodResolver(artistaFormSchema),
    defaultValues: { name: '', email: '', phone: '', serviceType: '' },
  });

  const onSubmit = (data: ArtistaFormValues) => {
    startTransition(true);
    createArtistaAction(data).then(result => {
      if (result.success && result.data) {
        toast({ title: "Artista criado com sucesso!" });
        onSave(result.data as Artista);
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: "Erro ao criar o artista.",
          description: result.message,
        });
      }
      startTransition(false);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="flex-1 p-6">
          <Card className="border-none shadow-none p-0">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="font-headline">Novo Artista</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
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
            </CardContent>
          </Card>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="animate-spin" /> : 'Criar Artista'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


export function ArtistasClientPage({ initialArtistas }: { initialArtistas: Artista[] }) {
  const [artistas, setArtistas] = useState(initialArtistas);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = (newArtista: Artista) => {
    setArtistas(prev => [...prev, newArtista].sort((a, b) => a.name.localeCompare(b.name)));
    setIsSheetOpen(false);
  };

  const handleDelete = async (id: string) => {
    toast({ title: 'Excluindo artista...' });
    const result = await deleteArtistaAction(id);
    if (result.success) {
      toast({ title: 'Artista excluído com sucesso.' });
      setArtistas(prev => prev.filter(a => a.id !== id));
    } else {
      toast({ variant: 'destructive', title: 'Erro ao excluir artista.', description: result.message });
    }
  };

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
             <NewArtistaForm onSave={handleSave} />
          </SheetContent>
        </Sheet>
      </div>

       {artistas.length > 0 ? (
        <div className="space-y-4">
          {artistas.map(artista => (
            <Card key={artista.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    {artista.name}
                  </CardTitle>
                  <ArtistaActions artistaId={artista.id} onDelete={() => handleDelete(artista.id)} />
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
        </div>
      )}
    </>
  );
}
