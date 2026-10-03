import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleAtlasChat } = await import("@/lib/ai/chat.server");
    return handleAtlasChat(request);
  } } },
});
