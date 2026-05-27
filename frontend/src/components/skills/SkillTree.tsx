import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TaxonomyData } from '@/hooks/useSkillTaxonomy'
import type { Skill } from '@/types'

interface Props {
  taxonomy: TaxonomyData
  ownedSkillIds: Set<string>
  onAdd: (skill: Skill) => void
  loading?: boolean
}

export function SkillTree({ taxonomy, ownedSkillIds, onAdd, loading }: Props) {
  const [query, setQuery] = useState('')
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set())
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  const q = query.toLowerCase()

  const filteredDomains = taxonomy.domains.filter((d) => {
    if (!q) return true
    const cats = taxonomy.categories.filter((c) => c.domain_id === d.id)
    return cats.some((c) => {
      const skills = taxonomy.skills.filter((s) => s.category_id === c.id)
      return c.name.toLowerCase().includes(q) || skills.some((s) => s.name.toLowerCase().includes(q))
    }) || d.name.toLowerCase().includes(q)
  })

  const toggleDomain = (id: string) => {
    setOpenDomains((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading taxonomy...</p>

  return (
    <div className="space-y-2">
      <Input placeholder="Search skills..." value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="space-y-1">
        {filteredDomains.map((domain) => {
          const cats = taxonomy.categories.filter((c) => c.domain_id === domain.id)
          const domainOpen = openDomains.has(domain.id) || !!q
          const matchesDomain = domain.name.toLowerCase().includes(q)

          return (
            <div key={domain.id}>
              <button
                type="button"
                onClick={() => toggleDomain(domain.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-accent"
              >
                {domainOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {domain.name}
              </button>

              {domainOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {cats
                    .filter((c) => {
                      if (!q || matchesDomain) return true
                      const skills = taxonomy.skills.filter((s) => s.category_id === c.id)
                      return c.name.toLowerCase().includes(q) || skills.some((s) => s.name.toLowerCase().includes(q))
                    })
                    .map((cat) => {
                      const catSkills = taxonomy.skills.filter((s) => s.category_id === cat.id).filter(
                        (s) => !q || matchesDomain || cat.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
                      )
                      const catOpen = openCategories.has(cat.id) || !!q

                      return (
                        <div key={cat.id}>
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            {catOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            {cat.name}
                          </button>

                          {catOpen && (
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {catSkills.map((skill) => {
                                const owned = ownedSkillIds.has(skill.id)
                                return (
                                  <li key={skill.id} className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent/50">
                                    <span className={cn(owned && 'text-muted-foreground')}>{skill.name}</span>
                                    {owned ? (
                                      <Check size={14} className="text-primary" />
                                    ) : (
                                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onAdd(skill)}>
                                        <Plus size={12} />
                                      </Button>
                                    )}
                                  </li>
                                )
                              })}
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
    </div>
  )
}
