// ─────────────────────────────────────────────────────────────────────────
// One part of a home — its units, its photos, its amenities.
//
// Two shapes, chosen by the section config:
//
//   · a join table becomes a grid of on/off chips. The row carries nothing but
//     a key, so "edit" is meaningless and only "is it there" matters. This also
//     makes a duplicate or a misspelled key impossible rather than merely
//     detectable.
//
//   · everything else becomes a list of collapsed rows, each opening into the
//     full field set. Collapsed, a row shows the columns that identify it; open,
//     it shows every column with its own validation.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Row } from "@/db/types"
import { fieldsOf, problemCountOf } from "../fields"
import type { SectionSpec } from "../sections"
import type { ScopedRow } from "../propertyScope"
import { RowFields } from "./RowFields"

const CHIP =
  "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

/** "Master bedroom · room · 18,000" — enough to tell rows apart. */
const summarise = (spec: SectionSpec, row: Row): string => {
  const parts = spec.summary
    .map((column) => row[column])
    .filter((value) => Boolean(value?.trim()))
  return parts.length > 0 ? parts.join(" · ") : "(empty row)"
}

export const ChildSection = ({
  spec,
  rows,
  editedIndices,
  onChange,
  onAdd,
  onRemove,
  onToggle,
  onGenerateId,
}: {
  spec: SectionSpec
  rows: ScopedRow[]
  editedIndices: Set<number>
  onChange: (globalIndex: number, column: string, value: string) => void
  onAdd: () => void
  onRemove: (globalIndex: number) => void
  /** Join tables only: turn a key on or off. */
  onToggle?: (key: string, on: boolean) => void
  /** Tables with their own id: fill one row's blank id. */
  onGenerateId?: (globalIndex: number) => void
}) => {
  const [open, setOpen] = useState<number | null>(null)

  const problems = rows.reduce(
    (sum, entry) => sum + problemCountOf(spec.table, entry.row),
    0
  )

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-neutral-500 bg-white shadow-[4px_4px_0px_#000]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-500 px-6 py-5">
        <div className="max-w-160">
          <h3 className="bricolage-grotesque-500 text-lg leading-tight tracking-tight">
            {spec.title}
            <span className="ml-2.5 font-mono text-[11px] font-normal text-black/60 tabular-nums">
              {rows.length}
            </span>
          </h3>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-black/60">
            {spec.blurb}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {problems > 0 && (
            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-[0.14em] text-red-700 uppercase">
              {problems} to fix
            </span>
          )}
          {!spec.toggle && (
            <button
              type="button"
              onClick={onAdd}
              className={cn(
                CHIP,
                "inline-flex items-center gap-1.5 border-neutral-500 -translate-x-0.5 -translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none shadow-[3px_3px_0px_#000] transition-all"
              )}
            >
              <PlusIcon size={13} aria-hidden /> {spec.addLabel}
            </button>
          )}
        </div>
      </header>

      {spec.toggle ? (
        <ToggleGrid spec={spec} rows={rows} onToggle={onToggle} />
      ) : rows.length === 0 ? (
        <p className="px-6 py-7 font-mono text-[11px] leading-relaxed text-black/60">
          {spec.empty}
        </p>
      ) : (
        <ul>
          {rows.map((entry) => {
            const isOpen = open === entry.index
            const rowProblems = problemCountOf(spec.table, entry.row)
            const edited = editedIndices.has(entry.index)

            return (
              <li
                key={`${spec.table}-${entry.index}`}
                className="border-b border-neutral-200 last:border-b-0"
              >
                <div className="flex items-center gap-2 px-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : entry.index)}
                    className={cn(
                      "flex flex-1 items-center gap-2.5 py-3.5 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black"
                    )}
                  >
                    {isOpen ? (
                      <ChevronDownIcon
                        size={14}
                        aria-hidden
                        className="shrink-0"
                      />
                    ) : (
                      <ChevronRightIcon
                        size={14}
                        aria-hidden
                        className="shrink-0"
                      />
                    )}
                    <span className="truncate font-mono text-[12px]">
                      {summarise(spec, entry.row)}
                    </span>
                    {edited && (
                      <span className="shrink-0 rounded-full border border-black/10 bg-amber-400 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em] uppercase">
                        Draft
                      </span>
                    )}
                    {rowProblems > 0 && (
                      <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-red-700 tabular-nums">
                        {rowProblems}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove "${summarise(spec, entry.row)}"?`
                        )
                      ) {
                        onRemove(entry.index)
                        setOpen(null)
                      }
                    }}
                    aria-label={`Remove ${summarise(spec, entry.row)}`}
                    className={cn(
                      // CHIP,
                      "shrink-0 border-neutral-300 bg-white hover:border-red-700 hover:bg-red-700 hover:text-white p-3 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    )}
                  >
                    <Trash2Icon size={13} aria-hidden />
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-6">
                    <RowFields
                      table={spec.table}
                      row={entry.row}
                      columns={2}
                      onChange={(column, value) =>
                        onChange(entry.index, column, value)
                      }
                      onGenerateId={
                        onGenerateId
                          ? () => onGenerateId(entry.index)
                          : undefined
                      }
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** A join table, as on/off chips over the model's own enum. */
const ToggleGrid = ({
  spec,
  rows,
  onToggle,
}: {
  spec: SectionSpec
  rows: ScopedRow[]
  onToggle?: (key: string, on: boolean) => void
}) => {
  const column = spec.toggle!
  const options =
    fieldsOf(spec.table).find((field) => field.name === column)?.options ?? []
  const chosen = new Set(rows.map((entry) => entry.row[column]).filter(Boolean))

  return (
    <div className="flex flex-wrap gap-2 p-6">
      {options.map((option) => {
        const on = chosen.has(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle?.(option, !on)}
            className={cn(
              CHIP,
              on
                ? "border-neutral-500 bg-amber-400"
                : "border-neutral-300 bg-white text-black/60 hover:border-black/40 hover:text-black"
            )}
          >
            {option.replace(/_/g, " ")}
          </button>
        )
      })}
    </div>
  )
}
