import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { type Event } from '@/lib/types';
import { Calendar, Clock, User, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  const day = eventDate.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

  const isPast = new Date() > eventDate;

  const renderFinancials = () => {
    if (event.receber) {
      return (
        <Badge variant={event.receber.status === 'recebido' ? 'secondary' : 'default'} className="bg-green-600/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-600/30">
          <ArrowUp className="mr-1 h-3 w-3" /> {formatCurrency(event.receber.valor)}
        </Badge>
      );
    }
    if (event.pagar) {
      return (
        <Badge variant={event.pagar.status === 'pago' ? 'secondary' : 'default'} className="bg-red-600/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-600/30">
          <ArrowDown className="mr-1 h-3 w-3" /> {formatCurrency(event.pagar.valor)}
        </Badge>
      );
    }
    return null;
  }

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="hover:border-primary transition-all duration-200">
        <div className={`flex ${isPast ? 'opacity-60' : ''}`}>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 border-r">
                <span className="text-xs uppercase font-bold text-primary">{month}</span>
                <span className="text-2xl font-bold">{day}</span>
            </div>
            <div className="flex-1">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-lg">{event.artista}</CardTitle>
                        {renderFinancials()}
                    </div>
                    <CardDescription className="flex items-center gap-1 text-sm pt-1">
                        <Briefcase className="h-3 w-3" />
                        {event.contratante}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground flex items-center gap-2 pt-0 pb-4 px-6">
                    <Clock className="h-3 w-3" />
                    <span>{event.hora}</span>
                </CardContent>
            </div>
        </div>
      </Card>
    </Link>
  );
}
