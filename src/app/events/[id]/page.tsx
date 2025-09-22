import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { getEventById } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Briefcase, User,LogIn, LogOut, ArrowDown, ArrowUp } from 'lucide-react';
import { EventActions } from '@/components/EventActions';

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4">
            <div className="text-muted-foreground pt-1"><Icon className="h-5 w-5" /></div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-base">{value}</p>
            </div>
        </div>
    );
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) {
    notFound();
  }

  const financialInfo = event.receber || event.pagar;
  const isReceiving = !!event.receber;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <PageHeader title={event.artista} />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{event.artista}</CardTitle>
            <p className="text-muted-foreground flex items-center gap-2 pt-1"><Briefcase className="h-4 w-4" />{event.contratante}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={Calendar} label="Data" value={formatDate(event.date)} />
            <DetailItem icon={Clock} label="Hora do Evento" value={event.hora} />
            <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={LogIn} label="Entrada" value={event.entrada} />
                <DetailItem icon={LogOut} label="Saída" value={event.saida} />
            </div>
          </CardContent>
        </Card>

        {financialInfo && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        {isReceiving ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />}
                        Financeiro
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <DetailItem 
                        icon={isReceiving ? ArrowUp : ArrowDown}
                        label={isReceiving ? "Valor a Receber" : "Valor a Pagar"} 
                        value={formatCurrency(financialInfo.valor)} 
                    />
                    <DetailItem 
                        icon={isReceiving ? ArrowUp : ArrowDown}
                        label="Status" 
                        value={<Badge variant={financialInfo.status === 'pendente' ? 'destructive' : 'default'} className={financialInfo.status !== 'pendente' ? "bg-green-500" : ""}>{financialInfo.status}</Badge>}
                    />
                </CardContent>
            </Card>
        )}
        
        <div className="pt-4">
            <EventActions eventId={event.id} />
        </div>
      </main>
    </div>
  );
}
