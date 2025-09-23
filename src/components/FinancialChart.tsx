'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface FinancialChartProps {
  recebido: number;
  pago: number;
  aReceberPendente: number;
  aPagarPendente: number;
}

const chartConfig = {
  valor: {
    label: 'Valor (R$)',
  },
  recebido: {
    label: 'Recebido',
    color: 'hsl(var(--chart-2))',
  },
  pago: {
    label: 'Pago',
    color: 'hsl(var(--chart-5))',
  },
  aReceber: {
    label: 'A Receber',
    color: 'hsl(var(--chart-1))',
  },
  aPagar: {
    label: 'A Pagar',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function FinancialChart({
  recebido,
  pago,
  aReceberPendente,
  aPagarPendente,
}: FinancialChartProps) {
  const chartData = [
    { type: 'Recebido', recebido },
    { type: 'Pago', pago },
    { type: 'A Receber', aReceber: aReceberPendente },
    { type: 'A Pagar', aPagar: aPagarPendente },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Resumo Gráfico Financeiro</CardTitle>
        <CardDescription>
          Comparativo de valores concluídos e pendentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.substring(0, 10)}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value).replace(/\s/g, '')}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex flex-col">
                    <span className="font-bold">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                    <span>{formatCurrency(Number(value))}</span>
                  </div>
                )}
                labelFormatter={(label) => null}
                indicator="dot"
              />}
            />
            <Bar dataKey="recebido" fill="var(--color-recebido)" radius={4} />
            <Bar dataKey="pago" fill="var(--color-pago)" radius={4} />
            <Bar dataKey="aReceber" fill="var(--color-aReceber)" radius={4} />
            <Bar dataKey="aPagar" fill="var(--color-aPagar)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}