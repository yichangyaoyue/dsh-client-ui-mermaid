window.__ModuleLoader__.load({
	id: "@moyiyaoyue/dsh-client-ui-mermaid",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ---------------------------------------------------------------------
		// Vendored Mermaid UMD bundle, executed lazily on first use (offline).
		// Replaced at build time by build.js.
		// ---------------------------------------------------------------------
		/*@__MERMAID_DIST__@*/

		// ---------------------------------------------------------------------
		// Inline stylesheet (injected once, claimed for HMR bookkeeping).
		// ---------------------------------------------------------------------
		var CSS = [
			".dsh-mermaid-view{display:flex;justify-content:center;align-items:center;margin:8px 0;overflow-x:auto;overflow-y:hidden}",
			".dsh-mermaid-view svg{max-width:100%;height:auto;background:transparent}",
			".dsh-mermaid-error{color:var(--dsw-alias-state-error-primary,#cc0000);font-size:12px;line-height:18px;padding:8px 12px;white-space:pre-wrap}",
			".dsh-mermaid-toggle{box-sizing:border-box;border:none;cursor:pointer;background:transparent;color:var(--dsw-alias-label-secondary,#61666b);font-size:12px;line-height:18px;padding:0 8px}",
			".dsh-mermaid-toggle:hover{color:var(--dsw-alias-label-primary,#0f1115)}",
			".md-code-block[data-mermaid=busy] .dsh-mermaid-view{opacity:.6}",
			"pre.dsh-mermaid-source{margin:0;display:none}"
		].join("\n");

		var TAG_ID = "@moyiyaoyue/dsh-client-ui-mermaid/styles";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]") === null) {
			var styleTag = document.createElement("style");
			styleTag.dataset.plugin = "@moyiyaoyue/dsh-client-ui-mermaid";
			styleTag.dataset.pluginCss = TAG_ID;
			styleTag.textContent = CSS;
			document.head.appendChild(styleTag);
		}

		// ---------------------------------------------------------------------
		// Mermaid engine loading. Primary: the vendored inlined bundle (works
		// offline). Fallback: a CDN script (configurable via
		// `window.__DSH_MERMAID_SRC__`, a string or array of candidate URLs).
		// ---------------------------------------------------------------------
		var DEFAULT_SOURCES = [
			"https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js",
			"https://unpkg.com/mermaid@11/dist/mermaid.min.js"
		];

		var loadPromise = null;
		var initialized = false;
		var uidCounter = 0;

		function candidateSources() {
			var configured = (typeof window !== "undefined") && window.__DSH_MERMAID_SRC__;
			if (typeof configured === "string" && configured !== "") return [configured];
			if (Array.isArray(configured)) return configured.filter(function (s) { return typeof s === "string" && s !== ""; });
			return DEFAULT_SOURCES;
		}

		function loadScript(src) {
			return new Promise(function (resolve, reject) {
				var el = document.createElement("script");
				el.async = true;
				el.src = src;
				el.addEventListener("load", function () { el.remove(); resolve(); }, { once: true });
				el.addEventListener("error", function () { el.remove(); reject(new Error("script load failed: " + src)); }, { once: true });
				document.head.appendChild(el);
			});
		}

		function loadFromCdn() {
			var sources = candidateSources();
			var attempt = function (index) {
				if (index >= sources.length) return Promise.reject(new Error("mermaid could not be loaded from any configured source"));
				return loadScript(sources[index]).then(function () {
					if (window.mermaid) return window.mermaid;
					return attempt(index + 1);
				}).catch(function () {
					return attempt(index + 1);
				});
			};
			return attempt(0);
		}

		function executeInline() {
			var el = document.createElement("script");
			el.textContent = MERMAID_DIST;
			document.head.appendChild(el);
			el.remove();
			return (typeof window !== "undefined" && window.mermaid) ? window.mermaid : null;
		}

		function loadMermaid() {
			if (typeof window !== "undefined" && window.mermaid) return Promise.resolve(window.mermaid);
			if (loadPromise) return loadPromise;
			loadPromise = Promise.resolve().then(function () {
				try {
					var inline = executeInline();
					if (inline) return inline;
				} catch (error) {
					// fall through to the CDN fallback
				}
				return loadFromCdn();
			});
			return loadPromise;
		}

		function isDark() {
			try {
				return document.body.hasAttribute("data-ds-dark-theme");
			} catch (error) {
				return false;
			}
		}

		function ensureMermaid() {
			return loadMermaid().then(function (mermaid) {
				if (!initialized) {
					mermaid.initialize({
						startOnLoad: false,
						securityLevel: "strict",
						theme: isDark() ? "dark" : "default",
						fontFamily: "inherit"
					});
					initialized = true;
				}
				return mermaid;
			});
		}

		// ---------------------------------------------------------------------
		// DOM helpers. The CodeBlock component always renders a stable
		// `md-code-block` class; the language label is the first text node of
		// the banner, and Mermaid fences always render as a plain <pre> (shiki
		// has no mermaid grammar).
		// ---------------------------------------------------------------------
		function langOf(block) {
			var bannerWrap = block.firstElementChild;
			var banner = bannerWrap && bannerWrap.firstElementChild;
			var infostring = banner && banner.firstElementChild;
			var text = infostring ? (infostring.textContent || "") : "";
			return text.trim().toLowerCase();
		}

		function codeOf(block) {
			var pre = block.querySelector("pre");
			if (pre && pre.textContent != null) return pre.textContent;
			var code = block.querySelector("code");
			return code && code.textContent != null ? code.textContent : "";
		}

		function actionOf(block) {
			var bannerWrap = block.firstElementChild;
			var banner = bannerWrap && bannerWrap.firstElementChild;
			return banner ? banner.lastElementChild : null;
		}

		function addSourceToggle(block, pre) {
			var action = actionOf(block);
			if (!action) return;
			if (action.querySelector(".dsh-mermaid-toggle")) return;
			var button = document.createElement("button");
			button.type = "button";
			button.className = "dsh-mermaid-toggle";
			button.textContent = "源码";
			button.setAttribute("aria-pressed", "false");
			button.addEventListener("click", function () {
				if (!pre) return;
				var hidden = pre.style.display === "none" || getComputedStyle(pre).display === "none";
				if (hidden) {
					pre.style.display = "";
					button.textContent = "收起";
					button.setAttribute("aria-pressed", "true");
				} else {
					pre.style.display = "none";
					button.textContent = "源码";
					button.setAttribute("aria-pressed", "false");
				}
			});
			action.appendChild(button);
		}

		function renderBlock(block) {
			if (!block || block.nodeType !== 1) return;
			if (block.dataset.mermaid === "done" || block.dataset.mermaid === "busy" || block.dataset.mermaid === "error") return;
			if (langOf(block) !== "mermaid") return;
			var code = codeOf(block);
			if (!code || !code.trim()) return;

			block.dataset.mermaid = "busy";

			ensureMermaid().then(function (mermaid) {
				var id = "dsh-mermaid-" + (++uidCounter);
				return mermaid.render(id, code).then(function (result) {
					var pre = block.querySelector("pre");
					var view = document.createElement("div");
					view.className = "dsh-mermaid-view";
					// `securityLevel: "strict"` constrains the SVG to shapes/text;
					// no foreignObject/HTML can reach the DOM.
					view.innerHTML = result.svg;
					if (pre) {
						pre.classList.add("dsh-mermaid-source");
						pre.style.display = "none";
						block.insertBefore(view, pre);
					} else {
						block.appendChild(view);
					}
					addSourceToggle(block, pre);
					block.dataset.mermaid = "done";
				});
			}).catch(function (error) {
				var view = block.querySelector(".dsh-mermaid-view");
				if (view) view.remove();
				var errorEl = document.createElement("div");
				errorEl.className = "dsh-mermaid-error";
				errorEl.textContent = "Mermaid 渲染失败: " + (error && error.message ? error.message : String(error));
				block.appendChild(errorEl);
				var pre = block.querySelector("pre");
				if (pre) pre.style.display = "";
				addSourceToggle(block, pre);
				block.dataset.mermaid = "error";
			});
		}

		function scanRoot(root) {
			if (!root || !root.querySelectorAll) return;
			var blocks = root.querySelectorAll(".md-code-block");
			for (var i = 0; i < blocks.length; i += 1) renderBlock(blocks[i]);
		}

		// ---------------------------------------------------------------------
		// MutationObserver: catches settled blocks, streaming→settled swaps,
		// and the infostring text flip that marks finalize.
		// ---------------------------------------------------------------------
		function installObserver() {
			var observer = new MutationObserver(function (mutations) {
				var seen = new Set();
				for (var i = 0; i < mutations.length; i += 1) {
					var mutation = mutations[i];
					var target = mutation.target;
					if (mutation.type === "characterData") target = target.parentElement;
					if (target && target.nodeType === 1) {
						var block = target.closest ? target.closest(".md-code-block") : null;
						if (block) seen.add(block);
					}
					var added = mutation.addedNodes;
					if (added) {
						for (var j = 0; j < added.length; j += 1) {
							var node = added[j];
							if (node.nodeType !== 1) continue;
							if (node.matches && node.matches(".md-code-block")) seen.add(node);
							if (node.querySelectorAll) {
								var inner = node.querySelectorAll(".md-code-block");
								for (var k = 0; k < inner.length; k += 1) seen.add(inner[k]);
							}
						}
					}
				}
				seen.forEach(renderBlock);
			});
			observer.observe(document.body, { childList: true, subtree: true, characterData: true });
			return observer;
		}

		function installThemeWatcher() {
			var themeObserver = new MutationObserver(function () {
				if (!initialized) return;
				var blocks = document.querySelectorAll(".md-code-block[data-mermaid]");
				for (var i = 0; i < blocks.length; i += 1) {
					var block = blocks[i];
					var view = block.querySelector(".dsh-mermaid-view");
					if (view) view.remove();
					var errorEl = block.querySelector(".dsh-mermaid-error");
					if (errorEl) errorEl.remove();
					var pre = block.querySelector("pre.dsh-mermaid-source");
					if (pre) pre.style.display = "none";
					delete block.dataset.mermaid;
				}
				initialized = false;
				scanRoot(document.body);
			});
			themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
			return themeObserver;
		}

		// ---------------------------------------------------------------------
		// Cordis plugin body.
		// ---------------------------------------------------------------------
		var inject = [];

		function apply(ctx) {
			if (typeof document === "undefined") return;
			ctx.effect(function () {
				var observer = installObserver();
				var themeObserver = installThemeWatcher();
				scanRoot(document.body);
				return function () {
					observer.disconnect();
					themeObserver.disconnect();
				};
			}, "client-ui-mermaid: dom observer");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
