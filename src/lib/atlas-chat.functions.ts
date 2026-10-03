import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { UIMessage } from "ai";

export const listAtlasConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("atlas_conversations")
      .select("id, messages, updated_at").eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const messages = Array.isArray(row.messages) ? row.messages as unknown as UIMessage[] : [];
      const first = messages.find((message) => message.role === "user")?.parts.find((part) => part.type === "text");
      return { id: row.id, title: first?.type === "text" ? first.text.slice(0, 54) : "New conversation", updatedAt: row.updated_at };
    });
  });

export const createAtlasConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("atlas_conversations")
      .insert({ user_id: context.userId, messages: [] }).select("id").single();
    if (error) throw error;
    return { id: data.id };
  });

export const getAtlasConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Invalid conversation");
    const { data: row, error } = await context.supabase.from("atlas_conversations")
      .select("messages").eq("id", data.id).eq("user_id", context.userId).single();
    if (error) throw error;
    return { messages: Array.isArray(row.messages) ? row.messages : [] };
  });