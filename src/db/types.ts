// ─────────────────────────────────────────────────────────────────────────
// Primitives shared across the db layer.
// ─────────────────────────────────────────────────────────────────────────

/** One raw table row, exactly as a sheet hands it over — every cell a string. */
export type Row = Record<string, string>

/** The table could not be read: bad driver, network, malformed file. */
export class DbError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "DbError"
  }
}

/**
 * A row was read but does not match its model. Names the table and the offending
 * row, because "expected number, received NaN" with no address is unactionable
 * when ops has 60 columns to look through.
 */
export class RowValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RowValidationError"
  }
}
