'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const registerFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  confirmPassword: z.string(),
  userType: z.enum(['contratante', 'artista'], {
    required_error: 'Selecione o tipo de usuário.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: RegisterFormValues) {
    console.log(data);
    toast({
      title: 'Cadastro realizado com sucesso!',
      description: 'Você agora pode fazer login.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="font-headline">Crie sua conta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Você é...</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="contratante" /></FormControl><FormLabel className="font-normal">Contratante</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="artista" /></FormControl><FormLabel className="font-normal">Artista</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage /></FormItem>
                    )}
                />
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder="Sua senha" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirme a Senha</FormLabel><FormControl><Input type="password" placeholder="Confirme sua senha" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </CardContent>
        </Card>
        
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
          Criar Conta
        </Button>
      </form>
    </Form>
  );
}
