import { X, ExternalLink, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { allEdges, type Edge } from "@/lib/atlas";

export function EvidenceDrawer({ edge, onClose }: { edge: Edge | null; onClose: () => void }) {
  const label = edge?.evidence_type === "curated" ? "Curated" : edge?.evidence_type === "extracted" ? "AI-extracted" : "Inferred, needs expert review";
  const level = edge ? { hypothesis: "Idea, not yet tested", preclinical: "Seen in lab or animal studies", clinical_observation: "Seen in patients", clinical_trial: "Shown in a clinical trial" }[edge.evidence_level] : "";
  return <Sheet open={Boolean(edge)} onOpenChange={(open) => { if (!open) onClose(); }}><SheetContent side="right" className="evidence-drawer" aria-describedby="evidence-description"><SheetTitle>Why this connection?</SheetTitle><SheetDescription id="evidence-description">Illustrative source record and confidence details.</SheetDescription>{edge && <>
    <div className="drawer-top"><span className="eyebrow">SOURCE RECORD / DEMO</span><Button variant="ghost" size="icon" aria-label="Close evidence" onClick={onClose}><X/></Button></div>
    <p className="drawer-lead">{edge.plain_explanation}</p>
    <div className="evidence-line"><span className={`line-sample ${edge.evidence_type}`}/><strong>{label}</strong><span className="muted">· {level}</span></div>
    <div className="drawer-rule"/>
    <dl className="source-list"><div><dt>Source</dt><dd>{edge.source_name}</dd></div><div><dt>Record ID</dt><dd>{edge.source_id} <ExternalLink size={13}/></dd></div><div><dt>Retrieved</dt><dd>{edge.retrieved_at}</dd></div><div><dt>Confidence</dt><dd>{Math.round(edge.confidence * 100)}% · illustrative</dd></div><div><dt>Independent sources</dt><dd>1 mock record; not independently verified</dd></div></dl>
    {edge.contradicted_by.length > 0 && <section className="contradiction"><CircleAlert size={18}/><div><strong>Contradicting evidence</strong><p>This link has a counterpoint in the dataset. It should not be treated as a validated treatment connection.</p>{edge.contradicted_by.map((id) => <p key={id}>{allEdges.find((e) => e.id === id)?.plain_explanation}</p>)}</div></section>}
    <p className="drawer-note">This record is illustrative mock data, not a verified scientific citation. Source links will be added when real data is connected.</p>
  </>}</SheetContent></Sheet>;
}
