import openAiLogo from "@/assets/openai-logo.svg";

export function OpenAIAttribution() {
  return <span className="openai-attribution">Powered by <img src={openAiLogo} alt="OpenAI" width="72" height="20" /></span>;
}