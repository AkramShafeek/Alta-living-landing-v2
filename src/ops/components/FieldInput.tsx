// ─────────────────────────────────────────────────────────────────────────
// One cell, edited.
//
// The control is chosen by the model, not by this file — see ops/fields.ts.
// The rule it exists to enforce: where the set of right answers is enumerable,
// ops picks from it rather than typing it. Every enum column in the catalog is
// a dropdown here, which is most of `properties`.
// ─────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils"
import type { Field } from "../fields"

const LABEL = "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"

const CONTROL =
  "w-full border-2 border-black bg-white px-3 py-2 font-mono text-[13px] " +
  "focus:outline-2 focus:-outline-offset-4 focus:outline-black"

export const FieldInput = ({
  field,
  value,
  problem,
  onChange,
}: {
  field: Field
  value: string
  problem?: string
  onChange: (value: string) => void
}) => {
  const id = `field-${field.name}`
  const describedBy = problem
    ? `${id}-problem`
    : field.hint
      ? `${id}-hint`
      : undefined

  const invalid = Boolean(problem)
  const controlClass = cn(CONTROL, invalid && "border-red-700 bg-red-50")

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn(LABEL, "flex items-baseline gap-2")}>
        {field.name}
        {field.required && (
          <span
            className="tracking-normal text-red-700 normal-case"
            title="Required"
          >
            required
          </span>
        )}
      </label>

      {field.kind === "paragraph" ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={cn(controlClass, "resize-y leading-relaxed")}
        />
      ) : field.kind === "enum" ? (
        <select
          id={id}
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        >
          {/* Present even on a required field: a blank is what the sheet holds
              today, and hiding it would silently rewrite the cell on open. */}
          <option value="">— blank —</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.kind === "boolean" ? (
        <select
          id={id}
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        >
          <option value="">— blank —</option>
          <option value="TRUE">TRUE</option>
          <option value="FALSE">FALSE</option>
        </select>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          // Not type="number" or type="date": the cell is a sheet string, and a
          // native number input would reject "12,000" and a native date input
          // would impose its own format on a dd/mm/yyyy column.
          inputMode={field.kind === "number" ? "decimal" : undefined}
          className={controlClass}
        />
      )}

      {problem ? (
        <p
          id={`${id}-problem`}
          className="font-mono text-[11px] leading-snug text-red-700"
        >
          {problem}
        </p>
      ) : field.hint ? (
        <p
          id={`${id}-hint`}
          className="font-mono text-[11px] leading-snug text-black/60"
        >
          {field.hint}
        </p>
      ) : null}
    </div>
  )
}
