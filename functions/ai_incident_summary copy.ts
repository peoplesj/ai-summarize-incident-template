import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import OpenAI from "openai/mod.ts";

export const GenerateAIIncidentSummary = DefineFunction({
  callback_id: "ai_incident_summary",
  title: "generate a summary of an incident",
  description: "Check internal database for a user's mobile information.",
  source_file: "functions/ai_incident_summary.ts",
  input_parameters: {
    properties: {
      timestamp_of_original_message: {
        type: Schema.types.string,
        description: "details about the incident",
      },
      channel_id: {
        type: Schema.types.string,
        description: "The channel that the email was posted.",
      },
    },
    required: ["timestamp_of_original_message", "channel_id"],
  },
  output_parameters: {
    properties: {
      ai_incident_summary: {
        type: Schema.types.string,
        description: "An ai summary of the incident",
      },
      ai_incident_canvas_title: {
        type: Schema.types.string,
        description: "A title for the incident",
      },
    },
    required: ["ai_incident_summary", "ai_incident_canvas_title"],
  },
});

export default SlackFunction(
  GenerateAIIncidentSummary,
  async ({ client, inputs, env }) => {
    
    let originalMessage = "";
    let AIIncidentSummary = "";
    let canvasTitle = "";
    try {
      // Get the original message JSON
      const messageHistoryResponse = await client.conversations.history({
        channel: "<Use channel id from inputs>",
        oldest: inputs.timestamp_of_original_message,
        inclusive: true,
        limit: 1,
      });
      // Get the text from the message JSON
      originalMessage = messageHistoryResponse.messages[0].text;
      console.log("Original message:", originalMessage);

    } catch (error) {
      console.error("trying: client.conversations.history", error);
    }

    try {
      const OPEN_AI = new OpenAI({
        apiKey: "<use your API key from your .env file>",
      });

      
      const chatCompletion = await OPEN_AI.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content":
              `summarize the incident and provide answers to the following. Note that the following template format is mandatory: 
              Incident Title:
              Incident Summary:

              Incident Date:
              Incident ID:
              Reported by:
              Severity level:
              Status:
              📝 Incident Description:
              
              What happened? Explain in detail...
              🦷 Root Cause Analysis:
              
              Cause:
              Impact:
              Resolution:
              👍 What Went Well?
              
              Item 1
              Item 2
              👎 What Could Have Gone Better?
              
              Item 1
              Item 2
              Item 3`,
          },
          { "role": "user", "content": `<use the original message variable>` },
        ],
        model: "gpt-3.5-turbo",
      });
      // Get the text from the API response object
      AIIncidentSummary = chatCompletion.choices[0].message.content ?? "null";

      // Regex: match for title, grab all letters until new line / case insensitive
      const titleRegex = /title: (.+)/i;
      const regexMatch = AIIncidentSummary.match(titleRegex);

      // If regex does not match with a result generate a Title with a random timestamp 
      if (regexMatch && regexMatch.length > 1) {
        canvasTitle = regexMatch[1];
        console.log("Regex matched Title:", canvasTitle);
      } else {
        const uniqueTimestamp = Date.now();
        canvasTitle = `Incident Summary: ${uniqueTimestamp}`;
        console.log("Title not found in the text.");
      }
      console.log("AIIncidentSummary:", AIIncidentSummary);
    } catch (error) {
      console.error("trying: OPEN_AI.chat.completions.create", error);
    }

    return {
      outputs: {
        ai_incident_canvas_title: "<add the regex title variable>",
        ai_incident_summary: "<add the ai generated summary>",
      },
    };
  },
);
