import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkillLevelPicker } from './SkillLevelPicker'
import type { EmployeeSkill, Skill } from '@/types'

interface AddProps {
  mode: 'add'
  skill: Skill
  onSubmit: (data: { skill_id: string; level: number; years_experience?: number; evidence_url?: string; evidence_note?: string }) => Promise<void>
  onClose: () => void
}

interface EditProps {
  mode: 'edit'
  employeeSkill: EmployeeSkill
  onSubmit: (data: { level: number; years_experience?: number; evidence_url?: string; evidence_note?: string }) => Promise<void>
  onClose: () => void
}

type Props = AddProps | EditProps

export function SkillFormDialog(props: Props) {
  const { t } = useTranslation()
  const isEdit = props.mode === 'edit'
  const initial = isEdit ? props.employeeSkill : null

  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>((initial?.level ?? 3) as 1 | 2 | 3 | 4 | 5)
  const [years, setYears] = useState(String(initial?.years_experience ?? ''))
  const [evidenceUrl, setEvidenceUrl] = useState(initial?.evidence_url ?? '')
  const [evidenceNote, setEvidenceNote] = useState(initial?.evidence_note ?? '')
  const [saving, setSaving] = useState(false)

  const skillName = isEdit ? initial?.skill?.name ?? '' : (props as AddProps).skill.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        level,
        years_experience: years ? parseFloat(years) : undefined,
        evidence_url: evidenceUrl || undefined,
        evidence_note: evidenceNote || undefined,
      }
      if (isEdit) {
        await (props as EditProps).onSubmit(payload)
      } else {
        await (props as AddProps).onSubmit({ skill_id: (props as AddProps).skill.id, ...payload })
      }
      props.onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) props.onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('skills.editSkill') : t('skills.addSkill')} — {skillName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>{t('skills.level')}</Label>
            <SkillLevelPicker value={level} onChange={setLevel} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="years">{t('skills.yearsExperience')}</Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={40}
              step={0.5}
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="evidenceUrl">{t('skills.evidence')} URL</Label>
            <Input
              id="evidenceUrl"
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="evidenceNote">{t('skills.evidence')} Note</Label>
            <Input
              id="evidenceNote"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="Describe your evidence..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={props.onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
