'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
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
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialChartProps {
  recebido: number;
  pago: number;
  aReceberPendente: number;
  aPagarPendente: number;
}

const barChartConfig = {
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

const pieChartConfig = {
  recebido: {
    label: "Recebido",
    color: "hsl(var(--chart-2))",
  },
  pago: {
    label: "Pago",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function FinancialChart({
  recebido,
  pago,
  aReceberPendente,
  aPagarPendente,
}: FinancialChartProps) {
  const [chartType, setChartType] = useState('bar');
  
  const barChartData = [
    { type: 'Recebido', recebido },
    { type: 'Pago', pago },
    { type: 'A Receber', aReceber: aReceberPendente },
    { type: 'A Pagar', aPagar: aPagarPendente },
  ];

  const pieChartData = [
    { name: 'Recebido', value: recebido, color: 'hsl(var(--chart-2))' },
    { name: 'Pago', value: pago, color: 'hsl(var(--chart-5))' },
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
        <Tabs value={chartType} onValueChange={setChartType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bar">Barras</TabsTrigger>
                <TabsTrigger value="pie">Pizza</TabsTrigger>
            </TabsList>
            <TabsContent value="bar">
                <ChartContainer config={barChartConfig} className="min-h-[200px] w-full">
                  <BarChart accessibilityLayer data={barChartData} margin={{ top: 20 }}>
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
                            <span className="font-bold">{barChartConfig[name as keyof typeof barChartConfig]?.label}</span>
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
            </TabsContent>
            <TabsContent value="pie">
                 <ChartContainer
                  config={pieChartConfig}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel indicator="dot" formatter={(value, name, props) => (
                          <div className="flex flex-col">
                            <span className="font-bold">{props.payload?.name}</span>
                            <span>{formatCurrency(Number(value))}</span>
                          </div>
                        )}/>}
                    />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
