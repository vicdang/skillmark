import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GitCompare, ArrowLeft } from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { useEmployeeSkills } from '@/hooks/useEmployeeSkills'
import { useSkillTaxonomy } from '@/hooks/useSkillTaxonomy'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkillLevelBadge } from '@/components/skills/SkillLevelBadge'
import { SkillRadar } from '@/components/charts/SkillRadar'
import { getInitials } from '@/lib/utils'

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user, loading: userLoading } = useUser(id)
  const { skills, loading: skillsLoading } = useEmployeeSkills(id)
  const taxonomy = useSkillTaxonomy()
  const currentUser = useAuthStore((s) => s.user)

  if (userLoading) return <p className="text-muted-foreground">{t('common.loading')}</p>
  if (!user) return <p className="text-destructive">User not found</p>

  // Build radar data: domain → avg skill level
  const domainAverages: Record<string, number> = {}
  for (const domain of taxonomy.domains) {
    const cats = taxonomy.categories.filter((c) => c.domain_id === domain.id)
    const domainSkills = skills.filter((es) => {
      const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
      return skill && cats.some((c) => c.id === skill.category_id)
    })
    if (domainSkills.length > 0) {
      domainAverages[domain.name] = domainSkills.reduce((sum, s) => sum + s.level, 0) / domainSkills.length
    }
  }

  const radarDomains = Object.keys(domainAverages)

  // Group skills by domain
  const grouped = taxonomy.domains.map((domain) => {
    const cats = taxonomy.categories.filter((c) => c.domain_id === domain.id)
    const domainSkills = skills.filter((es) => {
      const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
      return skill && cats.some((c) => c.id === skill.category_id)
    })
    return { domain, skills: domainSkills }
  }).filter((g) => g.skills.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/employees">
          <Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('nav.employees')}</h1>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-lg">{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="capitalize">{user.role}</Badge>
              {user.department && <span className="text-xs text-muted-foreground">{user.department}</span>}
              {user.job_title && <span className="text-xs text-muted-foreground">• {user.job_title}</span>}
            </div>
          </div>
        </div>
        {currentUser?.id !== id && (
          <Link to={`/employees/${id}/compare`}>
            <Button variant="outline" size="sm" className="gap-2">
              <GitCompare size={14} />
              Compare
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        {radarDomains.length > 2 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold">Skill Overview</h3>
            <SkillRadar
              domains={radarDomains}
              series={[{ name: user.full_name, color: 'hsl(var(--primary))', data: domainAverages }]}
            />
          </div>
        )}

        {/* Stats */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total skills</dt>
                <dd className="font-medium">{skills.length}</dd>
              </div>
              {skills.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Avg level</dt>
                  <dd className="font-medium">
                    {(skills.reduce((s, e) => s + e.level, 0) / skills.length).toFixed(1)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Domains covered</dt>
                <dd className="font-medium">{radarDomains.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Skill list by domain */}
      {skillsLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ domain, skills: ds }) => (
            <div key={domain.id} className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {domain.name}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {ds.map((es) => {
                  const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
                  return (
                    <div key={es.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                      <span className="text-sm font-medium">{skill?.name ?? '—'}</span>
                      <div className="flex items-center gap-2">
                        {es.years_experience && (
                          <span className="text-xs text-muted-foreground">{es.years_experience}y</span>
                        )}
                        <SkillLevelBadge level={es.level} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
