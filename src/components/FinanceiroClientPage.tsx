'use client';

import { useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { FinancialChart } from './FinancialChart';

export function FinanceiroClientPage({ initialTransactions }: { initialTransactions: Transaction[] }) {
  
  const { recebido, pago, aReceber, aPagar } = useMemo(() => {
    return initialTransactions.reduce((acc, tx) => {
      if (tx.type === 'receber') {
        if (tx.status === 'concluido') acc.recebido += tx.value;
        else acc.aReceber += tx.value;
      } else {
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

        <Card>
            <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
                <ArrowUp className="text-green-500" /> Saldo Geral
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className={`text-3xl font-bold ${saldoGeral >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(saldoGeral)}
            </p>
            <p className="text-xs text-muted-foreground">(Total recebido - Total pago)</p>
            </CardContent>
        </Card>
    </>
  );
}
