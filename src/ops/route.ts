/**
 * Where the ops editor lives.
 *
 * Opaque so it is not guessable and not meaningful to anyone who sees it in a
 * browser history or a shoulder-surfed URL bar.
 *
 * It is NOT access control, and should not be described as such to whoever uses
 * it. This is a client-rendered SPA: the path is a string in the published
 * JavaScript bundle, so anyone who opens devtools can find it. What actually
 * limits the damage is that the editor cannot write anywhere — it reads the
 * same CSV the public site reads (already world-readable, since the tabs are
 * published), and its only output is a zip file on the machine it ran on. A
 * stranger who finds this route can look at public data and download a copy of
 * it.
 *
 * If this ever needs to be private rather than merely unlisted, the answer is a
 * server and a login, not a longer path.
 */
export const OPS_ROUTE = "/a7f3c9e12b840d65"
