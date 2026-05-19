/**
 * One-shot: replace zinc utility clusters with od-* tokens in Patrimônio UI.
 * Run from repo root: node scripts/migrate-ativos-od-tokens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "src/features/ativos/AtivosView.js",
  "src/features/ativos/PatrimonioSlideOver.jsx",
  "src/features/ativos/AtivoDetalhesView.js",
  "src/features/ativos/AtivoDetalhesCliente.js",
  "src/features/ativos/EditarAtivoCliente.js",
  "src/features/ativos/AtivoForm.js"
];

/** Longest keys first so partial strings do not break longer matches */
const pairs = [
  [
    "text-zinc-950 [font-family:var(--font-display)] dark:text-zinc-50",
    "text-od-text [font-family:var(--font-display)]"
  ],
  ["text-zinc-900 dark:text-zinc-100", "text-od-text"],
  ["text-zinc-950 dark:text-zinc-50", "text-od-text"],
  ["text-zinc-800 dark:text-zinc-200", "text-od-text"],
  ["text-zinc-700 dark:text-zinc-300", "text-od-text-soft"],
  ["text-zinc-600 dark:text-zinc-400", "text-od-muted"],
  ["text-zinc-500 dark:text-zinc-400", "text-od-muted"],
  ["text-zinc-500 dark:text-zinc-500", "text-od-muted"],
  ["text-zinc-600 dark:text-zinc-300", "text-od-muted"],
  ["text-zinc-400 dark:text-zinc-500", "text-od-muted"],
  ["text-zinc-300 dark:text-zinc-600", "text-od-muted"],
  ["border-zinc-200/90", "border-od-border/90"],
  ["border-zinc-200/80", "border-od-border/80"],
  ["dark:border-zinc-800/90", "dark:border-od-border/90"],
  ["dark:border-zinc-800/80", "dark:border-od-border/80"],
  ["dark:border-zinc-800/70", "dark:border-od-border/70"],
  ["dark:border-zinc-700/50", "dark:border-od-border/60"],
  ["dark:border-zinc-800", "dark:border-od-border"],
  ["dark:border-zinc-700", "dark:border-od-border-strong"],
  ["dark:border-zinc-600", "dark:border-od-border-strong"],
  ["border-zinc-300", "border-od-border-strong"],
  ["dark:bg-zinc-950/95", "dark:bg-od-bg/95"],
  ["dark:bg-zinc-900/95", "dark:bg-od-surface/95"],
  ["dark:bg-zinc-900/60", "dark:bg-od-surface/60"],
  ["dark:bg-zinc-900/50", "dark:bg-od-surface/50"],
  ["dark:bg-zinc-900/40", "dark:bg-od-surface/40"],
  ["dark:bg-zinc-900/35", "dark:bg-od-surface/35"],
  ["dark:bg-zinc-900/25", "dark:bg-od-surface/25"],
  ["dark:bg-zinc-800/80", "dark:bg-od-surface-muted/80"],
  ["dark:bg-zinc-800/60", "dark:bg-od-surface-muted/60"],
  ["dark:bg-zinc-950", "dark:bg-od-bg"],
  ["dark:bg-zinc-900", "dark:bg-od-surface"],
  ["dark:bg-zinc-800", "dark:bg-od-surface-muted"],
  ["dark:from-zinc-900/50 dark:to-zinc-900/20", "dark:from-od-surface/50 dark:to-od-surface/20"],
  ["dark:from-zinc-900/80 dark:to-zinc-950", "dark:from-od-surface/80 dark:to-od-bg"],
  ["from-zinc-50/90 to-zinc-50/40", "from-od-surface-soft/90 to-od-surface-soft/40"],
  ["from-zinc-50/95 to-white", "from-od-surface-soft/95 to-od-card"],
  [
    "bg-gradient-to-b from-zinc-50/90 to-zinc-50/40",
    "bg-gradient-to-b from-od-surface-soft/90 to-od-surface-soft/40"
  ],
  ["bg-zinc-50/80", "bg-od-surface-soft/80"],
  ["bg-zinc-50/60", "bg-od-surface-soft/60"],
  ["bg-zinc-50/50", "bg-od-surface-soft/50"],
  ["bg-zinc-50/40", "bg-od-surface-soft/40"],
  ["bg-zinc-50/95", "bg-od-surface-soft/95"],
  ["bg-zinc-100/70", "bg-od-surface-muted/70"],
  ["bg-zinc-100", "bg-od-surface-muted"],
  ["bg-zinc-50", "bg-od-surface-soft"],
  ["hover:bg-zinc-200/70", "hover:bg-od-surface-muted/70"],
  ["bg-zinc-200/70", "bg-od-surface-muted/70"],
  ["bg-zinc-200/90", "bg-od-border/25"],
  ["bg-zinc-200", "bg-od-border/30"],
  ["border-zinc-100", "border-od-border/40"],
  ["divide-zinc-100", "divide-od-border/35"],
  ["divide-zinc-800/80", "divide-od-border/45"],
  ["divide-zinc-800", "divide-od-border/45"],
  ["hover:bg-zinc-200/70", "hover:bg-od-surface-muted/70"],
  ["dark:hover:bg-zinc-900/40", "dark:hover:bg-od-surface/40"],
  ["dark:hover:bg-zinc-900", "dark:hover:bg-od-surface"],
  ["dark:hover:bg-zinc-800/80", "dark:hover:bg-od-surface-muted/80"],
  ["dark:hover:bg-zinc-800", "dark:hover:bg-od-surface-muted"],
  ["hover:bg-zinc-50/90", "hover:bg-od-surface-soft/90"],
  ["hover:bg-zinc-50", "hover:bg-od-surface-soft"],
  ["hover:bg-zinc-100", "hover:bg-od-surface-muted"],
  ["hover:bg-white/70", "hover:bg-od-card/70"],
  ["hover:bg-white", "hover:bg-od-card"],
  ["hover:border-zinc-200", "hover:border-od-border"],
  ["hover:border-zinc-300", "hover:border-od-border-strong"],
  ["dark:hover:border-zinc-700", "dark:hover:border-od-border-strong"],
  ["hover:text-zinc-900", "hover:text-od-text"],
  ["hover:text-zinc-200", "hover:text-od-text"],
  ["shadow-zinc-900/25", "shadow-od-text/25"],
  ["shadow-zinc-900/20", "shadow-od-text/20"],
  ["shadow-zinc-900/15", "shadow-od-text/15"],
  ["shadow-zinc-900/10", "shadow-od-text/10"],
  ["from-zinc-800 to-zinc-950", "from-od-text to-od-bg"],
  [
    "dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900",
    "dark:from-od-surface-soft dark:to-od-border/40 dark:text-od-text"
  ],
  ["ring-zinc-900/10", "ring-od-text/10"],
  ["ring-zinc-200/80", "ring-od-border/80"],
  ["ring-zinc-200/90", "ring-od-border/90"],
  ["ring-zinc-300", "ring-od-border-strong"],
  ["dark:ring-zinc-700", "dark:ring-od-border-strong"],
  ["dark:ring-zinc-600", "dark:ring-od-border-strong"],
  ["dark:ring-white/30", "dark:ring-od-card/25"],
  ["focus:ring-zinc-900/10", "focus:ring-od-text/10"],
  ["dark:focus:ring-zinc-100/10", "dark:focus:ring-od-text/10"],
  ["focus:border-zinc-400", "focus:border-od-border-strong"],
  ["dark:focus:border-zinc-500", "dark:focus:border-od-muted"],
  ["border-zinc-900 bg-zinc-900", "border-od-text bg-od-text"],
  ["hover:bg-zinc-800", "hover:bg-od-text/90"],
  [
    "dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900",
    "dark:border-od-surface-soft dark:bg-od-surface-soft dark:text-od-text"
  ],
  ["dark:hover:bg-zinc-200", "dark:hover:bg-od-border/40"],
  ["placeholder:text-zinc-400", "placeholder:text-od-muted"],
  ["dark:placeholder:text-zinc-500", "dark:placeholder:text-od-muted"],
  ["border-zinc-200 ", "border-od-border "],
  [
    "absolute inset-0 bg-zinc-950/45 transition-opacity duration-200 dark:bg-zinc-950/65",
    "absolute inset-0 bg-black/45 transition-opacity duration-200 dark:bg-black/60"
  ]
];

const fixups = [
  ["hover:bg-od-border/30/70", "hover:bg-od-surface-muted/70"],
  [
    "absolute inset-0 bg-zinc-950/45 transition-opacity duration-200 dark:bg-od-bg/65",
    "absolute inset-0 bg-black/45 transition-opacity duration-200 dark:bg-black/60"
  ],
  ["text-zinc-900 dark:text-zinc-50", "text-od-text"],
  ["text-zinc-600 dark:text-zinc-400", "text-od-muted"],
  ["dark:hover:text-zinc-100", "dark:hover:text-od-text"],
  ["dark:text-zinc-50", "dark:text-od-text"],
  ["dark:text-zinc-100", "dark:text-od-text"],
  ["dark:text-zinc-200", "dark:text-od-text"],
  ["dark:text-zinc-300", "dark:text-od-text-soft"],
  ["dark:text-zinc-400", "dark:text-od-muted"],
  ["dark:text-zinc-900", "dark:text-od-text"],
  ["dark:focus:bg-zinc-950", "dark:focus:bg-od-bg"],
  ["hover:text-zinc-800", "hover:text-od-text-soft"],
  ["text-zinc-800", "text-od-text-soft"],
  ["text-zinc-700", "text-od-text-soft"],
  ["text-zinc-600 ", "text-od-muted "],
  ['text-zinc-600"', 'text-od-muted"'],
  ["text-zinc-500", "text-od-muted"],
  ["text-zinc-400", "text-od-muted"],
  ["text-zinc-900 ", "text-od-text "],
  ['text-zinc-900"', 'text-od-text"'],
  ['? "bg-zinc-900', '? "bg-od-text'],
  [" bg-zinc-900 ", " bg-od-text "]
];

function migrate(content) {
  let s = content;
  for (const [from, to] of pairs) {
    if (from === to) continue;
    s = s.split(from).join(to);
  }
  s = s.replace(/\bbg-white\b/g, "bg-od-card");
  for (const [from, to] of fixups) {
    if (from === to) continue;
    s = s.split(from).join(to);
  }
  return s;
}

for (const rel of files) {
  const fp = path.join(root, rel);
  const before = fs.readFileSync(fp, "utf8");
  const after = migrate(before);
  fs.writeFileSync(fp, `${after.replace(/\s*$/, "")}\n`);
  console.info("updated", rel);
}
