/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chat from "../chat.js";
import type * as directMessages from "../directMessages.js";
import type * as init from "../init.js";
import type * as messages from "../messages.js";
import type * as modelPreferences from "../modelPreferences.js";
import type * as multiModelAI from "../multiModelAI.js";
import type * as openai from "../openai.js";
import type * as useOpenAI from "../useOpenAI.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  directMessages: typeof directMessages;
  init: typeof init;
  messages: typeof messages;
  modelPreferences: typeof modelPreferences;
  multiModelAI: typeof multiModelAI;
  openai: typeof openai;
  useOpenAI: typeof useOpenAI;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
