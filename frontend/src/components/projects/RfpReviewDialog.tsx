import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface RfpReviewDialogProps {
  data: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export function RfpReviewDialog({ data, onSubmit, onClose }: RfpReviewDialogProps) {
  const [formData, setFormData] = useState(data)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const FIELD_LABELS: Record<string, string> = {
    title: 'Project Title',
    client_name: 'Client Name',
    domain: 'Domain',
    project_type: 'Project Type',
    required_skills: 'Required Skills',
    team_size: 'Team Size',
    timeline: 'Timeline',
    budget_range: 'Budget Range',
    tech_stack: 'Tech Stack',
    deliverables: 'Deliverables',
    compliance_requirements: 'Compliance Requirements',
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-card border-b border-border p-6">
          <h2 className="text-lg font-semibold">Review RFP Extraction</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {Object.entries(formData).map(([key, value]) => {
            if (value === null || value === undefined) return null
            const label = FIELD_LABELS[key] ?? key.replace(/_/g, ' ')

            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {label}
                  </label>
                  <textarea
                    value={value.join('\n')}
                    onChange={(e) =>
                      handleChange(
                        key,
                        e.target.value
                          .split('\n')
                          .filter((v) => v.trim())
                      )
                    }
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              )
            }

            if (typeof value === 'object') {
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {label}
                  </label>
                  <textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) => {
                      try {
                        handleChange(key, JSON.parse(e.target.value))
                      } catch {
                        // Allow invalid JSON while typing
                      }
                    }}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>
              )
            }

            return (
              <div key={key}>
                <label className="text-sm font-medium text-foreground block mb-2">
                  {label}
                </label>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-card p-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Apply to Project'}
          </Button>
        </div>
      </div>
    </div>
  )
}
