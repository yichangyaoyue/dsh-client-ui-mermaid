/**
 * Host half of the Mermaid client plugin. This package is client-only: the
 * host entry exists so the profile loader can register the row and the
 * `dsh.client` scan can discover the browser bundle. No host services are
 * provided or required.
 */

/** Cordis service injection list (none). */
export const inject = [];

/**
 * Host plugin body — a deliberate no-op. All rendering happens in the browser
 * half (`./client.js`), which the client-modules registry serves and the
 * browser Cordis loader applies.
 */
export function apply() {}
