import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ExternalLink, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAtlas } from "@/components/atlas/atlas-shell";
import { diseases, getNextSteps, type Partner } from "@/lib/atlas";

export const Route = createFileRoute("/disease/$id")({
  head: () => ({ meta: [
    { title: "Partner next steps — Rare Disease Atlas" },
    { name: "description", content: "Review public research contacts, treatment approaches and a draft outreach message for rare-disease partners." },
    { property: "og:title", content: "Partner next steps — Rare Disease Atlas" },
    { property: "og:description", content: "Sourced partner contacts and research-stage next steps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DiseasePage,
});

function draftFor(partner: Partner, disease: string) {
  return `Dear ${partner.contactName},\n\nI am reaching out about ${disease} (MPS IIIC). I came across your publicly described work related to Type C.\n\n${partner.question}\n\nI would appreciate any public information you can share about this work and the best way to stay informed.\n\nThank you for your time,\n[Your name]`;
}

function DiseasePage() {
  const { id } = Route.useParams();
  const { persona } = useAtlas();
  const disease = diseases.find((d) => d.id === id);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPartners([]);
    setSelectedId("");
    getNextSteps(id, persona).then((items) => {
      if (active) { setPartners(items); setLoading(false); }
    });
    return () => { active = false; };
  }, [id, persona]);

  const selected = partners.find((partner) => partner.id === selectedId);
  function selectPartner(partner: Partner) {
    setSelectedId(partner.id);
    setSubject(`Inquiry about ${disease?.label ?? "Sanfilippo syndrome"} research`);
    setBody(draftFor(partner, disease?.label ?? "Sanfilippo syndrome type C"));
    setOpened(false);
    window.setTimeout(() => document.getElementById("outreach-draft")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }
  function openEmail() {
    if (!selected || !subject.trim() || !body.trim()) return;
    const href = `mailto:${selected.email}?subject=${encodeURIComponent(subject.trim().slice(0, 200))}&body=${encodeURIComponent(body.trim().slice(0, 4000))}`;
    window.location.href = href;
    setOpened(true);
  }

  if (!disease) return <section className="content-width journey-page"><h1>Record not found</h1><Button asChild><Link to="/search" search={{ as: persona } as never}>Search the atlas</Link></Button></section>;

  return <section className="content-width journey-page partner-page">
    <Link className="back-link" to="/atlas/$id" params={{ id }} search={{ as: persona } as never}><ArrowLeft size={15}/> Back to the constellation</Link>
    <div className="section-kicker"><span className="kicker-line"/> DISEASE PROFILE / RESEARCH NAVIGATION</div>
    <h1>{disease.label}</h1>
    <p className="page-intro">{disease.attributes.description}</p>
    <div className="partner-heading">
      <div><span className="eyebrow">NEXT STEPS / POTENTIAL CONNECTIONS</span><h2>People moving the research forward.</h2><p>Public research contacts and approaches to discuss, not treatment recommendations or confirmed opportunities.</p></div>
      <span className="partner-count">{loading ? "—" : partners.length.toString().padStart(2, "0")} CONTACTS</span>
    </div>
    {loading ? <p className="partner-empty">Reviewing available contacts…</p> : partners.length === 0 ? <div className="partner-empty"><h3>No verified partner records in this demonstration</h3><p>We have not mapped contacts or treatment programs for this condition yet. We won’t substitute contacts from another subtype.</p><Button asChild variant="outline"><Link to="/atlas/$id" params={{ id }} search={{ as: persona } as never}>Return to the map <ArrowRight/></Link></Button></div> : <>
      <div className="partner-list">{partners.map((partner, index) => <article className="partner-record" key={partner.id}>
        <div className="partner-index">{String(index + 1).padStart(2, "0")}</div>
        <div className="partner-identity"><span className="eyebrow">{partner.kind}</span><h3>{partner.name}</h3><p><MapPin size={14} aria-hidden="true"/> {partner.region}</p></div>
        <div className="partner-research"><span className="field-label">RESEARCH / APPROACH</span><p>{partner.approach}</p><small>{partner.stage}</small></div>
        <div className="partner-contact"><span className="field-label">PUBLIC CONTACT</span><strong>{partner.contactName}</strong><a href={`mailto:${partner.email}`}>{partner.email}</a><a href={partner.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">{partner.sourceLabel} <ExternalLink size={13}/></a><Button variant="outline" onClick={() => selectPartner(partner)}>Draft email <ArrowUpRight size={15}/></Button></div>
      </article>)}</div>
      <div className="partner-caveat">Research status and contact details may change. Check each source before contacting; none of these approaches is an approved treatment for Type C. Similarity to another Sanfilippo subtype does not establish treatment transfer.</div>
      {selected && <section id="outreach-draft" className="outreach-section"><div className="outreach-heading"><div><span className="eyebrow">OUTREACH / REVIEW BEFORE SENDING</span><h2>Write to {selected.name}</h2><p>Edit the message to reflect your circumstances. Nothing is sent from the atlas.</p></div><Button variant="ghost" onClick={() => setSelectedId("")}>Close</Button></div>
        <div className="outreach-form"><div className="outreach-recipient"><span className="field-label">TO</span><strong>{selected.contactName}</strong><span>{selected.email}</span><a href={selected.contactSourceUrl} target="_blank" rel="noopener noreferrer">View public contact source <ExternalLink size={13}/></a></div><label htmlFor="outreach-subject">Subject</label><input id="outreach-subject" value={subject} maxLength={200} onChange={(event) => { setSubject(event.target.value); setOpened(false); }}/><label htmlFor="outreach-message">Message</label><textarea id="outreach-message" value={body} maxLength={4000} onChange={(event) => { setBody(event.target.value); setOpened(false); }}/><div className="outreach-actions"><Button onClick={openEmail} disabled={!subject.trim() || !body.trim()}><Mail size={15}/> Open in email app</Button><span>{opened ? <><Check size={14}/> Email app requested. Review and press Send there.</> : "You decide whether to send in your email app."}</span></div></div>
      </section>}
    </>}
  </section>;
}
