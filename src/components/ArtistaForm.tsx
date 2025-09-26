'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { createArtistaAction, updateArtistaAction } from '@/lib/actions';
import { type Artista } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});

type ArtistaFormValues = z.infer<typeof artistaFormSchema>;


export function ArtistaForm({ artista, onSave }: { artista?: Artista; onSave?: (newArtista: Artista) => void }) {
  const isEditing = !!artista;
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ArtistaFormValues>({
    resolver: zodResolver(artistaFormSchema),
    defaultValues: {
      name: artista?.name ?? '',
      email: artista?.email ?? '',
      phone: artista?.phone ?? '',
      serviceType: artista?.serviceType ?? '',
    },
  });

  const onSubmit = (data: ArtistaFormValues) => {
    startTransition(async () => {
        if (isEditing) {
          const result = await updateArtistaAction(artista.id, data);
          if (result.success) {
            toast({ title: 'Artista atualizado com sucesso!' });
            router.push('/artistas');
            router.refresh();
          } else {
            toast({
              variant: 'destructive',
              title: 'Erro ao atualizar o artista.',
              description: result.message,
            });
          }
        } else {
          const result = await createArtistaAction(data);
          if (result.success && result.data && onSave) {
            toast({ title: 'Artista criado com sucesso!' });
            onSave(result.data as Artista);
          } else {
             toast({
              variant: 'destructive',
              title: 'Erro ao criar o artista.',
              description: result.message,
            });
          }
        }
    });
  };
  
  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col h-full">
        <ScrollArea className="flex-1 p-6">
          <Card className="border-none shadow-none p-0">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="font-headline">{isEditing ? "Editar Artista" : "Novo Artista"}</CardTitle>
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
                {isPending ? <Loader2 className="animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Artista')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
