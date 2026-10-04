import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [
    { title: "The team behind — Rare Disease Atlas" },
    { name: "description", content: "Learn about the purpose and evidence standards behind the Rare Disease Atlas demonstration." },
    { property: "og:title", content: "The team behind — Rare Disease Atlas" },
    { property: "og:description", content: "The purpose, limits and review principles behind this rare-disease research demonstration." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Team,
});

function Team() {
  return <div className="vision-page"><section className="vision-intro content-width">
    <div className="section-kicker"><span className="kicker-line"/> THE TEAM BEHIND</div>
    <h1>Science first.<br/><em>People always.</em></h1>
    <p>Rare Disease Atlas is a research-navigation demonstration built around a simple principle: useful connections need a source, a clear explanation and room for uncertainty.</p>
    <p className="vision-caveat">Team biographies have not been provided yet, so this page does not assign names or credentials to the work.</p>
  </section><section className="vision-principles"><div className="content-width"><span className="eyebrow">HOW THE WORK IS HANDLED</span><div className="vision-grid">
    <article><span className="vision-number">01</span><h2>Evidence before inference</h2><p>Connections distinguish reviewed sources, extracted information and hypotheses that need checking.</p></article>
    <article><span className="vision-number">02</span><h2>People in the loop</h2><p>New research contributions remain private and pending review before they can become part of the shared map.</p></article>
    <article><span className="vision-number">03</span><h2>Honest limits</h2><p>The atlas currently uses illustrative records. It is not a clinical decision tool or a guarantee that an approach transfers between diseases.</p></article>
  </div></div></section><section className="vision-end content-width"><h2>See the evidence in context.</h2><Button asChild><Link to="/who">Explore the atlas <ArrowRight size={17}/></Link></Button></section></div>;
}