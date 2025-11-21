import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Internal mutation to save AI responses directly
export const saveAIResponse = internalMutation({
  args: {
    chatId: v.string(),
    role: v.string(),
    text: v.string(),
    content: v.optional(v.string()),
    complete: v.optional(v.boolean()),
    modelPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Saving AI response to database:", args);

    // Insert the message into the database
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      text: args.text,
      content: args.content,
      complete: args.complete !== undefined ? args.complete : true,
      createdAt: Date.now(),
      modelPreference: args.modelPreference,
    });

    console.log("AI response saved with ID:", messageId);
    return messageId;
  },
});
