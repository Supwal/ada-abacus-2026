
'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface EarningsChartProps {
  data: Array<{ date: string; amount: number }>;
}

export function EarningsChart({ data }: EarningsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('pt-BR', {
      month: 'short',
      day: '2-digit'
    })
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="displayDate" 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            label={{ value: 'R$', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <Tooltip
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganho']}
            labelFormatter={(label) => `Data: ${label}`}
            contentStyle={{ fontSize: 11 }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#60B5FF" 
            strokeWidth={2}
            dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#60B5FF', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
