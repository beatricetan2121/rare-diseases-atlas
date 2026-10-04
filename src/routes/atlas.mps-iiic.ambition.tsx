import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ambition, type Step } from "@/data/ambition-mps-iiic";

export const Route = createFileRoute("/atlas/mps-iiic/ambition")({
  head: () => ({ meta: [
    { title: "The 10× ambition — Sanfilippo type C · Rare Disease Atlas" },
    { name: "description", content: "How reusing an existing natural history study and biomarker precedent could shorten the path for Sanfilippo type C families, with every assumption visible." },
    { property: "og:title", content: "From one family to a shared study, 10× faster" },
    { property: "og:description", content: "Team estimates and visible assumptions for the Sanfilippo type C journey." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AmbitionPage,
});

const SCALE = 30;
const statusLabel = { verified: "Verified", "needs-validation": "Needs validation", "at-risk": "At risk" } as const;
const statusClass = { verified: "strength-strong", "needs-validation": "strength-weak", "at-risk": "strength-caution" } as const;
type Seg = Step & { changed?: boolean; tone: "gray" | "teal" };
const isExternal = (h: string) => h.startsWith("http");

function EvidenceLink({ href, label }: { href: string; label: string }) {
  if (isExternal(href)) return <a className="amb-chip" href={href} target="_blank" rel="noopener noreferrer">{label} <ExternalLink size={11}/></a>;
  if (href.startsWith("#")) return <a className="amb-chip" href={href}>{label}</a>;
  return <Link className="amb-chip" to={href as never}>{label}</Link>;
}

function useAnimatedNumber(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now(), a = from.current;
    let id = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - start) / 300); const e = 1 - Math.pow(1 - p, 3); const n = a + (target - a) * e; setV(n); from.current = n; if (p < 1) id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return v;
}

function Bar({ segs, tone, label, total, grown, delay, open, setOpen }: { segs: Seg[]; tone: "gray" | "teal"; label: string; total: string; grown: boolean; delay: number; open: string; setOpen: (id: string) => void }) {
  return <div className="amb-bar-row">
    <span className="amb-bar-label">{label}</span>
    <div className="amb-track">
      {segs.map((s) => <div key={s.id} className="amb-seg-wrap" style={{ width: grown ? `max(6px, ${(s.months / SCALE) * 100}%)` : "0px", transitionDelay: `${delay}ms` }}>
        <button type="button" className={`amb-seg ${tone} ${s.changed ? "changed" : ""}`} aria-label={`${s.label}, ${s.range}`} aria-expanded={open === s.id} onMouseEnter={() => setOpen(s.id)} onMouseLeave={() => setOpen("")} onFocus={() => setOpen(s.id)} onClick={() => setOpen(open === s.id ? "" : s.id)}/>
        {open === s.id && <div className="amb-tip" role="tooltip" onMouseEnter={() => setOpen(s.id)} onMouseLeave={() => setOpen("")}><strong>{s.label}</strong><span>{s.range}</span>{s.evidence && <EvidenceLink {...s.evidence}/>}</div>}
      </div>)}
    </div>
    <small className="amb-total">{total}</small>
  </div>;
}

function AmbitionPage() {
  const [holds, setHolds] = useState<Record<string, boolean>>(() => Object.fromEntries(ambition.assumptions.map((a) => [a.id, true])));
  const [grown, setGrown] = useState(false);
  const [open, setOpen] = useState("");
  const [done, setDone] = useState<Record<number, boolean>>({});
  useEffect(() => { const t = window.setTimeout(() => setGrown(true), 60); return () => window.clearTimeout(t); }, []);

  const calc = useMemo(() => {
    const failed = ambition.assumptions.filter((a) => a.ifFails && !holds[a.id]);
    let atlas: Seg[] = ambition.atlasSteps.map((s) => ({ ...s, tone: "teal" }));
    let mult = 1;
    for (const a of failed) {
      const f = a.ifFails!;
      const rep = f.replace;
      if (rep) atlas = atlas.map((s) => { const r = rep[s.id]; if (!r) return s; const { evidence: _e, ...rest } = s; void _e; return { ...rest, ...r, range: `~${r.months} months`, changed: true }; });
      if (f.add) atlas = [...atlas, { ...f.add, tone: "teal", changed: true }];
      if (f.baselineMultiplier) mult *= f.baselineMultiplier;
    }
    const atlasTotal = atlas.reduce((n, s) => n + s.months, 0);
    const baseline: Seg[] = ambition.baselineSteps.map((s) => ({ ...s, months: s.months * mult, tone: "gray" }));
    const baselineTotal = baseline.reduce((n, s) => n + s.months, 0);
    return { failed, atlas, baseline, atlasTotal, baselineTotal, ratio: baselineTotal / atlasTotal };
  }, [holds]);

  const ratio = useAnimatedNumber(calc.ratio);
  const allHold = calc.failed.length === 0;
  const parallel = calc.atlas.filter((s) => s.months === 0);
  const ticks = [0, 6, 12, 18, 24, 30];

  return <div className="amb-page">
    <section className="amb-fold">
      <div className="amb-left">
        <Link to="/disease/$id" params={{ id: "mps-iiic" }} className="back-link"><ArrowLeft size={14}/> Back to people</Link>
        <span className="eyebrow">THINK BIGGER / THE 10× AMBITION</span>
        <h1>From one family to a shared study, 10× faster.</h1>
        <div className="amb-milestone"><span className="eyebrow">MILESTONE</span><p>{ambition.milestone}</p></div>
        <div className="amb-chart">
          <div className="amb-bars">
            <Bar segs={calc.baseline} tone="gray" label="Building alone" total={allHold || holds["baseline"] ? "~20–33 months" : `~${calc.baselineTotal.toFixed(1)} months (halved)`} grown={grown} delay={0} open={open} setOpen={setOpen}/>
            <div className="amb-parallel-row">{parallel.map((s) => <span key={s.id} className="amb-diamond-wrap"><button type="button" className="amb-diamond" aria-label={`${s.label}, in parallel`} onMouseEnter={() => setOpen(s.id)} onMouseLeave={() => setOpen("")} onFocus={() => setOpen(s.id)} onClick={() => setOpen(open === s.id ? "" : s.id)}/><small>in parallel</small>{open === s.id && <div className="amb-tip" role="tooltip" onMouseEnter={() => setOpen(s.id)} onMouseLeave={() => setOpen("")}><strong>{s.label}</strong><span>{s.range}</span>{s.evidence && <EvidenceLink {...s.evidence}/>}</div>}</span>)}</div>
            <Bar segs={calc.atlas.filter((s) => s.months > 0)} tone="teal" label="With the atlas: reuse, don't rebuild" total={allHold ? "~2–3 months" : `~${calc.atlasTotal.toFixed(1)} months`} grown={grown} delay={500} open={open} setOpen={setOpen}/>
            <div className="amb-axis">{ticks.map((t) => <span key={t} style={{ left: `${(t / SCALE) * 100}%` }}>{t}</span>)}<em>months</em></div>
          </div>
          <div className={`amb-ratio ${allHold ? "" : "warn"}`} aria-live="polite">
            <strong>{calc.ratio >= 1.5 ? `≈${Math.round(ratio)}× faster` : "No meaningful speed-up"}</strong>
            <small>{allHold ? "25 → 2.5 months (midpoints of team estimates)" : `If ${calc.failed.map((a) => a.short).join(" + ")} fails`}</small>
          </div>
        </div>
        <p className="amb-caption">Timelines are team estimates, not measured data. Each shortcut depends on an assumption on the right.</p>
      </div>
      <aside className="amb-right">
        <span className="eyebrow">ASSUMPTIONS</span>
        {ambition.assumptions.map((a) => <div key={a.id} id={`assumption-${a.id}`} className={`amb-assumption ${holds[a.id] ? "" : "failed"}`}>
          <span className={`strength-pill ${statusClass[a.status]}`}>{statusLabel[a.status]}</span>
          <div className="amb-assumption-body"><p>{a.text}</p>{a.note && <small>{a.note}</small>}{a.sources && <div className="amb-sources">{a.sources.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label} <ExternalLink size={11}/></a>)}</div>}</div>
          {a.status !== "verified" && <label className="amb-switch"><Switch checked={holds[a.id] ?? true} onCheckedChange={(v) => setHolds((h) => ({ ...h, [a.id]: v }))} aria-label={`${a.short} holds`}/><span>Holds</span></label>}
        </div>)}
      </aside>
    </section>
    <section className="amb-validate">
      <span className="eyebrow">VALIDATE NEXT / THIS WEEK</span>
      <ol>{ambition.validateNext.map((v, i) => <li key={v.task} className={done[i] ? "done" : ""}><span className="amb-num">{String(i + 1).padStart(2, "0")}</span><Checkbox id={`v-${i}`} checked={!!done[i]} onCheckedChange={(c) => setDone((d) => ({ ...d, [i]: c === true }))}/><label htmlFor={`v-${i}`}>{v.task}</label><span className="amb-owner">{v.owner}</span>{v.href && <EvidenceLink href={v.href} label="Open"/>}</li>)}</ol>
    </section>
    <section className="amb-close">
      <h2>Reuse, don't rebuild.</h2>
      <p>Rare Disease Atlas · Every link sourced. Every assumption visible.</p>
      <Button asChild variant="outline"><Link to="/search">Start a new search</Link></Button>
    </section>
  </div>;
}
