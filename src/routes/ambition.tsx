import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Network, FlaskConical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ambition")({
  head: () => ({ meta: [
    { title: "Our 10× path — Rare Disease Atlas" },
    { name: "description", content: "The wider ambition for rare-disease research: make existing knowledge, evidence and collaborators easier to find and connect." },
    { property: "og:title", content: "Our 10× path — Rare Disease Atlas" },
    { property: "og:description", content: "A vision for moving rare-disease research forward without rebuilding what already exists." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Ambition,
});

function Ambition() {
  return <div className="vision-page">
    <section className="vision-intro content-width">
      <div className="section-kicker"><span className="kicker-line"/> OUR 10× PATH</div>
      <h1>Reuse what exists.<br/><em>Move further, together.</em></h1>
      <p>Our ambition is to make the path from a rare-disease question to a useful research conversation radically shorter — across conditions, not just for one family or one disease.</p>
      <p className="vision-caveat">10× is an ambition, not a measured result or a promise of faster treatment.</p>
    </section>
    <section className="vision-principles"><div className="content-width">
      <span className="eyebrow">THE PATH FORWARD</span>
      <div className="vision-grid">
        <article><span className="vision-number">01</span><Network size={25}/><h2>Connect the biology</h2><p>Find where mechanisms overlap and where they do not, with the evidence and uncertainty visible on every connection.</p></article>
        <article><span className="vision-number">02</span><FlaskConical size={25}/><h2>Find reusable work</h2><p>Surface relevant studies, methods and research assets before starting again from scratch. Check whether they actually apply.</p></article>
        <article><span className="vision-number">03</span><Users size={25}/><h2>Bring people together</h2><p>Give families, clinicians and therapy scouts a clearer starting point for informed conversations with potential partners.</p></article>
      </div>
    </div></section>
    <section className="vision-end content-width"><h2>A clearer next question can change what happens next.</h2><Button asChild><Link to="/who">Explore the atlas <ArrowRight size={17}/></Link></Button></section>
  </div>;
}