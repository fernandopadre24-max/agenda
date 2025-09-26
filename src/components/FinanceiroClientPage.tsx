'use client';

import { useMemo } from 'react';
import { ArrowUp, ArrowDown, Banknote, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { FinancialChart } from './FinancialChart';

function InfoCard({ title, value, icon: Icon, colorClass, description }: { title: string, value: number, icon: React.ElementType, colorClass?: string, description?: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 text-muted-foreground ${colorClass}`}>
                    <Icon className="h-4 w-4" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(value)}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}

export function FinanceiroClientPage({ initialTransactions }: { initialTransactions: Transaction[] }) {
  
  const { recebido, pago, aReceber, aPagar } = useMemo(() => {
    return initialTransactions.reduce((acc, tx) => {
      if (tx.type === 'receber') {
        if (tx.status === 'concluido') acc.recebido += tx.value;
        else acc.aReceber += tx.value;
      } else { // 'pagar'
        if (tx.status === 'concluido') acc.pago += tx.value;
        else acc.aPagar += tx.value;
      }
      return acc;
    }, { recebido: 0, pago: 0, aReceber: 0, aPagar: 0 });
  }, [initialTransactions]);
  
  const saldoGeral = recebido - pago;

  return (
    <>
        <FinancialChart recebido={recebido} pago={pago} aReceberPendente={aReceber} aPagarPendente={aPagar} />
        
        <InfoCard 
            title="Saldo Geral"
            value={saldoGeral}
            icon={Banknote}
            colorClass={saldoGeral >= 0 ? 'text-green-500' : 'text-red-500'}
            description="(Total recebido - Total pago)"
        />

        <div className="grid grid-cols-2 gap-4">
            <InfoCard 
                title="Recebido"
                value={recebido}
                icon={ArrowUp}
                colorClass="text-green-500"
            />
            <InfoCard 
                title="Pago"
                value={pago}
                icon={ArrowDown}
                colorClass="text-red-500"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <InfoCard 
                title="Pendente a Receber"
                value={aReceber}
                icon={Clock}
                colorClass="text-yellow-500"
            />
             <InfoCard 
                title="Pendente a Pagar"
                value={aPagar}
                icon={Clock}
                colorClass="text-orange-500"
            />
        </div>
    </>
  );
}
