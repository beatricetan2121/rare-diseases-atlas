import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { diseases, type Persona } from "@/lib/atlas";

const labels: Record<Persona, string> = { maria: "Patient group leader", devon: "Parent or caregiver", priya: "Therapy researcher", osei: "Researcher or clinician" };
const AtlasContext = createContext<{ persona: Persona; setPersona: (p: Persona) => void }>({ persona: "maria", setPersona: () => {} });
export const useAtlas = () => useContext(AtlasContext);
export const personaLabels = labels;

function ScientificField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let id = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const atlas = path.startsWith("/atlas");
      const cx = atlas ? w * .55 : w * .68, cy = atlas ? h * .53 : h * .50;
      for (let i = 0; i < 270; i++) {
        const x = ((i * 7919) % 997) / 997 * w;
        const y = ((i * 6271) % 991) / 991 * h;
        const opacity = .07 + ((i * 37) % 10) / 140 + (reduced ? 0 : Math.sin(frame * .012 + i) * .025);
        ctx.beginPath(); ctx.arc(x, y, i % 17 === 0 ? 1.5 : .8, 0, Math.PI * 2); ctx.fillStyle = `rgba(31, 86, 107, ${opacity})`; ctx.fill();
      }
      if (!atlas) {
        const points = diseases.slice(0, 10).map((_, i) => ({ x: cx + Math.cos(i * 2.4) * (70 + (i % 4) * 50), y: cy + Math.sin(i * 2.4) * (35 + (i % 4) * 45) }));
        ctx.strokeStyle = "rgba(23, 111, 120, .12)"; ctx.lineWidth = 1;
        [[0,1],[0,2],[0,3],[1,4],[3,5],[5,7],[7,8],[8,9]].forEach(([a,b]) => { const start = points[a ?? -1]; const end = points[b ?? -1]; if (!start || !end) return; ctx.beginPath(); ctx.moveTo(start.x,start.y); ctx.lineTo(end.x,end.y); ctx.stroke(); });
        points.forEach((p,i) => { ctx.beginPath(); ctx.arc(p.x,p.y,i===0 ? 8 : 3.5,0,Math.PI*2); ctx.fillStyle = i===0 ? "rgba(15, 113, 119, .35)" : "rgba(15, 113, 119, .22)"; ctx.fill(); });
      }
      frame++;
      if (!reduced && !document.hidden) id = requestAnimationFrame(draw);
    };
    const resume = () => { cancelAnimationFrame(id); if (!document.hidden) draw(); };
    window.addEventListener("resize", resume); document.addEventListener("visibilitychange", resume); draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resume); document.removeEventListener("visibilitychange", resume); };
  }, [path, search]);
  return <canvas ref={ref} className="scientific-field" aria-hidden="true" />;
}

export function AtlasShell({ children }: { children: ReactNode }) {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [selected, setSelected] = useState<Persona>("maria");
  const inUrl = new URLSearchParams(search).get("as");
  const persona = inUrl === "devon" || inUrl === "priya" || inUrl === "osei" || inUrl === "maria" ? inUrl : selected;
  const context = useMemo(() => ({ persona, setPersona: setSelected }), [persona]);
  return <AtlasContext.Provider value={context}>
    <ScientificField />
    <div className="app-frame">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Rare Disease Atlas home"><span className="brand-symbol"><Activity size={20} strokeWidth={1.7}/></span><span>rare disease <strong>atlas</strong></span></Link>
        <nav className="top-nav" aria-label="Main navigation"><Link to="/who" search={{ as: persona } as never}>How it works</Link><Link to="/search" search={{ as: persona } as never}>Explore the atlas</Link></nav>
        <Button asChild size="sm" variant="outline" className="header-action"><Link to="/search" search={{ as: persona } as never}>Start exploring <ArrowUpRight size={15}/></Link></Button>
      </header>
      <main className={path === "/" ? "home-main" : "page-main"}>{children}</main>
      <footer className="site-footer"><span>RARE DISEASE ATLAS <span className="footer-divider">/</span> DEMONSTRATION DATA</span><span>Research navigation tool, not medical advice. Discuss any next step with your care team.</span></footer>
    </div>
  </AtlasContext.Provider>;
}
