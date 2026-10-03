import { allEdges, diseases, clusters, getNextSteps } from "@/lib/atlas";

export async function atlasContext(diseaseId: string) {
  const focus = diseases.find((d) => d.id === diseaseId);
  if (!focus) return "No atlas condition found for this ID.";
  const partners = await getNextSteps(diseaseId, "maria");
  return JSON.stringify({
    notice: "These are illustrative mock records, not a live medical or trial database.",
    focus,
    clusters: clusters.map((c) => ({ id: c.id, label: c.plain_label })),
    conditions: diseases.map((d) => ({ id: d.id, label: d.plain_label, gene: d.attributes.gene, cluster: d.cluster })),
    relationships: allEdges.filter((e) => e.id !== "e-rett-counter").map((e) => ({ source: e.source, target: e.target, label: e.relationship_label, explanation: e.plain_explanation, evidence: e.evidence_type, caution: e.negated })),
    partners,
  });
}