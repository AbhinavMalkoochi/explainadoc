import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// This function can be used to initialize data in your Convex database
export const setupInitialData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have data
    const existingMessages = await ctx.db.query("messages").collect();

    if (existingMessages.length === 0) {
      console.log("Initializing database with sample data...");

      // Create a sample chat
      const chatId = "sample-chat-" + Date.now();

      // Add a welcome message
      await ctx.db.insert("messages", {
        chatId,
        role: "assistant",
        text: "Welcome to the chat! How can I help you today?",
        createdAt: Date.now(),
        createdBy: "system",
        complete: true,
      });

      console.log("Sample data initialized successfully!");
    } else {
      console.log("Database already contains data, skipping initialization.");
    }
  },
});
