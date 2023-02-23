/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type MessageID = string;
type MessageReaction = string;

enum MessageChatState {
  // User is actively participating in the chat session.
  Active = "active",
  // User has not been actively participating in the chat session.
  Composing = "composing",
  // User has effectively ended their participation in the chat session.
  Gone = "gone",
  // User is composing a message.
  Inactive = "inactive",
  // User had been composing but now has stopped.
  Paused = "paused"
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { MessageID, MessageReaction, MessageChatState };
