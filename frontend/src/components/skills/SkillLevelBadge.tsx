import { cn } from '@/lib/utils'
import { SENIORITY_LABELS } from '@/types'

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-500/20 text-slate-400',
  2: 'bg-blue-500/20 text-blue-400',
  3: 'bg-yellow-500/20 text-yellow-400',
  4: 'bg-orange-500/20 text-orange-400',
  5: 'bg-green-500/20 text-green-400',
}

interface Props {
  level: number
  showLabel?: boolean
  className?: string
}

export function SkillLevelBadge({ level, showLabel = true, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', LEVEL_COLORS[level], className)}>
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn('h-1.5 w-1.5 rounded-full', i < level ? 'bg-current' : 'bg-current/20')}
          />
        ))}
      </span>
      {showLabel && <span>{SENIORITY_LABELS[level]}</span>}
    </span>
  )
}
