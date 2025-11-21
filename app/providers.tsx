"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize with a fallback URL if environment variable is not set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://relaxed-elk-668.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
