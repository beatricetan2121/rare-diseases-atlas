import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import { diseases, allEdges, getNextSteps } from "@/lib/atlas";
import { createResponsesCall } from "./responses.ts";

async function userClient(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!token || !url || !key) return null;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, userId: data.user.id };
}

export async function handleAtlasChat(request: Request) {
  try {
    const auth = await userClient(request);
    if (!auth) return Response.json({ error: "Please sign in to save and ask questions." }, { status: 401 });
    const input = await request.json() as { messages?: UIMessage[]; conditionId?: string };
    const messages = input.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80 || JSON.stringify(messages).length > 120000 || messages.some(m => !m || !["user", "assistant"].includes(m.role))) return Response.json({ error: "The conversation is too long or could not be read." }, { status: 400 });
    const latest = messages.at(-1);
    if (latest?.role !== "user" || !latest.parts?.some(p => p.type === "text" && p.text.trim())) return Response.json({ error: "Please enter a question." }, { status: 400 });
    const { data: prior, error: readError } = await auth.client.from("atlas_conversations").select("messages").eq("user_id", auth.userId).maybeSingle();
    if (readError) return Response.json({ error: "Could not load your saved conversation." }, { status: 500 });
    const saved = Array.isArray(prior?.messages) ? prior.messages as unknown as UIMessage[] : [];
    if (saved.length && JSON.stringify(saved) !== JSON.stringify(messages.slice(0, -1))) return Response.json({ error: "Your conversation changed on another device. Reload before asking again." }, { status: 409 });
    const { error: saveError } = await auth.client.from("atlas_conversations").upsert({ user_id: auth.userId, messages: messages as never }, { onConflict: "user_id" });
    if (saveError) return Response.json({ error: "Could not save your question. Please try again." }, { status: 500 });
    const condition = diseases.find(d => d.id === input.conditionId);
    const partners = condition ? await getNextSteps(condition.id, "devon") : [];
    const relevantEdges = condition ? allEdges.filter(e => e.source === condition.id || e.target === condition.id) : [];
    const context = JSON.stringify({ condition: condition ? { name: condition.label, gene: condition.attributes.gene, description: condition.attributes.description } : null, connections: relevantEdges.map(e => ({ explanation: e.plain_explanation, evidence: e.evidence_type, source: e.source_name, contradicted: e.contradicted_by.length > 0, negated: e.negated })), partners: partners.map(p => ({ name: p.name, region: p.region, approach: p.approach, status: p.stage, source: p.sourceUrl })) });
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return Response.json({ error: "The assistant is not configured yet." }, { status: 503 });
    const { result, response } = createResponsesCall(request, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, model: "openai/gpt-6-astra" }, await convertToModelMessages(messages), `You are the Rare Disease Atlas evidence guide for people with no medical background. Answer briefly in everyday language. Explain words as you use them. Current atlas context: ${context}. This atlas uses ILLUSTRATIVE mock biological links, NOT verified citations. Named partner leads have public source URLs but statuses may change. Never present a mock relationship, confidence score, study, contact or treatment as verified or approved. A link between diseases does not mean a treatment transfers. Cite partner source URLs only when present; say when a source is missing. For information outside this context, say you cannot verify it here rather than invent. Do not diagnose or advise treatment; encourage questions for a care team. Do not ask for or repeat personal health or genetic report details. If asked about specific organizations, describe only those present in the context and point to the profile page for outreach.`);
    const stream = result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: false, onFinish: async ({ messages: completed }) => {
      const { error } = await auth.client.from("atlas_conversations").upsert({ user_id: auth.userId, messages: completed as never }, { onConflict: "user_id" });
      if (error) console.error("Could not save completed atlas conversation", error.message);
    }, onError: error => error instanceof Error ? error.message : "The assistant could not finish the answer." });
    return response ? await (await import("./run-id.ts")).withLovableAiGatewayRunIdHeader(stream, { getRunId: () => undefined, waitForRunId: async () => undefined }) : stream;
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("Atlas chat error", error);
    return Response.json({ error: "The assistant could not answer right now. Please try again." }, { status: 500 });
  }
}
