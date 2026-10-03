import { createFileRoute } from "@tanstack/react-router";
import { AtlasChat } from "@/components/atlas/atlas-chat";

export const Route = createFileRoute("/chat/$threadId")({
  validateSearch: (search: Record<string, unknown>) => ({ diseaseId: typeof search['diseaseId'] === "string" ? search['diseaseId'] : "mps-iiic" }),
  head: () => ({ meta: [{ title: "Conversation — Rare Disease Atlas" }, { name: "description", content: "A saved conversation about the illustrative rare-disease connection chart." }, { property: "og:title", content: "Atlas conversation — Rare Disease Atlas" }, { property: "og:description", content: "Explore the evidence behind illustrative atlas connections." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AtlasChat threadId={Route.useParams().threadId} diseaseId={Route.useSearch().diseaseId} />,
});