import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts'

export default function RadarInsightsChart({ data }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="72%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#C8D2E8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#66E3FF"
            fill="#8B5CF6"
            fillOpacity={0.28}
            strokeWidth={2.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
