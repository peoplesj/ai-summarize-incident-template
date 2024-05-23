import { Manifest } from "deno-slack-sdk/mod.ts";
import { GenerateAIIncidentSummary } from "./functions/ai_incident_summary.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "ai-incident-summarizer5",
  description: "Summarize an incident with openAI",
  icon: "assets/default_new_app_icon.png",
  functions: [GenerateAIIncidentSummary],
  workflows: [],
  outgoingDomains: ["api.openai.com"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:history",
  ],
});
