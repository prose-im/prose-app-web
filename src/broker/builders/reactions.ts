/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { BareJID } from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import { MessageReaction } from "@/broker/stanzas/message";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface ReactionsEmoji {
  reaction: string;
  authors: Array<string>;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerBuilderReactions {
  // XEP-0444: Message Reactions
  // https://xmpp.org/extensions/xep-0444.html

  reduce({
    to,
    from,
    messageId,
    reactions
  }: {
    to: BareJID;
    from: BareJID;
    messageId: string;
    reactions: Array<MessageReaction>;
  }): Array<ReactionsEmoji> {
    // Acquire from JID in raw format
    const fromRaw = from.toString();

    // Initialize reactions w/ existing reactions from store (ie. other users)
    const reactionsMap: { [emoji: MessageReaction]: Set<string> } = {},
      existingMessage = Store.$inbox.getMessage(to, messageId);

    if (
      existingMessage !== undefined &&
      existingMessage.reactions !== undefined &&
      existingMessage.reactions.length > 0
    ) {
      existingMessage.reactions.forEach(existingReaction => {
        // Do not include current author (as reactions will be fully re-built \
        //   for this author), this essentially lists 'other' authors.
        const otherAuthors = existingReaction.authors.filter(author => {
          return author !== fromRaw;
        });

        if (otherAuthors.length > 0) {
          reactionsMap[existingReaction.reaction as MessageReaction] = new Set(
            otherAuthors
          );
        }
      });
    }

    // Append list of reactions from this sending user
    reactions.forEach(reaction => {
      // Initialize emoji storage set?
      if (reactionsMap[reaction] === undefined) {
        reactionsMap[reaction] = new Set();
      }

      reactionsMap[reaction].add(fromRaw);
    });

    // Build final list of reactions
    const reactionEmojis: Array<ReactionsEmoji> = [];

    for (const [reactionMapEmoji, reactionMapAuthors] of Object.entries(
      reactionsMap
    )) {
      reactionEmojis.push({
        reaction: reactionMapEmoji as string,
        authors: Array.from(reactionMapAuthors)
      });
    }

    return reactionEmojis;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BrokerBuilderReactions();
