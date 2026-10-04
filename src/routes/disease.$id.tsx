import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, FlaskConical, HeartHandshake, Landmark, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAtlas } from "@/components/atlas/atlas-shell";
import { diseases, getNextSteps, type Partner } from "@/lib/atlas";

export const Route = createFileRoute("/disease/$id")({
  head: () => ({ meta: [
    { title: "Partner next steps — Rare Disease Atlas" },
    { name: "description", content: "Three practical next steps and the public research contacts who can help, for rare-disease families and researchers." },
    { property: "og:title", content: "Partner next steps — Rare Disease Atlas" },
    { property: "og:description", content: "Sourced partner contacts and research-stage next steps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DiseasePage,
});

type Step = { partnerId: string; title: string; why: string; review: boolean };
const steps: Record<string, Step[]> = {
  "mps-iiic": [
    { partnerId: "phoenix-nest", title: "Ask to join an existing natural history study", why: "Phoenix Nest already runs a Type C study, so you don't have to build one from scratch.", review: true },
    { partnerId: "cure-sanfilippo", title: "Connect with other Type C families", why: "The foundation's research navigation team links families and study teams.", review: false },
    { partnerId: "sanfilippo-childrens", title: "Explore co-funding brain-delivery research", why: "A funder already backs Type C gene-therapy delivery research.", review: true },
  ],
};
const roleIcon = (kind: string) => kind.includes("Therapeutics") ? FlaskConical : kind.includes("funder") ? Landmark : HeartHandshake;

function draftFor(partner: Partner, disease: string) {
  return `Dear ${partner.contactName},\n\nI am reaching out about ${disease} (MPS IIIC). I came across your publicly described work related to Type C.\n\n${partner.question}\n\nI would appreciate any public information you can share about this work and the best way to stay informed.\n\nThank you for your time,\n[Your name]`;
}

function DiseasePage() {
  const { id } = Route.useParams();
  const { persona } = useAtlas();
  const disease = diseases.find((d) => d.id === id);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setPartners([]); setSelectedId("");
    getNextSteps(id, persona).then((items) => { if (active) { setPartners(items); setLoading(false); } });
    return () => { active = false; };
  }, [id, persona]);

  const selected = partners.find((p) => p.id === selectedId);
  const plan = (steps[id] ?? []).filter((s) => partners.some((p) => p.id === s.partnerId));
  function selectPartner(partner: Partner) {
    setSelectedId(partner.id);
    setSubject(`Inquiry about ${disease?.label ?? "Sanfilippo syndrome"} research`);
    setBody(draftFor(partner, disease?.label ?? "Sanfilippo syndrome type C"));
    setOpened(false);
  }
  function openEmail() {
    if (!selected || !subject.trim() || !body.trim()) return;
    window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent(subject.trim().slice(0, 200))}&body=${encodeURIComponent(body.trim().slice(0, 4000))}`;
    setOpened(true);
  }

  if (!disease) return <section className="content-width journey-page"><h1>Record not found</h1><Button asChild><Link to="/search" search={{ as: persona } as never}>Search the atlas</Link></Button></section>;

  return <section className="steps-page">
    <header className="steps-head">
      <Link className="back-link" to="/atlas/$id" params={{ id }} search={{ as: persona } as never}><ArrowLeft size={14}/> Back to map</Link>
      <div><h1>{disease.label}</h1><p>{disease.attributes.description}</p></div>
    </header>
    {loading ? <p className="partner-empty">Reviewing available contacts…</p> : partners.length === 0 ? <div className="partner-empty"><h3>No verified partner records in this demonstration</h3><p>We have not mapped contacts or treatment programs for this condition yet. We won’t substitute contacts from another subtype.</p></div> : <>
      <h2 className="steps-section-title">Your {plan.length} next steps</h2>
      <div className="steps-grid">{plan.map((step, i) => { const partner = partners.find((p) => p.id === step.partnerId)!; return <article key={step.partnerId} className={`step-card accent-${i + 1} ${hovered === step.partnerId ? "linked" : ""}`} onMouseEnter={() => setHovered(step.partnerId)} onMouseLeave={() => setHovered("")} onFocus={() => setHovered(step.partnerId)} onBlur={() => setHovered("")} tabIndex={0}>
        <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
        <h3>{step.title}</h3><p>{step.why}</p>
        <div className="step-meta"><span className="partner-chip">{partner.name}</span><span className="evidence-chip curated">Curated</span><a href={partner.sourceUrl} target="_blank" rel="noopener noreferrer" className="why-link">Why?</a>{step.review && <span className="review-flag"><AlertTriangle size={12}/> Needs expert review</span>}</div>
      </article>; })}</div>
      <h2 className="steps-section-title">Who can help</h2>
      <div className="steps-grid">{plan.map((step, i) => { const partner = partners.find((p) => p.id === step.partnerId)!; const Icon = roleIcon(partner.kind); return <article key={partner.id} className={`party-card accent-${i + 1} ${hovered === partner.id ? "linked" : ""}`}>
        <div className="party-top"><span className="party-icon"><Icon size={18}/></span><div><span className="eyebrow">{partner.kind}</span><h3>{partner.name}</h3></div></div>
        <p className="party-loc"><MapPin size={12}/> {partner.region}</p>
        <p className="party-approach">{partner.approach}</p>
        <span className="stage-badge">{partner.stage}</span>
        <div className="party-actions"><a href={`mailto:${partner.email}`}>{partner.email}</a><Button size="sm" variant="outline" onClick={() => selectPartner(partner)}><Mail size={14}/> Draft email</Button></div>
      </article>; })}</div>
      {id === "mps-iiic" && <Button asChild className="steps-ambition-cta"><Link to="/atlas/mps-iiic/ambition">See the 10× path →</Link></Button>}
      <p className="steps-disclaimer">Public research contacts to discuss, not treatment recommendations or confirmed opportunities.</p>
    </>}
    <Sheet open={Boolean(selected)} onOpenChange={(o) => { if (!o) setSelectedId(""); }}><SheetContent side="right" className="outreach-sheet">{selected && <><SheetHeader><SheetTitle>Write to {selected.name}</SheetTitle><SheetDescription>Edit the message. Nothing is sent from the atlas.</SheetDescription></SheetHeader>
      <div className="outreach-form"><div className="outreach-recipient"><span className="field-label">TO</span><strong>{selected.contactName}</strong><span>{selected.email}</span><a href={selected.contactSourceUrl} target="_blank" rel="noopener noreferrer">View public contact source <ExternalLink size={13}/></a></div><label htmlFor="outreach-subject">Subject</label><input id="outreach-subject" value={subject} maxLength={200} onChange={(e) => { setSubject(e.target.value); setOpened(false); }}/><label htmlFor="outreach-message">Message</label><textarea id="outreach-message" value={body} maxLength={4000} onChange={(e) => { setBody(e.target.value); setOpened(false); }}/><div className="outreach-actions"><Button onClick={openEmail} disabled={!subject.trim() || !body.trim()}><Mail size={15}/> Open in email app</Button><span>{opened ? <><Check size={14}/> Review and press Send there.</> : "You decide whether to send."}</span></div></div></>}</SheetContent></Sheet>
  </section>;
}
