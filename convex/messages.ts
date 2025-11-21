import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    content: v.optional(v.string()),
    text: v.optional(v.string()),
    role: v.string(),
    userId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    chatId: v.optional(v.string()),
    complete: v.optional(v.boolean()),
    parentId: v.optional(v.string()),
    modelPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      text: args.text,
      role: args.role,
      userId: args.userId,
      createdBy: args.createdBy,
      chatId: args.chatId,
      complete: args.complete,
      parentId: args.parentId,
      createdAt: Date.now(),
      modelPreference: args.modelPreference,
    });
    return messageId;
  },
});

export const list = query({
  args: {
    userId: v.optional(v.string()),
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Determine the base query based on arguments
    let finalQuery;
    if (args.userId) {
      finalQuery = ctx.db
        .query("messages")
        .withIndex("by_user", (q) => q.eq("userId", args.userId));
    } else if (args.chatId) {
      finalQuery = ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId));
    } else {
      // If neither userId nor chatId is provided, use the base table query
      finalQuery = ctx.db.query("messages");
    }

    // Order by createdAt if available, otherwise by _creationTime
    return await finalQuery.order("asc").collect();
  },
});

export const getThread = query({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_parent", (q) => q.eq("parentId", args.messageId))
      .order("asc")
      .collect();
  },
});
