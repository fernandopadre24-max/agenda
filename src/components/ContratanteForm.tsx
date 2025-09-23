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
import { createContratanteAction, updateContratanteAction, type ContratanteFormValues } from '@/lib/actions';
import { type Contratante } from '@/lib/types';


const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
});


export function ContratanteForm({ contratante }: { contratante?: Contratante }) {
  const isEditing = !!contratante;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContratanteFormValues>({
    resolver: zodResolver(contratanteFormSchema),
    defaultValues: {
      name: contratante?.name ?? '',
      email: contratante?.email ?? '',
      phone: contratante?.phone ?? '',
    },
  });

  const onSubmit = async (data: ContratanteFormValues) => {
    setIsLoading(true);
    const action = isEditing
        ? updateContratanteAction.bind(null, contratante.id)
        : createContratanteAction;

    const result = await action(data);

    if (result.success) {
      toast({
        title: `Contratante ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      });
      router.push(result.redirectPath ?? '/contratantes');
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} o contratante.`,
        description: result.message,
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="font-headline">Informações do Contratante</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do contratante" {...field} /></FormControl><FormMessage /></FormItem>
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
            {isLoading ? <Loader2 className="animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Contratante')}
        </Button>
      </form>
    </Form>
  );
}
