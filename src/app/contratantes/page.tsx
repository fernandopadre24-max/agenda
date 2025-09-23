import { getContratantes } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteContratanteAction } from '@/lib/actions';
import { ContratanteActions } from '@/components/ContratanteActions';


export default async function ContratantesPage() {
  const contratantes = await getContratantes();

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title="Contratantes" />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex justify-end">
            <Button asChild>
                <Link href="/contratantes/new">
                    <Plus className="mr-2 h-4 w-4" /> Novo Contratante
                </Link>
            </Button>
        </div>

        <div className="space-y-4">
          {contratantes.map(contratante => (
            <Card key={contratante.id}>
              <CardHeader className="pb-3">
                 <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {contratante.name}
                    </CardTitle>
                    <ContratanteActions contratanteId={contratante.id} />
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
        {contratantes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                <User className="mx-auto h-12 w-12" />
                <p className="mt-4">Nenhum contratante cadastrado.</p>
            </div>
        )}
      </main>
    </div>
  );
}
