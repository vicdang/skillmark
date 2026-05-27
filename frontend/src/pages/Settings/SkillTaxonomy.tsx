import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { useSkillTaxonomy } from '@/hooks/useSkillTaxonomy'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { SkillDomain, SkillCategory, Skill } from '@/types'

type EntityType = 'domain' | 'category' | 'skill'

interface EditState {
  type: EntityType
  item?: SkillDomain | SkillCategory | Skill
  parentId?: string
}

export function SkillTaxonomy() {
  const { t } = useTranslation()
  const { domains, categories, skills, loading, refetch } = useSkillTaxonomy()
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set())
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [editState, setEditState] = useState<EditState | null>(null)

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); setter(next)
  }

  const handleDelete = async (type: EntityType, id: string) => {
    const endpoint = type === 'domain' ? `/skills/domains/${id}` : type === 'category' ? `/skills/categories/${id}` : `/skills/items/${id}`
    await api.delete(endpoint)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('settings.skillTaxonomy')}</h1>
        <Button size="sm" className="gap-2" onClick={() => setEditState({ type: 'domain' })}>
          <Plus size={14} /> Add Domain
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {domains.map((domain) => {
            const domainOpen = openDomains.has(domain.id)
            const domainCats = categories.filter((c) => c.domain_id === domain.id)
            return (
              <div key={domain.id}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => toggle(openDomains, domain.id, setOpenDomains)}
                  >
                    {domainOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <span className="flex-1 font-medium">{domain.name}</span>
                  <Badge variant="secondary">{domainCats.length} categories</Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditState({ type: 'category', parentId: domain.id })}>
                    <Plus size={12} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditState({ type: 'domain', item: domain })}>
                    <Pencil size={12} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete('domain', domain.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>

                {domainOpen && (
                  <div className="ml-8 divide-y divide-border border-t border-border">
                    {domainCats.map((cat) => {
                      const catOpen = openCats.has(cat.id)
                      const catSkills = skills.filter((s) => s.category_id === cat.id)
                      return (
                        <div key={cat.id}>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20">
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => toggle(openCats, cat.id, setOpenCats)}
                            >
                              {catOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <span className="flex-1 text-sm">{cat.name}</span>
                            <Badge variant="secondary" className="text-xs">{catSkills.length} skills</Badge>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditState({ type: 'skill', parentId: cat.id })}>
                              <Plus size={10} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditState({ type: 'category', item: cat, parentId: domain.id })}>
                              <Pencil size={10} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete('category', cat.id)}>
                              <Trash2 size={10} />
                            </Button>
                          </div>
                          {catOpen && (
                            <ul className="ml-8 divide-y divide-border border-t border-border">
                              {catSkills.map((skill) => (
                                <li key={skill.id} className="flex items-center gap-2 px-4 py-2">
                                  <span className="flex-1 text-sm text-muted-foreground">{skill.name}</span>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditState({ type: 'skill', item: skill, parentId: cat.id })}>
                                    <Pencil size={10} />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete('skill', skill.id)}>
                                    <Trash2 size={10} />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editState && (
        <TaxonomyEditDialog
          state={editState}
          onClose={() => setEditState(null)}
          onSaved={() => { setEditState(null); refetch() }}
        />
      )}
    </div>
  )
}

function TaxonomyEditDialog({ state, onClose, onSaved }: { state: EditState; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation()
  const existing = state.item
  const [name, setName] = useState((existing as { name?: string })?.name ?? '')
  const [saving, setSaving] = useState(false)

  const typeLabel = state.type === 'domain' ? 'Domain' : state.type === 'category' ? 'Category' : 'Skill'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (existing) {
        const endpoint = state.type === 'domain' ? `/skills/domains/${existing.id}` : state.type === 'category' ? `/skills/categories/${existing.id}` : `/skills/items/${existing.id}`
        await api.put(endpoint, { name })
      } else {
        const endpoint = state.type === 'domain' ? '/skills/domains' : state.type === 'category' ? '/skills/categories' : '/skills/items'
        const body = state.type === 'domain' ? { name } : state.type === 'category' ? { domain_id: state.parentId, name } : { category_id: state.parentId, name }
        await api.post(endpoint, body)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit' : 'Add'} {typeLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
