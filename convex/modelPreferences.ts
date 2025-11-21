import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Valid model options
export const VALID_MODELS = ["openai", "claude", "grok"];
export const DEFAULT_MODEL = "openai";

// Get the model preference for a chat
export const getPreference = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const preference = await ctx.db
      .query("modelPreferences")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .first();

    return preference ? preference : { model: DEFAULT_MODEL };
  },
});

// Set or update the model preference
export const setPreference = mutation({
  args: {
    chatId: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate model choice
    if (!VALID_MODELS.includes(args.model)) {
      throw new Error(
        `Invalid model: ${args.model}. Valid options are: ${VALID_MODELS.join(", ")}`
      );
    }

    // Check if preference already exists
    const existing = await ctx.db
      .query("modelPreferences")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .first();

    if (existing) {
      // Update existing preference
      await ctx.db.patch(existing._id, {
        model: args.model,
        lastUpdated: Date.now(),
      });
      return existing._id;
    } else {
      // Create new preference
      return await ctx.db.insert("modelPreferences", {
        chatId: args.chatId,
        model: args.model,
        lastUpdated: Date.now(),
      });
    }
  },
});
