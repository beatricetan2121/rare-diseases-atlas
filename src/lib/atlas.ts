import rawNodes from "@/data/nodes.json";
import rawEdges from "@/data/edges.json";

export type Persona = "maria" | "devon" | "priya" | "osei";
export type Node = (typeof rawNodes)[number];
export type Edge = (typeof rawEdges)[number];
export type Disease = Node & { type: "disease" };
const nodes = rawNodes as Node[];
const edges = rawEdges as Edge[];
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 180));
export const diseases = nodes.filter((n): n is Disease => n.type === "disease");
export const clusters = nodes.filter((n) => n.type === "cluster");
export const allEdges = edges;
export const getNode = (id: string) => nodes.find((n) => n.id === id);
export const clusterFor = (id: string) => clusters.find((c) => c.id === id);
export const edgesFor = (id: string) => edges.filter((e) => e.source === id || e.target === id);
export async function searchEntities(query: string) {
  await pause();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  return diseases.filter((n) => [n.label, n.plain_label, n.attributes.gene, ...n.synonyms].some((s) => typeof s === "string" && s.toLowerCase().includes(q)) || (terms.length > 1 && terms.every((t) => [n.label, ...n.synonyms].some((s) => s.toLowerCase().includes(t)))) || (q === "enzyme replacement" && n.cluster === "lysosomal") || (q === "gene therapy" && n.cluster === "waste"));
}
export async function getDiseaseProfile(id: string) { await pause(); return diseases.find((n) => n.id === id) ?? null; }
export async function getPatientGroups(id: string) { await pause(); return diseases.find((n) => n.id === id)?.attributes.patient_group ?? ""; }
export async function getGraph(focusId: string, _persona: Persona) { await pause(); return { nodes: diseases.filter((n) => n.id !== "disease-z" || focusId === "disease-z"), edges: focusId === "disease-z" ? [] : edges.filter((e) => e.id !== "e-rett-counter") }; }
export async function getSimilarDiseases(id: string, _persona: Persona) { await pause(); return edgesFor(id).filter((e) => !e.negated).map((e) => diseases.find((n) => n.id === (e.source === id ? e.target : e.source))).filter((n): n is Disease => Boolean(n)); }
export async function getConnectionPath(fromId: string, toId: string) { await pause(); return edges.filter((e) => [e.source, e.target].includes(fromId) && [e.source, e.target].includes(toId)); }
export async function getClusterAssets(_id: string) { await pause(); return []; }
export async function getNextSteps(_id: string, _persona: Persona) { await pause(); return []; }
export async function getFasterRoute(_id: string) { await pause(); return null; }
export async function rankClustersByApproach(_approachId: string) { await pause(); return clusters; }
export async function getPeople(_id: string) { await pause(); return []; }
export async function getEvidence(edgeIds: string[]) { await pause(); return edges.filter((e) => edgeIds.includes(e.id)); }
export async function getSearchCoverage(query: string) { await pause(); return { query, sources: ["PubMed", "ClinicalTrials.gov", "HPO", "Orphanet"].map((name) => ({ name, result: "Not connected in this demo" })) }; }
