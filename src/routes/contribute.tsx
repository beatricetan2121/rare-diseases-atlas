import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { ArrowLeft, FileUp, Info, LogIn, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { diseases } from "@/lib/atlas";
import { useAtlas } from "@/components/atlas/atlas-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contribute")({
  validateSearch: (s: Record<string, unknown>) => ({ condition: typeof s["condition"] === "string" ? s["condition"] : "mps-iiic" }),
  head: () => ({ meta: [{ title: "Contribute research — Rare Disease Atlas" }, { name: "description", content: "Clinician researchers can upload a thesis or paper to propose new connections for expert review." }, { property: "og:title", content: "Contribute research — Rare Disease Atlas" }, { property: "og:description", content: "Upload your thesis to help expand the rare-disease atlas, with every submission reviewed first." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Contribute,
});

type Submission = { id: string; title: string; condition_id: string; file_name: string; file_path: string; status: string; created_at: string };
const ACCEPT = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const schema = z.object({
  title: z.string().trim().min(3, "Add a title").max(200),
  gene: z.string().trim().max(40),
  institution: z.string().trim().max(150),
  finding: z.string().trim().min(20, "Describe the finding in at least 20 characters").max(1500),
});

function Contribute() {
  const { condition } = Route.useSearch();
  const { persona } = useAtlas();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Submission[]>([]);
  const [form, setForm] = useState({ condition, title: "", gene: diseases.find((d) => d.id === condition)?.attributes.gene ?? "", institution: "", finding: "" });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = async () => { const { data } = await supabase.from("research_submissions").select("id,title,condition_id,file_name,file_path,status,created_at").order("created_at", { ascending: false }); setItems(data ?? []); };
  useEffect(() => {
    const sync = async () => { const { data } = await supabase.auth.getUser(); setUserId(data.user?.id ?? null); setReady(true); if (data.user) void load(); };
    void sync();
    const { data: l } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") void sync(); });
    return () => l.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setDone(false);
    const parsed = schema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    if (!file) { setError("Attach your thesis or paper"); return; }
    if (!ACCEPT.includes(file.type)) { setError("Use a PDF, Word (.docx) or text file"); return; }
    if (file.size > 20 * 1024 * 1024) { setError("Files must be under 20 MB"); return; }
    if (!userId) return;
    setBusy(true);
    const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("research-uploads").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); setError("The file could not be uploaded. Please try again."); return; }
    const { error: insErr } = await supabase.from("research_submissions").insert({ user_id: userId, condition_id: form.condition, title: parsed.data.title, gene: parsed.data.gene, institution: parsed.data.institution, finding: parsed.data.finding, file_path: path, file_name: file.name });
    setBusy(false);
    if (insErr) { await supabase.storage.from("research-uploads").remove([path]); setError("Your submission could not be saved."); return; }
    setDone(true); setFile(null); setForm((f) => ({ ...f, title: "", finding: "" })); void load();
  }

  async function remove(s: Submission) {
    await supabase.storage.from("research-uploads").remove([s.file_path]);
    await supabase.from("research_submissions").delete().eq("id", s.id);
    void load();
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return <section className="content-width journey-page contribute-page">
    <Link to="/atlas/$id" params={{ id: condition }} search={{ as: persona } as never} className="back-link"><ArrowLeft size={14} /> Back to the map</Link>
    <div className="section-kicker"><span className="kicker-line" /> FOR CLINICIAN RESEARCHERS / CONTRIBUTE</div>
    <h1>Add your research<br /><em>to the atlas.</em></h1>
    <p className="page-intro">Upload a thesis, paper or preprint and describe the connection it supports. Each submission is reviewed by curators before anything appears on the map.</p>
    {!ready ? <p className="page-intro">Loading…</p> : !userId ? <div className="contribute-signin"><p>Sign in so your submissions stay linked to you and you can track their review.</p><Button onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/contribute?condition=${condition}` })}><LogIn size={15} /> Continue with Google</Button></div> :
    <div className="contribute-grid">
      <form className="contribute-form" onSubmit={submit}>
        <label>Condition<select value={form.condition} onChange={set("condition")}>{diseases.filter((d) => d.id !== "disease-z").map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
        <label>Title of thesis or paper<input value={form.title} onChange={set("title")} maxLength={200} required /></label>
        <div className="contribute-row"><label>Gene or mechanism<input value={form.gene} onChange={set("gene")} maxLength={40} /></label><label>Institution<input value={form.institution} onChange={set("institution")} maxLength={150} /></label></div>
        <label>Key finding or proposed connection<textarea value={form.finding} onChange={set("finding")} maxLength={1500} placeholder="e.g. HGSNAT variant X shows reduced lysosomal acetylation comparable to NAGLU deficiency…" required /></label>
        <label className="contribute-file"><FileUp size={20} /><span>{file ? file.name : "Attach PDF, Word or text file (max 20 MB)"}</span><input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
        {error && <p className="contribute-error">{error}</p>}
        {done && <p className="saved-state">Submitted for curator review. Thank you.</p>}
        <Button type="submit" disabled={busy}>{busy ? "Uploading…" : "Submit for review"}</Button>
        <p className="mock-note"><Info size={14} /> Only you can see your file. Reviewed findings join the map with your citation.</p>
      </form>
      <aside className="contribute-list"><span className="eyebrow">YOUR SUBMISSIONS / {items.length}</span>{items.length === 0 ? <p>No submissions yet.</p> : items.map((s) => <article key={s.id}><span className="field-label">{diseases.find((d) => d.id === s.condition_id)?.plain_label} · Pending review</span><strong>{s.title}</strong><small>{s.file_name}</small><Button variant="ghost" size="icon" aria-label={`Remove ${s.title}`} onClick={() => remove(s)}><Trash2 size={14} /></Button></article>)}</aside>
    </div>}
  </section>;
}
