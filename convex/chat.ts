import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Import Id type if needed

// Define the structure of a single message argument, matching relevant fields
const messageArgValidator = v.object({
  _id: v.id("messages"),
  content: v.optional(v.string()),
  text: v.optional(v.string()),
  role: v.string(),
  createdAt: v.optional(v.number()), // Original creation time
  userId: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  chatId: v.optional(v.string()),
  parentId: v.optional(v.string()),
  modelPreference: v.optional(v.string()),
  // Exclude fields not needed for history or generated during archive
  // complete: v.optional(v.boolean()), // Assuming 'complete' is stateful and not archived
});

export const archiveChat = mutation({
  args: {
    messagesToArchive: v.array(messageArgValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.messagesToArchive.length === 0) {
      console.log("No messages provided to archive.");
      return null; // Nothing to do
    }

    // Generate a unique ID for this archive session
    // Using a simple timestamp + random number approach for simplicity here
    // Consider using a more robust UUID library if needed in production
    const archiveSessionId = `archive-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const archivedAt = Date.now();
    const originalMessageIdsToDelete: Id<"messages">[] = [];

    // Insert each message into the chat_history table
    for (const message of args.messagesToArchive) {
      try {
        await ctx.db.insert("chat_history", {
          originalMessageId: message._id,
          content: message.content,
          text: message.text,
          role: message.role,
          originalCreatedAt: message.createdAt,
          userId: message.userId,
          createdBy: message.createdBy,
          chatId: message.chatId,
          parentId: message.parentId,
          modelPreference: message.modelPreference,
          archiveSessionId: archiveSessionId,
          archivedAt: archivedAt,
        });
        // Collect original IDs for deletion after successful archiving
        originalMessageIdsToDelete.push(message._id);
      } catch (error) {
        console.error(`Failed to archive message ${message._id}:`, error);
        // Decide on error handling: continue, throw, log?
        // For now, log and continue to archive others.
      }
    }

    console.log(
      `Archived ${originalMessageIdsToDelete.length} messages with session ID: ${archiveSessionId}`
    );

    // Delete the original messages from the messages table
    let deletedCount = 0;
    for (const messageId of originalMessageIdsToDelete) {
      try {
        await ctx.db.delete(messageId);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete original message ${messageId}:`, error);
        // Log error and continue deleting others
      }
    }

    console.log(`Deleted ${deletedCount} original messages.`);

    return null;
  },
});
