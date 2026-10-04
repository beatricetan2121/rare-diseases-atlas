import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputTextarea, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { allEdges, diseases, getNode } from "@/lib/atlas";

type Turn = { role: "user" | "assistant"; text: string };
const suggestions = ["What does the dashed line mean?", "Explain the strongest connection", "Can a treatment transfer?"];

function answer(question: string, diseaseId: string) {
  const condition = diseases.find((d) => d.id === diseaseId);
  const links = allEdges.filter((edge) => edge.source === diseaseId || edge.target === diseaseId);
  const q = question.toLowerCase();
  if (/dashed|dotted|solid|legend|line/.test(q)) return "In this demonstration, a solid line marks a curated record; a dashed line marks an AI-extracted record; a dotted line marks an inferred relationship that needs review. The amber line is a caution, not evidence that a treatment transfers. Select a line on the chart to inspect its record.";
  if (/treatment|therapy|medicine|transfer|cure/.test(q)) return "No. A shared symptom or biological process does not establish that a treatment works across conditions. This demonstration does not contain verified treatment-transfer evidence. Review the source record and discuss clinical decisions with a qualified care team.";
  if (/strong|connect|relationship|evidence|source/.test(q)) {
    const edge = links.find((item) => item.evidence_type === "curated" && !item.negated) ?? links.find((item) => !item.negated);
    if (!edge) return `There are no mapped connections for ${condition?.plain_label ?? "this condition"} in this demonstration. I cannot infer one from the chart.`;
    const other = getNode(edge.source === diseaseId ? edge.target : edge.source);
    return `One illustrated connection from ${condition?.plain_label ?? "this condition"} is to ${other?.plain_label ?? "another condition"}: ${edge.plain_explanation} The line is labeled “${edge.relationship_label}” and classified as ${edge.evidence_type === "curated" ? "curated" : edge.evidence_type === "extracted" ? "AI-extracted" : "inferred"}. Its source is an illustrative mock record, not a verified scientific citation.`;
  }
  return `This test assistant only explains the sample chart for ${condition?.plain_label ?? "the selected condition"}. It cannot verify medical claims or answer questions beyond the displayed records. Try asking about a connection, a line style, or treatment transfer.`;
}

export function AtlasChatDemo({ diseaseId }: { diseaseId: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const condition = diseases.find((d) => d.id === diseaseId);
  useEffect(() => { input.current?.focus(); }, []);
  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setTurns((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: answer(trimmed, diseaseId) }]);
    setText("");
    input.current?.focus();
  }
  return <div className="chat-workspace chat-demo-workspace"><section className="chat-main"><div className="chat-main-heading"><div><Link to="/atlas/$id" params={{ id: diseaseId }} className="back-link"><ArrowLeft size={14}/> Back to chart</Link><h1>Chart assistant · test</h1><p>{condition?.label ?? "Chart"} · sample answers only</p></div><Link to="/chat" search={{ diseaseId, demo: false }} className="chat-live-link">Use live assistant →</Link></div>
    <div className="chat-dialog"><Conversation aria-label="Test conversation"><ConversationContent>{turns.length === 0 && <div className="chat-intro"><MessageCircle size={24} aria-hidden="true"/><h2>Ask about this chart</h2><p>Answers use the illustrative records shown in the map.</p></div>}{turns.map((turn, index) => <Message key={index} from={turn.role}><MessageContent><MessageResponse>{turn.text}</MessageResponse></MessageContent></Message>)}</ConversationContent><ConversationScrollButton aria-label="Scroll to latest message"/></Conversation>
      <div className="chat-suggestions" aria-label="Sample questions">{suggestions.map((suggestion) => <Button key={suggestion} type="button" variant="outline" onClick={() => ask(suggestion)}>{suggestion}</Button>)}</div>
      <div className="chat-composer"><PromptInput onSubmit={({ text: submitted }) => ask(submitted)}><PromptInputBody><PromptInputTextarea ref={input} value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about a connection…" aria-label="Ask about the test chart"/></PromptInputBody><PromptInputFooter><span>Test answers · not medical advice · not saved</span><PromptInputSubmit disabled={!text.trim()}/></PromptInputFooter></PromptInput></div>
    </div></section></div>;
}