import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, House, FlaskConical, Microscope } from "lucide-react";
import { useAtlas, personaLabels } from "@/components/atlas/atlas-shell";
import { Button } from "@/components/ui/button";
import type { Persona } from "@/lib/atlas";

export const Route = createFileRoute("/who")({ head: () => ({ meta: [{ title: "Choose your perspective — Rare Disease Atlas" }, { name: "description", content: "See the atlas through the eyes of a patient leader, caregiver, therapy researcher or clinician-scientist." }, { property: "og:title", content: "Choose your perspective — Rare Disease Atlas" }, { property: "og:description", content: "A different view of the same evidence for every person moving rare-disease research forward." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Who });
const roles: { id: Persona; heading: string; text: string; icon: typeof House; number: string }[] = [
 { id: "maria", heading: "I lead a patient group", text: "Find related diseases, reusable research and a next step for your community.", icon: HeartHandshake, number: "01" },
 { id: "devon", heading: "We just got a diagnosis", text: "Find your community and understand what is going on, one step at a time.", icon: House, number: "02" },
 { id: "priya", heading: "I have a therapy approach", text: "See which disease clusters may match the biology you work with.", icon: FlaskConical, number: "03" },
 { id: "osei", heading: "I research a gene or mechanism", text: "Discover who else works on it, even under a different gene name.", icon: Microscope, number: "04" },
];
function Who() { const { setPersona } = useAtlas(); return <section className="content-width journey-page"><div className="section-kicker"><span className="kicker-line"/> STEP 01 / YOUR PERSPECTIVE</div><h1>Where are you<br/><em>coming from?</em></h1><p className="page-intro">The same science can answer different questions. Choose the view that feels right for you.</p><div className="role-grid">{roles.map(({ id, heading, text, icon: Icon, number }) => <Link key={id} to="/search" search={{ as: id } as never} onClick={() => setPersona(id)} className="role-card"><div className="role-top"><span>{number} / {personaLabels[id]}</span><Icon size={25} strokeWidth={1.6}/></div><div><h2>{heading}</h2><p>{text}</p></div><span className="role-bottom"><span>DEMO PERSPECTIVE</span><ArrowRight size={20}/></span></Link>)}</div><p className="journey-note">You can change your perspective later.</p><Button asChild variant="link"><Link to="/">← Back to introduction</Link></Button></section>; }
