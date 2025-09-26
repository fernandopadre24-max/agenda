'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { type Contratante, type ActionResponse } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const contratanteFormSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    responsibleName: z.string().optional(),
    email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.string().optional(),
});

type ContratanteFormValues = z.infer<typeof contratanteFormSchema>;

interface ContratanteFormProps {
    contratante?: Contratante;
    onSave?: (newContratante: Contratante) => void;
    action: (data: ContratanteFormValues) => Promise<ActionResponse>;
}

export function ContratanteForm({ contratante, onSave, action }: ContratanteFormProps) {
  const isEditing = !!contratante;
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContratanteFormValues>({
    resolver: zodResolver(contratanteFormSchema),
    defaultValues: {
      name: contratante?.name ?? '',
      responsibleName: contratante?.responsibleName ?? '',
      email: contratante?.email ?? '',
      phone: contratante?.phone ?? '',
      category: contratante?.category ?? '',
    },
  });

  const onSubmit = async (data: ContratanteFormValues) => {
    startTransition(async () => {
      const result = await action(data);
      if (result.success) {
        toast({ title: `Contratante ${isEditing ? 'atualizado' : 'criado'} com sucesso!` });
        if (isEditing) {
          router.push('/contratantes');
          router.refresh();
        } else if (onSave && result.data) {
          onSave(result.data as Contratante);
        }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col h-full">
        <ScrollArea className="flex-1 p-6">
            <Card className="border-none shadow-none p-0">
                <CardHeader className="p-0 mb-6"><CardTitle className="font-headline">{isEditing ? "Editar Contratante" : "Novo Contratante"}</CardTitle></CardHeader>
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
                {isPending ? <Loader2 className="animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Contratante')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
