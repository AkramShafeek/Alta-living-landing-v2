/// <reference types="vite/client" />

/**
 * Typed env, so a misspelled switch is a compile error rather than a table that
 * quietly keeps serving its fixture.
 *
 * One entry per table, matching the reads in db/config.ts — see the comment
 * there for why these cannot be generated from the table names.
 */
interface ImportMetaEnv {
  /** The `2PACX-…` id from File > Share > Publish to web. */
  readonly VITE_SHEET_PUB_ID?: string

  /** Default for any table without its own switch. "mock" | "sheets". */
  readonly VITE_DB_SOURCE?: string

  readonly VITE_DB_SOURCE_PROPERTIES?: string
  readonly VITE_DB_SOURCE_UNITS?: string
  readonly VITE_DB_SOURCE_PHOTOS?: string
  readonly VITE_DB_SOURCE_REVIEWS?: string
  readonly VITE_DB_SOURCE_NEARBY?: string
  readonly VITE_DB_SOURCE_AMENITIES?: string
  readonly VITE_DB_SOURCE_INCLUDED?: string
  readonly VITE_DB_SOURCE_NOT_INCLUDED?: string
  readonly VITE_DB_SOURCE_HOUSEKEEPING?: string
  readonly VITE_DB_SOURCE_HIGHLIGHTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
