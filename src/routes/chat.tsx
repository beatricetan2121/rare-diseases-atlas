import { createFileRoute } from "@tanstack/react-router";
import { AtlasChat } from "@/components/atlas/atlas-chat";

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>) => ({ diseaseId: typeof search['diseaseId'] === "string" ? search['diseaseId'] : "mps-iiic", demo: search['demo'] === true || search['demo'] === "true" }),
  head: () => ({ meta: [{ title: "Atlas research guide — Rare Disease Atlas" }, { name: "description", content: "Discuss the illustrative rare-disease connection map with the atlas research guide." }, { property: "og:title", content: "Atlas research guide — Rare Disease Atlas" }, { property: "og:description", content: "Explore the evidence behind the chart's illustrative relationships." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => { const search = Route.useSearch(); return <AtlasChat diseaseId={search.diseaseId} demo={search.demo} />; },
});