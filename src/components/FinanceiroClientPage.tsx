'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, CheckCircle, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/lib/types';
import { FinancialChart } from '@/components/FinancialChart';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

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

type UnifiedTransaction = {
  eventId: string;
  artista: string;
  contratante: string;
  date: Date;
  type: 'receber' | 'pagar';
  valor: number;
};

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

  const pendingTransactions = useMemo<UnifiedTransaction[]>(() => {
    if (!isMounted) return [];

    const transactions: UnifiedTransaction[] = [];
    events.forEach(event => {
      if (event.receber?.status === 'pendente') {
        transactions.push({
          eventId: event.id,
          artista: event.artista,
          contratante: event.contratante,
          date: new Date(event.date),
          type: 'receber',
          valor: event.receber.valor,
        });
      }
      if (event.pagar?.status === 'pendente') {
        transactions.push({
          eventId: event.id,
          artista: event.artista,
          contratante: event.contratante,
          date: new Date(event.date),
          type: 'pagar',
          valor: event.pagar.valor,
        });
      }
    });

    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, isMounted]);

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
  
  if (!isMounted) {
    return null;
  }

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

      <div>
        <h3 className="text-lg font-headline mb-4">Transações Pendentes</h3>
        {pendingTransactions.length > 0 ? (
          <div className="space-y-3">
            {pendingTransactions.map((tx) => (
              <Link href={`/events/${tx.eventId}`} key={`${tx.eventId}-${tx.type}`} className="block">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold truncate">{tx.artista}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {tx.contratante}
                        </p>
                         <p className="text-xs text-muted-foreground mt-1">
                           {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 font-bold ${tx.type === 'receber' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'receber' ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />}
                        <span>{formatCurrency(tx.valor)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <CheckCircle className="mx-auto h-12 w-12" />
            <p className="mt-4">Nenhuma transação pendente.</p>
          </div>
        )}
      </div>
    </>
  );
}
