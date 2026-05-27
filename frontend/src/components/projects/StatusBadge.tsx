import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/types'

const VARIANT: Record<ProjectStatus, 'secondary' | 'info' | 'success' | 'warning' | 'default'> = {
  draft: 'secondary',
  review: 'info',
  approved: 'warning',
  in_progress: 'default',
  completed: 'success',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useTranslation()
  return <Badge variant={VARIANT[status]}>{t(`projects.status.${status}`)}</Badge>
}
