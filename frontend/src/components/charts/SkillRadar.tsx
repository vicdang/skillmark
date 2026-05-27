import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface RadarSeries {
  name: string
  color: string
  data: Record<string, number>
}

interface Props {
  domains: string[]
  series: RadarSeries[]
  height?: number
}

export function SkillRadar({ domains, series, height = 320 }: Props) {
  const chartData = domains.map((domain) => {
    const point: Record<string, string | number> = { domain }
    for (const s of series) {
      point[s.name] = s.data[domain] ?? 0
    }
    return point
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
        />
        {series.map((s) => (
          <Radar
            key={s.name}
            name={s.name}
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.15}
          />
        ))}
        {series.length > 1 && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  )
}
