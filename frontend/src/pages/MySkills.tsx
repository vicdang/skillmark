import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Grid3x3, List } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [inlineEdit, setInlineEdit] = useState<{ skillId: string; field: string } | null>(null)
  const [inlineValues, setInlineValues] = useState<Record<string, any>>({})

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

        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 size={16} />
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <List size={16} />
              Table
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : skills.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-muted-foreground">No skills added yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Use the browser on the left to add skills.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-15rem)]">
            {viewMode === 'grid' ? (
              <div className="space-y-6 pr-4">
                {groupedByDomain.map(({ domain, skills: domainSkills }) => (
                  <div key={domain.id}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {domain.name}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {domainSkills.map((es) => {
                        const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
                        return (
                          <div key={es.id} className="flex flex-col justify-between rounded-lg border border-border bg-card p-3">
                            <div className="mb-3 min-h-12">
                              <p className="text-sm font-medium">{skill?.name ?? es.skill_id}</p>
                              {es.years_experience && (
                                <p className="text-xs text-muted-foreground">{es.years_experience}y exp</p>
                              )}
                            </div>
                            <div className="flex items-end justify-between gap-2">
                              <SkillLevelBadge level={es.level} />
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditTarget(es)}>
                                  <Pencil size={12} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
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
            ) : (
              <div className="pr-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Skill</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Domain</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Level</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Experience (years)</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDomain.map(({ domain, skills: domainSkills }) =>
                      domainSkills.map((es) => {
                        const skill = taxonomy.skills.find((s) => s.id === es.skill_id)
                        const isEditing = inlineEdit?.skillId === es.id
                        return (
                          <tr key={es.id} className="border-b border-border hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">{skill?.name ?? es.skill_id}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{domain.name}</td>
                            <td
                              className="cursor-pointer px-4 py-3 hover:bg-muted/50"
                              onClick={() => {
                                setInlineEdit({ skillId: es.id, field: 'level' })
                                setInlineValues({ level: es.level })
                              }}
                            >
                              {isEditing && inlineEdit.field === 'level' ? (
                                <select
                                  autoFocus
                                  value={inlineValues.level || es.level}
                                  onChange={(e) => setInlineValues({ ...inlineValues, level: Number(e.target.value) })}
                                  onBlur={() => {
                                    updateSkill(es.id, { level: inlineValues.level, years_experience: es.years_experience })
                                    setInlineEdit(null)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateSkill(es.id, { level: inlineValues.level, years_experience: es.years_experience })
                                      setInlineEdit(null)
                                    } else if (e.key === 'Escape') setInlineEdit(null)
                                  }}
                                  className="h-8 rounded border border-border bg-background px-2 py-1 text-sm"
                                >
                                  <option value={1}>Beginner</option>
                                  <option value={2}>Elementary</option>
                                  <option value={3}>Intermediate</option>
                                  <option value={4}>Advanced</option>
                                  <option value={5}>Expert</option>
                                </select>
                              ) : (
                                <SkillLevelBadge level={es.level} />
                              )}
                            </td>
                            <td
                              className="cursor-pointer px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50"
                              onClick={() => {
                                setInlineEdit({ skillId: es.id, field: 'years_experience' })
                                setInlineValues({ years_experience: es.years_experience || '' })
                              }}
                            >
                              {isEditing && inlineEdit.field === 'years_experience' ? (
                                <input
                                  autoFocus
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={inlineValues.years_experience ?? ''}
                                  onChange={(e) => setInlineValues({ ...inlineValues, years_experience: e.target.value ? Number(e.target.value) : '' })}
                                  onBlur={() => {
                                    updateSkill(es.id, { level: es.level, years_experience: inlineValues.years_experience })
                                    setInlineEdit(null)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateSkill(es.id, { level: es.level, years_experience: inlineValues.years_experience })
                                      setInlineEdit(null)
                                    } else if (e.key === 'Escape') setInlineEdit(null)
                                  }}
                                  className="h-8 w-20 rounded border border-border bg-background px-2 py-1 text-sm"
                                />
                              ) : (
                                <span>{es.years_experience ? `${es.years_experience}` : '—'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => removeSkill(es.id)}
                                  title="Remove skill"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
