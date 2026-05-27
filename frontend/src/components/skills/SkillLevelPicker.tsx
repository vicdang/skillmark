import { SENIORITY_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange: (level: 1 | 2 | 3 | 4 | 5) => void
  disabled?: boolean
}

export function SkillLevelPicker({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((lvl) => (
        <button
          key={lvl}
          type="button"
          disabled={disabled}
          onClick={() => onChange(lvl as 1 | 2 | 3 | 4 | 5)}
          title={SENIORITY_LABELS[lvl]}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors',
            value === lvl
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {lvl}
        </button>
      ))}
    </div>
  )
}
