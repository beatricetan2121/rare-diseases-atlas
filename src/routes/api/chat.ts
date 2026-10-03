import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { authenticateChat } from "@/lib/ai/chat-auth.server";
import { atlasContext } from "@/lib/ai/atlas-context.server";
import { createResponsesCall } from "@/lib/ai/responses.server";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: async ({ request }) => {
    const auth = await authenticateChat(request);
    if (!auth) return Response.json({ message: "Sign in to save and use the atlas assistant." }, { status: 401 });
    let input: { id?: string; messages?: UIMessage[]; diseaseId?: string };
    try { input = await request.json(); } catch { return Response.json({ message: "Invalid message." }, { status: 400 }); }
    const { id, messages, diseaseId } = input;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !diseaseId || !Array.isArray(messages) || messages.length > 100 || !messages.every((m) => (m.role === "user" || m.role === "assistant") && Array.isArray(m.parts) && m.parts.every((p) => p.type === "text" || p.type === "reasoning"))) return Response.json({ message: "Invalid conversation." }, { status: 400 });
    const latest = messages.at(-1);
    if (latest?.role !== "user" || !latest.parts.some((p) => p.type === "text" && p.text.trim().length > 0 && p.text.length <= 4000)) return Response.json({ message: "Enter a question of up to 4,000 characters." }, { status: 400 });
    const { data: row, error } = await auth.supabase.from("atlas_conversations").select("messages").eq("id", id).eq("user_id", auth.userId).single();
    if (error || !row) return Response.json({ message: "Conversation not found." }, { status: 404 });
    const saved = Array.isArray(row.messages) ? row.messages as UIMessage[] : [];
    // The browser supplies only the new question; saved history is authoritative.
    const conversation = [...saved, { id: latest.id, role: "user" as const, parts: latest.parts.filter((p) => p.type === "text") }];
    const { error: saveError } = await auth.supabase.from("atlas_conversations").update({ messages: conversation as Json }).eq("id", id).eq("user_id", auth.userId);
    if (saveError) return Response.json({ message: "Could not save your question." }, { status: 500 });
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return Response.json({ message: "The atlas assistant is not configured." }, { status: 503 });
    try {
      const modelMessages = await convertToModelMessages(conversation);
      const call = createResponsesCall(request, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" }, [
        { role: "system", content: `You are the Rare Disease Atlas research guide. Explain only the supplied chart records, in clear, professional language. Distinguish curated, AI-extracted, inferred and caution links; explain dashed lines as AI-extracted, dotted as inferred. Never invent evidence, medicines, contacts, trials or real-time information. If not in the supplied data, say so. This is illustrative and not medical advice. Focus on the current condition. Chart context: ${await atlasContext(diseaseId)}` },
        ...modelMessages,
      ]);
      return await call.response({ originalMessages: conversation, onFinish: async ({ messages: completed }) => {
        const { error: persistError } = await auth.supabase.from("atlas_conversations").update({ messages: completed as Json }).eq("id", id).eq("user_id", auth.userId);
        if (persistError) console.error("Atlas conversation save failed", persistError);
      } });
    } catch (cause) {
      if (request.signal.aborted) return new Response(null, { status: 499 });
      console.error("Atlas assistant failed", cause);
      return Response.json({ message: cause instanceof Error ? cause.message : "The answer could not be generated." }, { status: 500 });
    }
  } } },
});