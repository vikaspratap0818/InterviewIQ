import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

export default function AnalysisRadarChart({ data }) {
  // Expected data format:
  // [
  //   { subject: 'Technical', A: 80, fullMark: 100 },
  //   { subject: 'Communication', A: 70, fullMark: 100 },
  //   ...
  // ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#6366F1"
            strokeWidth={2}
            fill="#6366F1"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
