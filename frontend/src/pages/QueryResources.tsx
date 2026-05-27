import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Star, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useMatching, useWishList } from '@/hooks/useMatching'
import { useProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { SENIORITY_LABELS } from '@/types'

const scoreColor = (s: number) =>
  s >= 75 ? 'text-green-600 dark:text-green-400' : s >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'

const barColor = (s: number) =>
  s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-yellow-500' : 'bg-red-500'

export function QueryResources() {
  const { id } = useParams<{ id: string }>()
  const { project, loading: projLoading } = useProject(id)
  const { results, loading: matching, ran, runMatch, getExplanation } = useMatching(id!)
  const { wishList, fetch: fetchWishList, add: addToWishList, remove: removeFromWishList } = useWishList(id!)

  const [expanded, setExpanded] = useState<string | null>(null)
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [loadingExplain, setLoadingExplain] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0)
  const [wishListSet, setWishListSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchWishList()
  }, [])

  useEffect(() => {
    setWishListSet(new Set(wishList.map((w) => w.user_id)))
  }, [wishList])

  const filtered = results.filter((r) => r.score >= minScore)

  const handleExplain = async (empId: string) => {
    if (explanations[empId]) return
    setLoadingExplain(empId)
    try {
      const text = await getExplanation(empId)
      setExplanations((prev) => ({ ...prev, [empId]: text }))
    } finally {
      setLoadingExplain(null)
    }
  }

  const toggleWishList = async (empId: string, score: number) => {
    if (wishListSet.has(empId)) {
      await removeFromWishList(empId)
    } else {
      await addToWishList(empId, score, explanations[empId])
    }
  }

  if (projLoading) return <p className="text-muted-foreground">Loading...</p>
  if (!project) return <p className="text-muted-foreground">Project not found.</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${id}`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Query Resources</h1>
            <p className="text-sm text-muted-foreground">{project.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ran && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Min score:</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-24"
              />
              <span className="w-8 text-right">{minScore}%</span>
            </div>
          )}
          <Button onClick={runMatch} disabled={matching}>
            <Play size={13} className="mr-1" />
            {matching ? 'Matching...' : ran ? 'Re-run' : 'Run Matching'}
          </Button>
        </div>
      </div>

      {!ran && !matching && (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
          <p className="text-muted-foreground">Click <strong>Run Matching</strong> to score all employees against this project's requirements.</p>
        </div>
      )}

      {matching && (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-border">
          <p className="text-muted-foreground">Scoring employees...</p>
        </div>
      )}

      {ran && !matching && (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {results.length} employees shown
            {wishList.length > 0 && ` · ${wishList.length} on wish list`}
          </p>
          <div className="space-y-3">
            {filtered.map((r, i) => {
              const isExpanded = expanded === r.employee_id
              const onWishList = wishListSet.has(r.employee_id)

              return (
                <div key={r.employee_id} className="rounded-lg border border-border bg-card">
                  {/* Row */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={r.employee.avatar_url} />
                      <AvatarFallback className="text-xs">{getInitials(r.employee.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{r.employee.full_name}</p>
                        {r.employee.job_title && (
                          <span className="text-xs text-muted-foreground truncate">· {r.employee.job_title}</span>
                        )}
                      </div>
                      {/* Score bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${barColor(r.score)}`} style={{ width: `${r.score}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${scoreColor(r.score)}`}>{r.score}%</span>
                        <span className="text-xs text-muted-foreground">avail: {Math.round(r.available_pct)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWishList(r.employee_id, r.score)}
                        className={`transition-colors ${onWishList ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                        title={onWishList ? 'Remove from wish list' : 'Add to wish list'}
                      >
                        {onWishList ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setExpanded(isExpanded ? null : r.employee_id)
                          if (!isExpanded) handleExplain(r.employee_id)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-4 space-y-4">
                      {/* Breakdown bars */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {Object.entries(r.breakdown).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="w-32 shrink-0 text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${barColor(val)}`} style={{ width: `${val}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs">{Math.round(val)}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Skill details */}
                      {r.skill_details.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {r.skill_details.map((sd) => (
                              <div key={sd.skill_id} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${sd.met ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400' : 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400'}`}>
                                <span>{sd.met ? '✓' : '✗'}</span>
                                <span>{sd.skill_id}</span>
                                <span className="opacity-60">{SENIORITY_LABELS[sd.required_level]} req / {sd.employee_level > 0 ? SENIORITY_LABELS[sd.employee_level] : 'none'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI explanation */}
                      <div className="rounded-lg bg-muted/40 px-4 py-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Sparkles size={12} />AI Explanation
                        </div>
                        {loadingExplain === r.employee_id ? (
                          <p className="text-sm text-muted-foreground">Generating explanation...</p>
                        ) : explanations[r.employee_id] ? (
                          <p className="text-sm leading-relaxed">{explanations[r.employee_id]}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Expand to generate AI explanation.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/employees/${r.employee_id}`} className="text-xs text-primary hover:underline">
                          View profile →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
