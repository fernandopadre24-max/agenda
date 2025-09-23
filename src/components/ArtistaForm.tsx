'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { createArtistaAction, type ArtistaFormValues } from '@/lib/actions';

const artistaFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    serviceType: z.string().optional(),
});


export function ArtistaForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ArtistaFormValues>({
    resolver: zodResolver(artistaFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceType: '',
    },
  });

  const onSubmit = async (data: ArtistaFormValues) => {
    setIsLoading(true);
    const result = await createArtistaAction(data);

    if (result.success) {
      toast({
        title: 'Artista criado com sucesso!',
      });
      router.push(result.redirectPath ?? '/artistas');
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar o artista.',
        description: result.message,
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="font-headline">Informações do Artista</CardTitle></CardHeader>
            <CardContent className="space-y-4">
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
        
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Criar Artista'}
        </Button>
      </form>
    </Form>
  );
}
