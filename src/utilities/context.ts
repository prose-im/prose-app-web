/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Room, RoomType, Message as CoreMessage } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import UtilitiesDate from "@/utilities/date";

/**************************************************************************
 * CONTEXT
 * ************************************************************************* */

class UtilitiesContext {
  areMessageNotificationsPermitted(
    room: Room,
    nonSelfMessage: CoreMessage | undefined
  ): boolean {
    const nowTime = Date.now(),
      selfJID = Store.$account.getSelfJID(),
      preferences = Store.$settings.notifications;

    // #1. No non-self message provided? (do not notify for messages from self!)
    if (nonSelfMessage === undefined) {
      return false;
    }

    // #2. Notifications are currently paused? (temporarily or permanently)
    if (
      (preferences.pause.until || 0) > nowTime ||
      preferences.configuration.topics === "nothing"
    ) {
      return false;
    }

    // #3. Message is not a DM, and does not contain any mention to self, and \
    //   we chose to be notified of mentions only? (ie. DMs or pseudo-DMs in \
    //   channels)
    if (
      preferences.configuration.topics === "mention" &&
      room.type !== RoomType.DirectMessage
    ) {
      const mentionOfSelf = nonSelfMessage.mentions.find(mention => {
        return mention.user.equals(selfJID);
      });

      if (mentionOfSelf === undefined) {
        return false;
      }
    }

    // #4. Message is a reply to a message of ours, but user chose not to be \
    //   notified of such replies?
    if (
      preferences.configuration.replies === false &&
      nonSelfMessage.replyTo?.sender.userID?.equals(selfJID) === true
    ) {
      return false;
    }

    // #5. Notifications are set to be delivered on week days, but it's \
    //   currently week-end?
    if (
      preferences.configuration.when.days === "weekdays" &&
      UtilitiesDate.isWeekend(nowTime) === true
    ) {
      return false;
    }

    // #6. Notifications are set not to be delivered before this hour?
    if (
      preferences.configuration.when.time.from &&
      UtilitiesDate.isTimeAfterHoursMinutes(
        nowTime,
        preferences.configuration.when.time.from
      ) === false
    ) {
      return false;
    }

    // #7. Notifications are set not to be delivered after this hour?
    if (
      preferences.configuration.when.time.from &&
      preferences.configuration.when.time.to &&
      UtilitiesDate.isTimeBeforeHoursMinutes(
        nowTime,
        preferences.configuration.when.time.to
      ) === false
    ) {
      return false;
    }

    // Notifications are permitted for context (default)
    return true;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesContext();
