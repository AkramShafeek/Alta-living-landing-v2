// ─────────────────────────────────────────────────────────────────────────
// Every column of one row, as controls.
//
// Shared by the home's own form and by each child section, so a `units` row and
// a `properties` row are edited by the same code with the same validation.
//
// Long tables are divided into the groups in ops/fieldGroups.ts. The division
// is a hairline and a label inside one continuous panel — not a set of cards,
// and not separate forms. Someone filling in a home is thinking in chunks, but
// they are still filling in one thing.
//
// A table with no groups declared renders flat, in the order the model declares
// its columns, which is the order they sit in the sheet.
// ─────────────────────────────────────────────────────────────────────────

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TableName } from "@/db/config"
import type { Row } from "@/db/types"
import { checkRow, fieldsOf, type Field } from "../fields"
import { bool } from "@/db/coerce"
import { FIELD_GROUPS, OTHER_GROUP, SHOWN_WHEN } from "../fieldGroups"
import { MANAGED_COLUMNS } from "../sections"
import { FieldInput } from "./FieldInput"

type Columns = 2 | 3

/**
 * The form's sections, in display order.
 *
 * Built from the live field list rather than from the group config, so a column
 * the config forgot still appears — under "Other" — instead of disappearing
 * from the editor. Losing a field silently is the failure worth engineering
 * against here; an ugly trailing group is not.
 */
function groupFields(
  table: TableName,
  fields: Field[]
): { title: string; fields: Field[] }[] {
  const groups = FIELD_GROUPS[table]
  if (!groups) return [{ title: "", fields }]

  const byName = new Map(fields.map((field) => [field.name, field]))
  const placed = new Set<string>()

  const sections = groups.map((group) => {
    const found = group.fields
      .map((name) => byName.get(name))
      .filter((field): field is Field => Boolean(field))

    for (const field of found) placed.add(field.name)
    return { title: group.title, fields: found }
  })

  const leftovers = fields.filter((field) => !placed.has(field.name))
  if (leftovers.length > 0)
    sections.push({ title: OTHER_GROUP, fields: leftovers })

  return sections.filter((section) => section.fields.length > 0)
}

const FieldGrid = ({
  table,
  row,
  fields,
  problems,
  columns,
  onChange,
  onGenerateId,
}: {
  table: TableName
  row: Row
  fields: Field[]
  problems: Record<string, string>
  columns: Columns
  onChange: (column: string, value: string) => void
  onGenerateId?: () => void
}) => (
  <div
    className={cn(
      "grid gap-6",
      columns === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"
    )}
  >
    {fields.map((field) => (
      <div
        key={`${table}-${field.name}`}
        className={cn(
          field.kind === "paragraph" &&
            (columns === 3 ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2")
        )}
      >
        <FieldInput
          field={field}
          value={row[field.name] ?? ""}
          problem={problems[field.name]}
          onChange={(value) => onChange(field.name, value)}
          onGenerate={field.name === "id" ? onGenerateId : undefined}
        />
      </div>
    ))}
  </div>
)

export const RowFields = ({
  table,
  row,
  onChange,
  onGenerateId,
  columns = 3,
}: {
  table: TableName
  row: Row
  onChange: (column: string, value: string) => void
  /** Fills a blank `id` cell. Absent where ids are not generated. */
  onGenerateId?: () => void
  /** Widest column count; sections in a narrower panel pass fewer. */
  columns?: Columns
}) => {
  const allFields = useMemo(
    () => fieldsOf(table).filter((field) => !MANAGED_COLUMNS.has(field.name)),
    [table]
  )

  const problems = checkRow(table, row)

  // Per row, not per table: whether a replica count applies depends on this
  // row's own `hasReplicas`. A gated field that holds a bad value stays on
  // screen even when switched off — the db rejects the row either way, and a
  // problem ops cannot see is a problem ops cannot fix.
  const conditions = SHOWN_WHEN[table]
  const fields = conditions
    ? allFields.filter((field) => {
        const gate = conditions[field.name]
        return !gate || bool(row[gate]) === true || Boolean(problems[field.name])
      })
    : allFields
  const sections = groupFields(table, fields)

  // One group and no title is the ungrouped case — render the grid on its own
  // rather than wrapping it in a section with an empty heading.
  if (sections.length === 1 && sections[0].title === "") {
    return (
      <FieldGrid
        table={table}
        row={row}
        fields={fields}
        problems={problems}
        columns={columns}
        onChange={onChange}
        onGenerateId={onGenerateId}
      />
    )
  }

  return (
    <div>
      {sections.map((section, index) => {
        const broken = section.fields.filter(
          (field) => problems[field.name]
        ).length

        return (
          <section
            key={section.title}
            className={cn(index > 0 && "mt-8 border-t border-neutral-200 pt-8")}
          >
            <h4 className="mb-5 flex items-baseline gap-2.5 text-sm font-semibold text-muted-foreground uppercase">
              {section.title}
              {broken > 0 && (
                <span className="tracking-[0.14em] text-red-700">
                  {broken} to fix
                </span>
              )}
            </h4>

            <FieldGrid
              table={table}
              row={row}
              fields={section.fields}
              problems={problems}
              columns={columns}
              onChange={onChange}
        onGenerateId={onGenerateId}
            />
          </section>
        )
      })}
    </div>
  )
}
