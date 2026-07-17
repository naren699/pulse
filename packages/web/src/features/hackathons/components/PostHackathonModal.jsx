import { useEffect, useState } from 'react'
import Modal from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input, Textarea, Field } from '../../../shared/components/Input'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function validate(form, imageFile) {
  const errors = {}
  if (!form.title || form.title.trim().length < 5) errors.title = 'Title is required (min 5 characters).'
  if (form.title.length > 100) errors.title = 'Title must be under 100 characters.'
  if (!form.description || form.description.trim().length < 20) errors.description = 'Description is required (min 20 characters).'
  if (form.description.length > 2000) errors.description = 'Description must be under 2000 characters.'
  if (!form.startAt) errors.startAt = 'Start date is required.'
  try {
    const url = new URL(form.registrationLink)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
  } catch {
    errors.registrationLink = 'Enter a valid registration URL.'
  }
  if (imageFile && imageFile.size > MAX_IMAGE_BYTES) errors.image = 'Image must be under 5MB.'
  return errors
}

const INITIAL = {
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  registrationDeadline: '',
  registrationLink: '',
  location: '',
  payment: '',
  websiteUrl: '',
  tags: '',
}

function toDateTimeLocal(value) {
  if (!value) return ''
  const d = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PostHackathonModal({ isOpen, onClose, onSubmit, hackathon = null }) {
  const isEdit = Boolean(hackathon)
  const [form, setForm] = useState(INITIAL)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (hackathon) {
      setForm({
        title: hackathon.title || '',
        description: hackathon.description || '',
        startAt: toDateTimeLocal(hackathon.startAt),
        endAt: toDateTimeLocal(hackathon.endAt),
        registrationDeadline: toDateTimeLocal(hackathon.registrationDeadline),
        registrationLink: hackathon.registrationLink || '',
        location: hackathon.location || '',
        payment: hackathon.payment || '',
        websiteUrl: hackathon.websiteUrl || '',
        tags: (hackathon.tags || []).join(', '),
      })
    } else {
      setForm(INITIAL)
    }
    setImageFile(null)
    setPreview(null)
    setErrors({})
  }, [isOpen, hackathon])

  useEffect(() => {
    if (!imageFile) return setPreview(null)
    const url = URL.createObjectURL(imageFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate(form, imageFile)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSubmit(
        {
          ...form,
          startAt: new Date(form.startAt),
          endAt: form.endAt ? new Date(form.endAt) : null,
          registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
        imageFile,
      )
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Hackathon' : 'Post New Hackathon'} maxWidth="max-w-[560px]">
      <form onSubmit={handleSubmit}>
        <Input label="Title" placeholder="Web3 Hackathon 2026" value={form.title} onChange={set('title')} error={errors.title} maxLength={100} />
        <Textarea
          label="Description"
          placeholder="What's this hackathon about? (supports markdown)"
          value={form.description}
          onChange={set('description')}
          error={errors.description}
          maxLength={2000}
        />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Start Date & Time" type="datetime-local" value={form.startAt} onChange={set('startAt')} error={errors.startAt} />
          <Input label="End Date & Time" type="datetime-local" value={form.endAt} onChange={set('endAt')} helper="Optional" />
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Registration Deadline" type="datetime-local" value={form.registrationDeadline} onChange={set('registrationDeadline')} helper="Optional" />
          <Input label="Location" placeholder="Online / Chennai" value={form.location} onChange={set('location')} helper="Optional" />
        </div>
        <Input
          label="Registration Link"
          type="url"
          placeholder="https://devfolio.co/…"
          value={form.registrationLink}
          onChange={set('registrationLink')}
          error={errors.registrationLink}
        />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Payment" placeholder="Free / ₹500" value={form.payment} onChange={set('payment')} helper="Optional" />
          <Input label="Website" type="url" placeholder="https://event-site.com" value={form.websiteUrl} onChange={set('websiteUrl')} helper="Optional" />
        </div>
        <Input
          label="Tags"
          placeholder="Web3, React, Smart Contracts"
          value={form.tags}
          onChange={set('tags')}
          helper="Comma-separated"
        />
        <Field label="Cover Image" error={errors.image} helper={!preview ? 'Optional · JPG/PNG/WebP, max 5MB' : undefined}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-text-tertiary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/20 file:px-4 file:py-2 file:font-display file:text-xs file:font-semibold file:text-indigo-300 hover:file:bg-primary/30"
          />
          {preview && <img src={preview} alt="Cover preview" className="mt-3 h-28 w-full rounded-lg object-cover" />}
        </Field>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Save Changes' : 'Post Hackathon'}</Button>
        </div>
      </form>
    </Modal>
  )
}
