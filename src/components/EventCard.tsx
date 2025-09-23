'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { type Event } from '@/lib/types';
import { Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function EventCard({ event }: { event: Event }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // ou um skeleton/placeholder
  }

  const eventDate = new Date(event.date);
  const isPast = new Date() > eventDate;
  
  const day = eventDate.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const time = event.hora;

  const renderFinancials = () => {
    if (event.receber) {
      return (
        <Badge variant={event.receber.status === 'recebido' ? 'default' : 'secondary'} className="bg-green-600/20 text-green-400 border-green-600/30">
          <ArrowUp className="mr-1 h-3 w-3" /> {formatCurrency(event.receber.valor)}
        </Badge>
      );
    }
    if (event.pagar) {
      return (
        <Badge variant={event.pagar.status === 'pago' ? 'default' : 'secondary'} className="bg-red-600/20 text-red-400 border-red-600/30">
          <ArrowDown className="mr-1 h-3 w-3" /> {formatCurrency(event.pagar.valor)}
        </Badge>
      );
    }
    return null;
  }

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className={`hover:border-primary transition-all duration-200 ${isPast ? 'opacity-50' : ''}`}>
        <div className="flex">
            <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 border-r border-border">
                <span className="text-xs uppercase font-bold text-primary">{month}</span>
                <span className="text-2xl font-bold">{day}</span>
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                  <CardTitle className="font-headline text-lg">{event.artista}</CardTitle>
                  {renderFinancials()}
              </div>
              <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <Briefcase className="h-4 w-4" />
                  {event.contratante}
              </CardDescription>
              <div className="text-sm text-muted-foreground mt-2">{time}</div>
            </div>
        </div>
      </Card>
    </Link>
  );
}
