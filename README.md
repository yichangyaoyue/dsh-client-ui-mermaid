# @moyiyaoyue/dsh-client-ui-mermaid

Client-only [dsh](https://github.com/deepseek-ai/deepseek-harness) plugin that
renders Mermaid fenced code blocks (```` ```mermaid ````) as inline SVG diagrams
in the web UI.

## What it does

- Watches the conversation DOM for `md-code-block` elements whose language is
  `mermaid`.
- Renders each one to SVG via the Mermaid engine, replacing the plain code body
  while keeping the copy button and a **源码 / 收起** source toggle.
- Re-renders diagrams when the DSH light/dark theme flips.
- Falls back to an inline error message (and keeps the source visible) when the
  diagram cannot be rendered.

## How it works

- The package declares `dsh.client.platform = "web"`, so the `client-modules`
  host scan serves `lib/client.js` as `/plugins/@moyiyaoyue/dsh-client-ui-mermaid/client.js`
  and lists it in `window.__DSH_BOOT__`.
- The browser bundle registers a `MutationObserver` on `document.body` and
  lazily executes the vendored Mermaid engine on first use.

## Mermaid engine source

The Mermaid v11 engine is **vendored into `lib/client.js`**, so diagram
rendering works fully offline — no network request is made. As a defensive
fallback (if the vendored copy ever fails to execute), the plugin tries these
CDN URLs in order:

1. `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`
2. `https://unpkg.com/mermaid@11/dist/mermaid.min.js`

Override the fallback before the plugin applies by setting
`window.__DSH_MERMAID_SRC__` to a URL string or an array of candidate URLs.

> Mermaid runs in the browser with `securityLevel: "strict"`, so untrusted
> diagram text cannot inject HTML into the page.

## Rebuild

Rebuild the vendored bundle and reinstall it in one step (from the repo root):

```powershell
powershell -ExecutionPolicy Bypass -File .\rebuild.ps1
```

Build sources live under `build/` (`client.template.js`, `build.js`, and the
downloaded `mermaid.min.js`).

## Install

Install from npm:

```powershell
dsh plugin --profile web add @moyiyaoyue/dsh-client-ui-mermaid
```

or, for local development, from a checkout on the same drive:

```powershell
dsh plugin --profile web add "file:../../plugins/dsh-client-ui-mermaid"
```

Because this is a client-only plugin (it declares no `dsh.bundle`), it must
also be registered as a loader entry in the profile's `cordis.patch.yml`:

```yaml
- insert:
    - id: client-ui-mermaid
      name: '@moyiyaoyue/dsh-client-ui-mermaid'
```

Restart `dsh web` (or the profile) after installing, then refresh the browser.
