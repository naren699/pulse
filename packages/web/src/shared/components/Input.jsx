export function Field({ label, error, helper, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block font-display text-xs font-semibold tracking-[0.06em] text-text-secondary">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 animate-fade-slide-up text-xs font-medium text-danger/80">⚠️ {error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-text-tertiary">{helper}</p>
      ) : null}
    </div>
  )
}

const errorRing = 'border-danger/50 bg-danger/[0.06] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'

export function Input({ label, error, helper, className = '', ...props }) {
  return (
    <Field label={label} error={error} helper={helper}>
      <input className={`field-glass min-h-[46px] ${error ? errorRing : ''} ${className}`} {...props} />
    </Field>
  )
}

export function Textarea({ label, error, helper, className = '', ...props }) {
  return (
    <Field label={label} error={error} helper={helper}>
      <textarea
        className={`field-glass min-h-[120px] resize-y leading-relaxed ${error ? errorRing : ''} ${className}`}
        {...props}
      />
    </Field>
  )
}

export function Select({ label, error, helper, children, className = '', ...props }) {
  return (
    <Field label={label} error={error} helper={helper}>
      <select
        className={`field-glass min-h-[46px] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238B94AB%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_14px_center] bg-no-repeat pr-10 ${error ? errorRing : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}
