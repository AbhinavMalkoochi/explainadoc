// File: useOpenAI.ts
// This file properly exports OpenAI functionality for the Convex application

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

// Configuration for OpenAI
// Get the API key from environment variables or throw a more helpful error message
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY environment variable is not set. Please set it in your Convex deployment."
  );
}

const openai = new OpenAI({
  apiKey,
});

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      const response = await openai.chat.completions.create({
        messages: args.messages,
        model: "gpt-3.5-turbo",
      });

      return response.choices[0].message;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to get a response from OpenAI: ${error}`);
    }
  },
});

export const streamChat = action({
  args: {
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: args.messages,
        model: "gpt-3.5-turbo",
        stream: true,
      });

      return completion;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to get a streaming response from OpenAI: ${error}`);
    }
  },
});
