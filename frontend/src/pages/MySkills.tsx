import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSkillTaxonomy } from '@/hooks/useSkillTaxonomy'
import { useEmployeeSkills } from '@/hooks/useEmployeeSkills'
import { SkillTree } from '@/components/skills/SkillTree'
import { SkillLevelBadge } from '@/components/skills/SkillLevelBadge'
import { SkillFormDialog } from '@/components/skills/SkillFormDialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { EmployeeSkill, Skill } from '@/types'

export function MySkills() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const taxonomy = useSkillTaxonomy()
  const { skills, loading, addSkill, updateSkill, removeSkill } = useEmployeeSkills(user?.id)

  const [addTarget, setAddTarget] = useState<Skill | null>(null)
  const [editTarget, setEditTarget] = useState<EmployeeSkill | null>(null)

  const ownedSkillIds = new Set(skills.map((s) => s.skill_id))

  const groupedByDomain = taxonomy.domains.map((domain) => {
    const cats = taxonomy.categories.filter((c) => c.domain_id === domain.id)
    const domainSkills = skills.filter((es) => {
      const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
      if (!skill) return false
      return cats.some((c) => c.id === skill.category_id)
    })
    return { domain, skills: domainSkills }
  }).filter((g) => g.skills.length > 0)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left: taxonomy browser */}
      <div className="w-72 shrink-0">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Browse Skills</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-3">
              <SkillTree
                taxonomy={taxonomy}
                ownedSkillIds={ownedSkillIds}
                onAdd={(skill) => setAddTarget(skill)}
                loading={taxonomy.loading}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right: my skills list */}
      <div className="flex-1 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('skills.mySkills')}</h1>
          <span className="text-sm text-muted-foreground">{skills.length} skills</span>
        </div>

        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : skills.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-muted-foreground">No skills added yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the browser on the left to add skills.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-6 pr-4">
              {groupedByDomain.map(({ domain, skills: domainSkills }) => (
                <div key={domain.id}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {domain.name}
                  </h3>
                  <div className="space-y-2">
                    {domainSkills.map((es) => {
                      const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
                      return (
                        <div key={es.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium">{skill?.name ?? es.skill_id}</p>
                              {es.years_experience && (
                                <p className="text-xs text-muted-foreground">{es.years_experience}y exp</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <SkillLevelBadge level={es.level} />
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditTarget(es)}>
                                <Pencil size={12} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeSkill(es.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {addTarget && (
        <SkillFormDialog
          mode="add"
          skill={addTarget}
          onSubmit={async (data) => { await addSkill(data) }}
          onClose={() => setAddTarget(null)}
        />
      )}
      {editTarget && (
        <SkillFormDialog
          mode="edit"
          employeeSkill={editTarget}
          onSubmit={async (data) => { await updateSkill(editTarget.id, data) }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
