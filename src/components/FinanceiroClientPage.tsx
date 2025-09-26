'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { FinancialChart } from '@/components/FinancialChart';
import { useEffect, useState } from 'react';

function SummaryCard({
  title,
  value,
  icon: Icon,
  colorClass = 'text-primary',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  colorClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionList({
  title,
  events,
  type,
}: {
  title: string;
  events: Event[];
  type: 'receber' | 'pagar';
}) {
  const filteredEvents = events.filter(
    e => e[type] && e[type]?.status === 'pendente'
  );

  if (filteredEvents.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-headline mb-2">{title}</h3>
      <div className="space-y-2">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="flex justify-between items-center p-2 rounded-lg bg-card"
          >
            <div>
              <p className="font-semibold">{event.artista}</p>
              <p className="text-sm text-muted-foreground">
                {event.contratante}
              </p>
            </div>
            <Badge
              variant={type === 'receber' ? 'default' : 'destructive'}
              className={
                type === 'receber'
                  ? 'bg-green-600/20 text-green-400 border-green-600/30'
                  : 'bg-red-600/20 text-red-400 border-red-600/30'
              }
            >
              {formatCurrency(event[type]!.valor)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceiroClientPage({
  initialEvents,
}: {
  initialEvents: Event[];
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setEvents(initialEvents);
  }, [initialEvents]);

  if (!isMounted) {
    // You can return a skeleton loader here if you want
    return null;
  }


  const aReceberPendente = events.reduce((acc, event) => {
    if (event.receber?.status === 'pendente') {
      return acc + event.receber.valor;
    }
    return acc;
  }, 0);

  const recebido = events.reduce((acc, event) => {
    if (event.receber?.status === 'recebido') {
      return acc + event.receber.valor;
    }
    return acc;
  }, 0);

  const aPagarPendente = events.reduce((acc, event) => {
    if (event.pagar?.status === 'pendente') {
      return acc + event.pagar.valor;
    }
    return acc;
  }, 0);

  const pago = events.reduce((acc, event) => {
    if (event.pagar?.status === 'pago') {
      return acc + event.pagar.valor;
    }
    return acc;
  }, 0);

  const saldoGeral = recebido - pago;

  return (
    <>
      <FinancialChart
        recebido={recebido}
        pago={pago}
        aReceberPendente={aReceberPendente}
        aPagarPendente={aPagarPendente}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Saldo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${
              saldoGeral >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(saldoGeral)}
          </p>
          <p className="text-xs text-muted-foreground">
            (Total recebido - Total pago)
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="A Receber"
          value={aReceberPendente}
          icon={Clock}
          colorClass="text-green-400"
        />
        <SummaryCard
          title="Recebido"
          value={recebido}
          icon={CheckCircle}
          colorClass="text-green-400"
        />
        <SummaryCard
          title="A Pagar"
          value={aPagarPendente}
          icon={Clock}
          colorClass="text-red-400"
        />
        <SummaryCard
          title="Pago"
          value={pago}
          icon={CheckCircle}
          colorClass="text-red-400"
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <TransactionList
          title="Próximos Recebimentos"
          events={events}
          type="receber"
        />
        <TransactionList
          title="Próximos Pagamentos"
          events={events}
          type="pagar"
        />
      </div>
    </>
  );
}
