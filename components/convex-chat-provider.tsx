"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useChat as useAIChat, UseChatHelpers } from "ai/react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { nanoid } from "nanoid";
import { VALID_MODELS, DEFAULT_MODEL } from "@/convex/modelPreferences";
import { Message } from "ai";
import { Id } from "@/convex/_generated/dataModel"; // Ensure Id type is imported if used in message types

// Define the context type
type ConvexChatContextType = {
  input: string;
  setInput: UseChatHelpers["setInput"];
  handleInputChange: UseChatHelpers["handleInputChange"];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleClearChat: () => Promise<void>; // New function for clearing chat
  chatId: string;
  convexMessages: any[]; // This will now be the locally managed displayed messages
  isLoading: boolean;
  isClearing: boolean; // Loading state for clear operation
};

const ConvexChatContext = createContext<ConvexChatContextType | null>(null);

export function ConvexChatProvider({ children }: { children: ReactNode }) {
  const [chatId, setChatId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedChatId = localStorage.getItem("currentChatId");
      return storedChatId || `chat-${nanoid()}`;
    }
    return `chat-${nanoid()}`;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentChatId", chatId);
    }
  }, [chatId]);

  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false); // State for clear operation

  const [selectedModel, setSelectedModelState] = useState<string>(DEFAULT_MODEL);

  const [input, setInput] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Get raw messages from Convex query
  const rawConvexMessages = useQuery(api.messages.list, { chatId }) || [];
  // State to hold messages actually displayed in the UI
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);

  // Sync displayed messages with raw query results, but only if not cleared
  useEffect(() => {
    // Initialize or update displayed messages based on raw query
    // If `isClearing` was just set to false after a successful clear,
    // this effect should not repopulate messages until a new one arrives
    // or the page reloads. The logic here might need refinement based on exact behavior.
    // For now, we directly set it, assuming `handleClearChat` manages the empty state.
    setDisplayedMessages(rawConvexMessages);
  }, [rawConvexMessages]);

  // Get Convex mutations
  const createMessage = useMutation(api.messages.create);
  const archiveChatMutation = useMutation(api.chat.archiveChat); // Use the new mutation

  // Override the handleSubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput) return;

    setIsLoading(true);
    let messageToSend = currentInput;
    let currentModel = selectedModel;

    console.log(`Submitting message: \"${messageToSend}\" with model: ${currentModel}`);
    setInput("");

    // Immediately add user message to displayed state for responsiveness
    const optimisticUserMessage = {
      _id: `temp-${nanoid()}` as Id<"messages">, // Temporary ID
      chatId,
      role: "user",
      text: messageToSend,
      content: messageToSend, // Ensure content field exists for display component
      createdAt: Date.now(),
      complete: false, // Mark as temporary/optimistic
      modelPreference: currentModel,
    };
    setDisplayedMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      // 1. Save the user message to Convex first
      const createdMessage = await createMessage({
        chatId,
        role: "user",
        text: messageToSend,
        complete: true,
        modelPreference: currentModel,
      });

      // Replace optimistic message with real one if needed (optional)
      setDisplayedMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticUserMessage._id
            ? { ...msg, _id: createdMessage, complete: true }
            : msg
        )
      );

      // 2. Trigger the backend action via the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: messageToSend }], // Pass only the current message
          chatId,
          // model: currentModel, // Removed - backend defaults to OpenAI
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from /api/chat:", errorData);
        // Remove optimistic message on error
        setDisplayedMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
      }
    } catch (error) {
      console.error("Error calling /api/chat:", error);
      // Remove optimistic message on error
      setDisplayedMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle clearing the chat
  const handleClearChat = async () => {
    if (displayedMessages.length === 0 || isClearing) {
      return; // No messages to clear or already clearing
    }

    console.log("Attempting to archive and clear chat...");
    setIsClearing(true);

    try {
      // Map displayed messages to the format expected by the mutation
      const messagesToArchive = displayedMessages
        .map((msg) => ({
          _id: msg._id, // Assuming _id is always present and is Id<"messages"> or temp ID
          content: msg.content,
          text: msg.text,
          role: msg.role,
          createdAt: msg.createdAt || msg._creationTime, // Use correct timestamp field
          userId: msg.userId,
          createdBy: msg.createdBy,
          chatId: msg.chatId,
          parentId: msg.parentId,
          modelPreference: msg.modelPreference,
        }))
        .filter((msg) => !msg._id.startsWith("temp-")); // Filter out temporary messages if any

      if (messagesToArchive.length > 0) {
        await archiveChatMutation({ messagesToArchive });
        console.log("Chat archived successfully.");
      }

      // Clear the displayed messages locally
      setDisplayedMessages([]);
      console.log("Displayed messages cleared locally.");
    } catch (error) {
      console.error("Failed to archive chat:", error);
      // Optionally show an error message to the user
    } finally {
      setIsClearing(false);
    }
  };

  // Combined context value
  const contextValue: ConvexChatContextType = {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    handleClearChat, // Expose the new function
    chatId,
    convexMessages: displayedMessages, // Use the locally managed state
    isLoading: isLoading || isClearing, // Combine loading states
    isClearing, // Expose clearing state if needed by UI
  };

  return <ConvexChatContext.Provider value={contextValue}>{children}</ConvexChatContext.Provider>;
}

export function useConvexChat() {
  const context = useContext(ConvexChatContext);
  if (!context) {
    throw new Error("useConvexChat must be used within a ConvexChatProvider");
  }
  return context;
}
