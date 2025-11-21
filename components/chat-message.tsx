"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { useState } from "react";

// Define an extended type that includes the optional parentId from our Convex schema
type ChatMessageData = Message & {
  parentId?: string;
};

const inter = Inter({ subsets: ["latin"] });

export function ChatMessage({
  message,
  messages,
  ...props
}: {
  message: ChatMessageData;
  messages: ChatMessageData[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find parent message if this is a reply
  const parentMessage = messages.find((m) => m.id === message.parentId);

  // Check if this message has any replies
  const replies = messages.filter((m) => m.parentId === message.id);

  return (
    <div
      className={cn(
        "group relative flex items-start px-4 py-2",
        message.parentId && "ml-8",
        inter.className
      )}
      {...props}>
      <div
        className={cn(
          "max-w-4xl mx-auto flex w-full",
          message.parentId && "border-l-2 border-gray-100 pl-4"
        )}>
        <div className="flex-1 space-y-2 overflow-hidden">
          {parentMessage && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-1">
              Show parent message
            </button>
          )}

          {parentMessage && isExpanded && (
            <div className="mb-2 p-2 bg-gray-50 rounded-chat text-sm text-gray-600">
              <ReactMarkdown className="prose max-w-none break-words prose-sm">
                {parentMessage.content}
              </ReactMarkdown>
            </div>
          )}

          <div
            className={cn(
              "inline-block rounded-chat",
              message.role === "user" ? "bg-[#F6F7F9] px-4 py-2" : ""
            )}>
            <ReactMarkdown className="prose max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 prose-headings:font-normal prose-strong:font-normal">
              {message.content}
            </ReactMarkdown>
          </div>

          {replies.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
