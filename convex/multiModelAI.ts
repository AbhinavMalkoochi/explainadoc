"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";
import { VALID_MODELS } from "./modelPreferences";
import { internal } from "./_generated/api";

// System prompt for AI models
const SYSTEM_PROMPT = `
Hi, let's chat about the weather!"

Your job is to:

Provide accurate, up-to-date weather information

Explain weather conditions in simple, clear language

Help users plan their day or week based on the forecast

Offer tips based on the weather (e.g., what to wear, travel advice)

Keep the conversation light, helpful, and easy to understand

Your tone is warm, conversational, and informative. Avoid jargon unless explaining it clearly. Always focus on making weather info feel useful and approachable.
`;

// Check environment variables and log their status
console.log("Environment Variables Status:");
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "Set ✓" : "Not set ✗"}`);
console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "Set ✓" : "Not set ✗"}`);
console.log(`GROK_API_KEY: ${process.env.GROK_API_KEY ? "Set ✓" : "Not set ✗"}`);

// Initialize OpenAI client if API key is present
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI client initialized successfully");
  } else {
    console.log("OpenAI API key not found. Client not initialized.");
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

// Multi-model chat function
export const chat = action({
  args: {
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.string(),
      })
    ),
    // model: v.string(), // Removed - always use OpenAI
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // --- START ADDED LOGGING ---
    console.log("[multiModelAI.chat] Action started.");
    console.log(`[multiModelAI.chat] Received args: ${JSON.stringify(args, null, 2)}`);
    // --- END ADDED LOGGING ---

    // Always use OpenAI
    const modelToUse = "openai"; // Hardcoded to OpenAI

    console.log(`[multiModelAI.chat] Processing request for model: ${modelToUse}`);
    // console.log(`[multiModelAI.chat] Messages received:`, args.messages); // Already logged above with stringify

    try {
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Entering try block.");
      // --- END ADDED LOGGING ---

      // Add system prompt to messages
      const messagesWithSystemPrompt = [
        { role: "system", content: SYSTEM_PROMPT },
        ...args.messages,
      ];
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Prepared messages with system prompt.");
      // --- END ADDED LOGGING ---

      // Convert our messages to the format expected by OpenAI
      const adaptedMessages = messagesWithSystemPrompt.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Adapted messages for API call.");
      // --- END ADDED LOGGING ---

      // Check if required environment variable is set for OpenAI
      const requiredEnvKey = "OPENAI_API_KEY"; // Always check for OpenAI key
      // --- START ADDED LOGGING ---
      console.log(`[multiModelAI.chat] Checking required env key: ${requiredEnvKey}`);
      // --- END ADDED LOGGING ---
      if (!process.env[requiredEnvKey]) {
        console.error(
          `[multiModelAI.chat] ERROR: The required environment variable ${requiredEnvKey} is not set. Using fallback response.`
        );
        // --- START ADDED LOGGING ---
        console.log("[multiModelAI.chat] Returning fallback due to missing env var.");
        // --- END ADDED LOGGING ---
        return {
          role: "assistant" as const,
          content: `Hi there

I apologize, but I cannot process your request right now because the ${requiredEnvKey} environment variable is not set. Please configure this in your Convex deployment settings.`,
        };
      }
      // --- START ADDED LOGGING ---
      console.log(`[multiModelAI.chat] Env key ${requiredEnvKey} is present.`);
      // --- END ADDED LOGGING ---

      // Always use OpenAI handler
      console.log("[multiModelAI.chat] Calling OpenAI handler");
      const response = await handleOpenAI(adaptedMessages);

      // --- START ADDED LOGGING ---
      console.log(`[multiModelAI.chat] Response received from ${modelToUse} handler.`);
      // console.log("[multiModelAI.chat] Response details:", response); // Potentially large object
      // --- END ADDED LOGGING ---

      // If we have a chatId, save the response directly to the database
      if (args.chatId && response?.content) {
        // --- START ADDED LOGGING ---
        console.log(`[multiModelAI.chat] Saving response for chatId: ${args.chatId}`);
        // --- END ADDED LOGGING ---
        await ctx.runMutation(internal.directMessages.saveAIResponse, {
          chatId: args.chatId,
          role: "assistant",
          content: response.content,
          text: response.content,
          complete: true,
          modelPreference: modelToUse, // Save 'openai' as preference
        });
        console.log(
          `[multiModelAI.chat] Saved AI response for chat ${args.chatId} using model ${modelToUse}`
        );
      } else if (args.chatId) {
        console.error(
          "[multiModelAI.chat] ERROR: AI response content was null or empty, not saving."
        );
      } else {
        console.log("[multiModelAI.chat] No chatId provided, response not saved to DB.");
      }
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Returning response from action.");
      // --- END ADDED LOGGING ---
      return response;
    } catch (error: any) {
      // Catch specific error type
      // --- START ADDED LOGGING ---
      console.error("[multiModelAI.chat] CRITICAL ERROR in action handler:", error);
      console.error(`[multiModelAI.chat] Error Name: ${error.name}`);
      console.error(`[multiModelAI.chat] Error Message: ${error.message}`);
      console.error(`[multiModelAI.chat] Error Stack: ${error.stack}`);
      // --- END ADDED LOGGING ---

      // Generate a fallback response if there's an error
      const fallbackResponse = {
        role: "assistant",
        content: `Hi there

I'm sorry, I encountered an error while processing your request with ${modelToUse}. Please check the server logs for details. Error: ${error.message}`, // Include error message
      };

      // Save the fallback response if we have a chatId
      if (args.chatId) {
        try {
          await ctx.runMutation(internal.directMessages.saveAIResponse, {
            chatId: args.chatId,
            role: "assistant",
            content: fallbackResponse.content,
            text: fallbackResponse.content,
            complete: true,
            modelPreference: modelToUse, // Save 'openai' as preference
          });
          console.log(`[multiModelAI.chat] Saved fallback AI response for chat ${args.chatId}`);
        } catch (saveError: any) {
          console.error(
            `[multiModelAI.chat] FAILED TO SAVE FALLBACK RESPONSE for chat ${args.chatId}:`,
            saveError
          );
        }
      }
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Returning fallback response due to error.");
      // --- END ADDED LOGGING ---
      return fallbackResponse; // Return fallback even if save fails
    }
  },
});

// OpenAI handler
async function handleOpenAI(messages: Array<{ role: string; content: string }>) {
  if (!openai) {
    console.error("OpenAI client is not initialized. Check your API key.");
    return {
      role: "assistant" as const,
      content:
        "Hi there\n\nI apologize, but I'm unable to process your request right now. The OpenAI API key is not configured correctly. Please set the OPENAI_API_KEY environment variable in the Convex dashboard.",
    };
  }

  console.log("Calling OpenAI API with messages:", messages);

  try {
    // Cast the messages to the type OpenAI expects
    const response = await openai.chat.completions.create({
      messages: messages as any,
      model: "gpt-3.5-turbo",
    });

    console.log("OpenAI API response:", response.choices[0].message);
    return response.choices[0].message;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      role: "assistant" as const,
      content:
        "Hi there\n\nI apologize, but I encountered an error while processing your request. Please check that your OpenAI API key is valid and has sufficient credits.",
    };
  }
}

/* // Claude handler - mock implementation - COMMENTED OUT
async function handleClaude(messages: Array<{ role: string; content: string }>) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "Anthropic API key is not set. Please set ANTHROPIC_API_KEY in the Convex dashboard."
    );
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI apologize, but the Claude API is not configured correctly. Please set the ANTHROPIC_API_KEY environment variable in the Convex dashboard.",
    };
  }

  try {
    // This is a placeholder - in a real implementation, you would use the Anthropic API client
    console.log("Claude API call with messages:", messages);

    // For now, return a working mock response to test the flow
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI'm Claude, and I'm here to help with your coding questions. What would you like to work on today?",
    };
  } catch (error) {
    console.error("Claude API error:", error);
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI apologize, but I encountered an error while processing your request with Claude. Please check that your Anthropic API key is valid.",
    };
  }
}
*/

/* // Grok handler - mock implementation - COMMENTED OUT
async function handleGrok(messages: Array<{ role: string; content: string }>) {
  if (!process.env.GROK_API_KEY) {
    console.error("Grok API key is not set. Please set GROK_API_KEY in the Convex dashboard.");
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI apologize, but the Grok API is not configured correctly. Please set the GROK_API_KEY environment variable in the Convex dashboard.",
    };
  }

  try {
    // This is a placeholder - in a real implementation, you would use the Grok API client
    console.log("Grok API call with messages:", messages);

    // For now, return a working mock response to test the flow
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI'm Grok, ready to help with your development needs. What shall we build today?",
    };
  } catch (error) {
    console.error("Grok API error:", error);
    return {
      role: "assistant" as const,
      content:
        "Let's cook\\n\\nI apologize, but I encountered an error while processing your request with Grok. Please check that your Grok API key is valid.",
    };
  }
}
*/
