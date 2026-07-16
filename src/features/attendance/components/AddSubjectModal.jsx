import { useEffect, useState } from 'react'
import Modal from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input, Field } from '../../../shared/components/Input'

const PALETTE = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16']

export default function AddSubjectModal({ isOpen, onClose, onSubmit, initial = null }) {
  const [name, setName] = useState('')
  const [targetPercent, setTargetPercent] = useState(80)
  const [colorAccent, setColorAccent] = useState(PALETTE[0])
  const [presentCount, setPresentCount] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name || '')
      setTargetPercent(initial?.targetPercent ?? 80)
      setColorAccent(initial?.colorAccent || PALETTE[Math.floor(Math.random() * PALETTE.length)])
      setPresentCount(initial?.presentCount ?? 0)
      setTotalSessions(initial?.totalSessions ?? 0)
      setErrors({})
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!name || name.trim().length < 2) next.name = 'Subject name is required (min 2 characters).'
    const target = Number(targetPercent)
    if (Number.isNaN(target) || target < 0 || target > 100) next.targetPercent = 'Target must be between 0 and 100.'
    const present = Number(presentCount)
    const total = Number(totalSessions)
    if (Number.isNaN(present) || present < 0) next.presentCount = 'Must be 0 or more.'
    if (Number.isNaN(total) || total < 0) next.totalSessions = 'Must be 0 or more.'
    if (!next.presentCount && !next.totalSessions && present > total) {
      next.presentCount = "Attended can't exceed total classes conducted."
      next.totalSessions = "Total must be at least the attended count."
    }
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), targetPercent: target, colorAccent, presentCount: present, totalSessions: total })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Subject' : 'Add New Subject'}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Subject Name"
          placeholder="e.g. Data Structures"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />
        <Input
          label="Target %"
          type="number"
          min="0"
          max="100"
          value={targetPercent}
          onChange={(e) => setTargetPercent(e.target.value)}
          error={errors.targetPercent}
        />
        <div className="mb-1 grid grid-cols-2 gap-3">
          <Input
            label="Classes Attended"
            type="number"
            min="0"
            value={presentCount}
            onChange={(e) => setPresentCount(e.target.value)}
            error={errors.presentCount}
          />
          <Input
            label="Total Classes Conducted"
            type="number"
            min="0"
            value={totalSessions}
            onChange={(e) => setTotalSessions(e.target.value)}
            error={errors.totalSessions}
          />
        </div>
        <p className="mb-4 -mt-2 text-xs text-text-subtle">
          These are the exact numbers shown on the card — edit them any time to correct your attendance.
        </p>
        <Field label="Color Accent">
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorAccent(c)}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                  colorAccent === c ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-bg-secondary' : ''
                }`}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {initial ? 'Save Changes' : 'Add Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
