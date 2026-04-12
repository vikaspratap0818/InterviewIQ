import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

export default function TrendLineChart({ data }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="session" 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#64748B', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 21, 37, 0.95)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              color: '#F8FAFC',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)'
            }}
            itemStyle={{ color: '#818CF8' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#6366F1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
