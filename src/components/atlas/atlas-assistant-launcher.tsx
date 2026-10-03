import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AtlasAssistantLauncher({ diseaseId }: { diseaseId: string }) {
  return <div className="atlas-assistant-launcher"><Button asChild variant="outline" size="sm"><Link to="/chat" search={{ diseaseId }}><MessageCircle size={15} /> Ask about this chart</Link></Button></div>;
}