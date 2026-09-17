// ─────────────────────────────────────────────────────────────────────────
// The Google Sheets driver.
//
// Reads one published tab over HTTP and hands back raw rows. It knows about
// URLs and failure modes; it does not know what a property is.
//
// "Published to web" rather than the Sheets API, because the catalog is public
// data and an API key in a client bundle is not a secret — it is a quota someone
// else can spend. The trade is that a published tab is world-readable, so
// nothing with a phone number in it gets published (see `hosts`).
//
// Two things about this endpoint worth knowing before debugging it:
//
//   - Google edge-caches the response for about five minutes (max-age=300), so
//     an ops edit does not appear immediately. That is a property of the
//     endpoint, not of the cache in db.ts.
//   - It answers CORS from the browser (the redirect echoes Origin, the file
//     itself sends `*`), so this works from the client with no proxy.
// ─────────────────────────────────────────────────────────────────────────

import { rowsFromCsv } from "./csv"
import { DbError, type Row } from "./types"

/**
 * Builds the CSV URL for one tab.
 *
 * `pubId` is the `2PACX-…` string from Publish to web — *not* the spreadsheet
 * id in the editing URL. They look similar enough to swap by accident and the
 * mistake reads as a 404.
 *
 * An empty `gid` means "whole-document publish", which serves the first tab.
 * That is a real configuration — it is how the sheet is published today — but
 * it is only correct for one table, so the registry comments say which.
 */
export function csvUrl(pubId: string, gid: string): string {
  const base = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv`
  return gid === "" ? base : `${base}&gid=${gid}&single=true`
}

/**
 * Long enough that a slow connection still succeeds, short enough that a hung
 * one becomes a visible error rather than a spinner that never resolves.
 */
const FETCH_TIMEOUT_MS = 10_000

/** A published-but-wrong URL answers with an HTML error page, not a 404. */
const looksLikeHtml = (text: string): boolean =>
  text.trimStart().startsWith("<")

/**
 * Fetches and parses one tab.
 *
 * The HTML check earns its place: an unpublished tab, a gid from a different
 * spreadsheet, or a revoked publish all return 200 with a login or error page.
 * Without it the first parsed "row" is a fragment of HTML and the failure
 * surfaces as a Zod complaint about a column nobody touched.
 */
export async function fetchTable(
  tableName: string,
  url: string
): Promise<Row[]> {
  let response: Response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch (cause) {
    // A timeout is the one failure with no error of its own: without this the
    // request never settles, the store sits in `loading` forever, and the page
    // shows a spinner with nothing behind it.
    if (cause instanceof DOMException && cause.name === "TimeoutError") {
      throw new DbError(
        `Sheet for "${tableName}" did not respond within ${FETCH_TIMEOUT_MS / 1000}s`,
        { cause }
      )
    }
    throw new DbError(`Could not reach the sheet for "${tableName}"`, { cause })
  }

  if (!response.ok) {
    throw new DbError(
      `Sheet for "${tableName}" returned ${response.status} ${response.statusText} — check the tab is still published`
    )
  }

  const text = await response.text()

  if (looksLikeHtml(text)) {
    throw new DbError(
      `Sheet for "${tableName}" returned a web page instead of CSV — the tab is probably not published, or its gid is wrong`
    )
  }

  const rows = rowsFromCsv(text)

  // An empty tab is almost always a misconfiguration rather than a real state:
  // every table here is either populated or should not be switched to sheets.
  if (rows.length === 0) {
    throw new DbError(`Sheet for "${tableName}" has a header but no rows`)
  }

  return rows
}
