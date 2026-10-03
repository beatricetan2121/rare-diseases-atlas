import { Button } from "@/components/ui/button";
import type { Edge } from "@/lib/atlas";
export function EvidenceChip({ edge, onOpen }: { edge: Edge; onOpen: (e: Edge) => void }) {
 return <span className="chip-group"><span className={`evidence-chip ${edge.evidence_type}`}>{edge.evidence_type === "curated" ? "Curated" : edge.evidence_type === "extracted" ? "AI-extracted" : "Inferred"} · 1 source{edge.contradicted_by.length ? " · disputed" : ""}</span><Button variant="link" size="sm" className="why-button" onClick={(e) => { e.stopPropagation(); onOpen(edge); }}>Why?</Button></span>;
}
