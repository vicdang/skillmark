import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { useEmployeeSkills } from '@/hooks/useEmployeeSkills'
import { useSkillTaxonomy } from '@/hooks/useSkillTaxonomy'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SkillLevelBadge } from '@/components/skills/SkillLevelBadge'
import { SkillRadar } from '@/components/charts/SkillRadar'
import { getInitials } from '@/lib/utils'
import type { User } from '@/types'

export function Compare() {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((s) => s.user)

  const { user: other, loading: otherLoading } = useUser(id)
  const { skills: mySkills, loading: myLoading } = useEmployeeSkills(currentUser?.id)
  const { skills: otherSkills, loading: otherSkillsLoading } = useEmployeeSkills(id)
  const taxonomy = useSkillTaxonomy()

  const [showAll, setShowAll] = useState(false)

  if (!currentUser || otherLoading || myLoading || otherSkillsLoading) {
    return <p className="text-muted-foreground">Loading...</p>
  }
  if (!other) return <p className="text-destructive">User not found</p>

  // Build skill maps
  const myMap = new Map(mySkills.map((s) => [s.skill_id, s.level]))
  const otherMap = new Map(otherSkills.map((s) => [s.skill_id, s.level]))

  const allSkillIds = showAll
    ? Array.from(new Set([...myMap.keys(), ...otherMap.keys()]))
    : Array.from(myMap.keys()).filter((id) => otherMap.has(id))

  // Radar data per domain
  const radarDomains = taxonomy.domains.filter((d) => {
    const cats = taxonomy.categories.filter((c) => c.domain_id === d.id)
    return allSkillIds.some((sid) => {
      const skill = taxonomy.skills.find((s) => s.id === sid)
      return skill && cats.some((c) => c.id === skill.category_id)
    })
  })

  const buildDomainAvg = (skillMap: Map<string, number>) => {
    const result: Record<string, number> = {}
    for (const domain of radarDomains) {
      const cats = taxonomy.categories.filter((c) => c.domain_id === domain.id)
      const vals = allSkillIds
        .filter((sid) => {
          const skill = taxonomy.skills.find((s) => s.id === sid)
          return skill && cats.some((c) => c.id === skill.category_id) && skillMap.has(sid)
        })
        .map((sid) => skillMap.get(sid) ?? 0)
      if (vals.length > 0) result[domain.name] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
    return result
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/employees/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Skill Comparison</h1>
      </div>

      {/* Header: both users */}
      <div className="grid grid-cols-2 gap-4">
        {([currentUser, other] as User[]).map((u, idx) => (
          <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={u.avatar_url} />
              <AvatarFallback>{getInitials(u.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{u.full_name} {idx === 0 && '(you)'}</p>
              <p className="text-xs text-muted-foreground">{u.job_title ?? u.role}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {showAll ? 'All skills' : 'Common skills only'}
        </span>
        <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show common only' : 'Show all skills'}
        </Button>
      </div>

      <Tabs defaultValue="radar">
        <TabsList>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="table">Detail Table</TabsTrigger>
        </TabsList>

        {/* Radar view */}
        <TabsContent value="radar" className="rounded-lg border border-border bg-card p-4">
          {radarDomains.length < 3 ? (
            <p className="text-center text-muted-foreground py-8">Need at least 3 domains with shared skills for radar chart.</p>
          ) : (
            <SkillRadar
              domains={radarDomains.map((d) => d.name)}
              series={[
                { name: currentUser.full_name, color: 'hsl(var(--primary))', data: buildDomainAvg(myMap) },
                { name: other.full_name, color: '#f97316', data: buildDomainAvg(otherMap) },
              ]}
              height={380}
            />
          )}
        </TabsContent>

        {/* Table view */}
        <TabsContent value="table">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Skill</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">{currentUser.full_name}</th>
                  <th className="px-4 py-3 text-center font-medium">Δ</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">{other.full_name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allSkillIds.map((skillId) => {
                  const skill = taxonomy.skills.find((s) => s.id === skillId)
                  const myLevel = myMap.get(skillId)
                  const otherLevel = otherMap.get(skillId)
                  const delta = (myLevel ?? 0) - (otherLevel ?? 0)
                  return (
                    <tr key={skillId} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{skill?.name ?? skillId}</td>
                      <td className="px-4 py-2.5 text-center">
                        {myLevel ? <SkillLevelBadge level={myLevel} /> : <span className="text-xs text-muted-foreground">N/A</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {delta === 0 ? (
                          <Minus size={14} className="mx-auto text-muted-foreground" />
                        ) : delta > 0 ? (
                          <ArrowUp size={14} className="mx-auto text-green-500" />
                        ) : (
                          <ArrowDown size={14} className="mx-auto text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {otherLevel ? <SkillLevelBadge level={otherLevel} /> : <span className="text-xs text-muted-foreground">N/A</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
